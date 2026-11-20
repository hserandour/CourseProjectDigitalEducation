"""
Text Evaluation Metrics — Convex export edition
================================================
Reads a Convex JSONL/JSON export and evaluates the `page5Text` field
(participant-written narrative) for each participant.

Five metrics, with condition-aware aggregation:

  - Semantic Diversity  → inv_hom across ALL narratives, averaged by condition
  - Surprise            → per narrative (sentence-level), averaged by condition
  - Novelty             → dominant terms (lemmatized content words), averaged by condition
  - Local Coherence     → length-stable (no normalisation needed)
  - Global Coherence    → length-stable (no normalisation needed)

Records are skipped (with a printed notice) when:
  - `page5Text` is missing or empty
  - `page5Text` has fewer than 2 sentences after splitting
  - `condition` field is missing

Usage:
    python text_eval_normalised.py --json-file documents.jsonl
    python text_eval_normalised.py --json-file documents.jsonl --output-json results.json
    python text_eval_normalised.py --json-file documents.jsonl --min-words 10
"""

import argparse
import json
import math
import sys
from collections import defaultdict
from typing import List, Dict, Optional

# ---------------------------------------------------------------------------
# Dependency check & install
# ---------------------------------------------------------------------------
def ensure_deps():
    import importlib, subprocess
    for pkg, mod in [
        ("sentence-transformers", "sentence_transformers"),
        ("numpy", "numpy"),
        ("spacy", "spacy"),
    ]:
        try:
            importlib.import_module(mod)
        except ImportError:
            print(f"Installing {pkg}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", pkg, "-q",
                                   "--break-system-packages"])
    import spacy
    if not spacy.util.is_package("en_core_web_sm"):
        print("Downloading spaCy model 'en_core_web_sm'...")
        import subprocess as sp
        sp.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm", "-q"])

ensure_deps()

import numpy as np
import spacy
from sentence_transformers import SentenceTransformer

CONTENT_POS = {"NOUN", "VERB", "ADJ", "ADV"}

_nlp = None
def get_nlp():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm", disable=["parser", "ner"])
    return _nlp

# ---------------------------------------------------------------------------
# Loading Convex export  (JSONL or JSON array)
# ---------------------------------------------------------------------------

def load_convex(path: str, min_words: int = 5) -> List[Dict]:
    """
    Reads a Convex export file (either JSONL or a JSON array).
    Extracts `page5Text`, `condition`, and `pseudonym` from each record.
    Skips records that are incomplete, missing page5Text, or too short.
    Returns a list of dicts: {"text", "condition", "pseudonym", "id"}.
    """
    with open(path, encoding="utf-8") as f:
        content = f.read().strip()

    # Detect format: JSON array starts with '[', JSONL has one object per line
    if content.startswith("["):
        raw_records = json.loads(content)
    else:
        raw_records = [json.loads(line) for line in content.splitlines() if line.strip()]

    records = []
    skipped = []

    for r in raw_records:
        rid        = r.get("_id", "?")
        pseudonym  = r.get("pseudonym", "unknown")
        condition  = r.get("condition")
        page5text  = r.get("page5Text", "").strip()

        if not condition:
            skipped.append((rid, pseudonym, "missing 'condition' field"))
            continue
        if not page5text:
            skipped.append((rid, pseudonym, "missing or empty page5Text"))
            continue
        word_count = len(page5text.split())
        if word_count < min_words:
            skipped.append((rid, pseudonym,
                            f"page5Text too short ({word_count} words < min {min_words})"))
            continue

        records.append({
            "text":      page5text,
            "condition": condition,
            "pseudonym": pseudonym,
            "id":        rid,
        })

    if skipped:
        print(f"\nSkipped {len(skipped)} record(s):")
        for rid, ps, reason in skipped:
            print(f"  [{ps} / {rid[:12]}…] {reason}")
        print()

    if not records:
        raise ValueError("No usable records found after filtering. "
                         "Check that page5Text fields contain participant narratives.")

    return records


# ---------------------------------------------------------------------------
# Core utilities
# ---------------------------------------------------------------------------

def load_model(model_name: str = "all-mpnet-base-v2") -> SentenceTransformer:
    print(f"Loading embedding model '{model_name}'...")
    return SentenceTransformer(model_name)


def embed(model: SentenceTransformer, sentences: List[str]) -> np.ndarray:
    embs = model.encode(sentences, convert_to_numpy=True, show_progress_bar=False)
    norms = np.linalg.norm(embs, axis=1, keepdims=True)
    return embs / np.maximum(norms, 1e-9)


def narrative_embedding(sentence_embeddings: np.ndarray) -> np.ndarray:
    mean = sentence_embeddings.mean(axis=0)
    norm = np.linalg.norm(mean)
    return mean / norm if norm > 1e-9 else mean


def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b))


def semdis(a: np.ndarray, b: np.ndarray) -> float:
    return 1.0 - cosine_sim(a, b)


def split_sentences(text: str) -> List[str]:
    import re
    parts = re.split(r'(?<=[.!?])\s+(?=[A-Z"])', text.strip())
    return [s.strip() for s in parts if len(s.strip()) > 5]


def dominant_terms(text: str) -> List[str]:
    nlp = get_nlp()
    doc = nlp(text)
    return [
        token.lemma_.lower()
        for token in doc
        if token.pos_ in CONTENT_POS
        and not token.is_stop
        and not token.is_punct
        and len(token.lemma_) > 1
    ]


# ---------------------------------------------------------------------------
# Metric 1 – Semantic Diversity
# ---------------------------------------------------------------------------

def semantic_diversity(narrative_embs: np.ndarray,
                       conditions: List[str]) -> Dict:
    N = len(narrative_embs)
    if N < 2:
        return {
            "semantic_diversity_overall": float("nan"),
            "semantic_diversity_by_condition": {},
            "per_narrative_sd": [],
        }

    per_narrative = []
    for i in range(N):
        dists = [semdis(narrative_embs[i], narrative_embs[j])
                 for j in range(N) if j != i]
        per_narrative.append(sum(dists) / len(dists))

    condition_scores: Dict[str, List[float]] = defaultdict(list)
    for i, cond in enumerate(conditions):
        condition_scores[cond].append(per_narrative[i])

    return {
        "semantic_diversity_overall": sum(per_narrative) / N,
        "semantic_diversity_by_condition": {
            cond: sum(s) / len(s) for cond, s in condition_scores.items()
        },
        "per_narrative_sd": per_narrative,
    }


# ---------------------------------------------------------------------------
# Metric 2 – Surprise
# ---------------------------------------------------------------------------

def surprise_single(embeddings: np.ndarray) -> float:
    n = len(embeddings)
    if n < 3:
        return float("nan")
    distances = [semdis(embeddings[i], embeddings[i - 1]) for i in range(1, n)]
    total = sum(abs(distances[i] - distances[i - 1]) for i in range(1, len(distances)))
    return (2 / (n - 1)) * total


def surprise(all_sentence_embs: List[np.ndarray], conditions: List[str]) -> Dict:
    per_narrative = [surprise_single(embs) for embs in all_sentence_embs]

    condition_scores: Dict[str, List[float]] = defaultdict(list)
    for i, cond in enumerate(conditions):
        if not math.isnan(per_narrative[i]):
            condition_scores[cond].append(per_narrative[i])

    valid = [v for v in per_narrative if not math.isnan(v)]
    return {
        "surprise_overall": sum(valid) / len(valid) if valid else float("nan"),
        "surprise_by_condition": {
            cond: sum(s) / len(s) for cond, s in condition_scores.items()
        },
        "per_narrative_surprise": per_narrative,
    }


# ---------------------------------------------------------------------------
# Metric 3 – Novelty
# ---------------------------------------------------------------------------

def density(embeddings: np.ndarray) -> float:
    n = len(embeddings)
    if n < 2:
        return 0.0
    return sum(semdis(embeddings[i], embeddings[j])
               for i in range(n) for j in range(n) if i != j) / n


def novelty(texts: List[str], conditions: List[str],
            model: SentenceTransformer) -> Dict:
    per_narrative_terms = [dominant_terms(t) for t in texts]

    per_narrative_term_embs: List[Optional[np.ndarray]] = []
    for i, terms in enumerate(per_narrative_terms):
        if len(terms) >= 2:
            per_narrative_term_embs.append(embed(model, terms))
        else:
            print(f"  Warning: narrative {i+1} has < 2 dominant terms; novelty = n/a.")
            per_narrative_term_embs.append(None)

    valid_embs = [e for e in per_narrative_term_embs if e is not None]
    if len(valid_embs) >= 2:
        d_sg = density(np.concatenate(valid_embs, axis=0))
    else:
        d_sg = float("nan")

    per_narrative = []
    for embs in per_narrative_term_embs:
        if embs is None or math.isnan(d_sg):
            per_narrative.append(float("nan"))
        else:
            per_narrative.append(2.0 * abs(density(embs) - d_sg))

    condition_scores: Dict[str, List[float]] = defaultdict(list)
    for i, cond in enumerate(conditions):
        if not math.isnan(per_narrative[i]):
            condition_scores[cond].append(per_narrative[i])

    valid = [v for v in per_narrative if not math.isnan(v)]
    return {
        "novelty_overall": sum(valid) / len(valid) if valid else float("nan"),
        "novelty_by_condition": {
            cond: sum(s) / len(s) for cond, s in condition_scores.items()
        },
        "per_narrative_novelty": per_narrative,
        "D_SG": d_sg,
    }


# ---------------------------------------------------------------------------
# Metric 4 – Local Coherence  (length-stable)
# ---------------------------------------------------------------------------

def local_coherence_per_narrative(embeddings: np.ndarray) -> float:
    n = len(embeddings)
    if n < 2:
        return float("nan")
    pairs = [abs(cosine_sim(embeddings[i], embeddings[i + 1])) for i in range(n - 1)]
    return sum(pairs) / len(pairs)


def local_coherence_aggregate(all_sentence_embs: List[np.ndarray],
                               conditions: List[str]) -> Dict:
    per_narrative = [local_coherence_per_narrative(e) for e in all_sentence_embs]

    condition_scores: Dict[str, List[float]] = defaultdict(list)
    for i, cond in enumerate(conditions):
        if not math.isnan(per_narrative[i]):
            condition_scores[cond].append(per_narrative[i])

    valid = [v for v in per_narrative if not math.isnan(v)]
    return {
        "local_coherence_overall": sum(valid) / len(valid) if valid else float("nan"),
        "local_coherence_by_condition": {
            cond: sum(s) / len(s) for cond, s in condition_scores.items()
        },
        "per_narrative_lc": per_narrative,
    }


# ---------------------------------------------------------------------------
# Metric 5 – Global Coherence  (length-stable)
# ---------------------------------------------------------------------------

def global_coherence_per_narrative(embeddings: np.ndarray) -> float:
    n = len(embeddings)
    if n < 1:
        return float("nan")
    centroid = embeddings.mean(axis=0)
    norm = np.linalg.norm(centroid)
    centroid = centroid / norm if norm > 1e-9 else centroid
    return sum(cosine_sim(embeddings[i], centroid) for i in range(n)) / n


def global_coherence_aggregate(all_sentence_embs: List[np.ndarray],
                                conditions: List[str]) -> Dict:
    per_narrative = [global_coherence_per_narrative(e) for e in all_sentence_embs]

    condition_scores: Dict[str, List[float]] = defaultdict(list)
    for i, cond in enumerate(conditions):
        if not math.isnan(per_narrative[i]):
            condition_scores[cond].append(per_narrative[i])

    valid = [v for v in per_narrative if not math.isnan(v)]
    return {
        "global_coherence_overall": sum(valid) / len(valid) if valid else float("nan"),
        "global_coherence_by_condition": {
            cond: sum(s) / len(s) for cond, s in condition_scores.items()
        },
        "per_narrative_gc": per_narrative,
    }


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

def evaluate(records: List[Dict], model_name: str = "all-mpnet-base-v2") -> Dict:
    model      = load_model(model_name)
    texts      = [r["text"]      for r in records]
    conditions = [r["condition"] for r in records]
    pseudonyms = [r.get("pseudonym", f"P{i+1}") for i, r in enumerate(records)]

    all_sentence_embs = []
    all_sentences     = []
    narrative_embs    = []

    for i, text in enumerate(texts):
        sents = split_sentences(text)
        if len(sents) < 1:
            sents = [text]  # treat whole text as one sentence
        print(f"  Narrative {i+1} [{conditions[i]} / {pseudonyms[i]}]: "
              f"{len(sents)} sentence(s)")
        embs = embed(model, sents)
        all_sentence_embs.append(embs)
        all_sentences.append(sents)
        narrative_embs.append(narrative_embedding(embs))

    narrative_embs_arr = np.stack(narrative_embs)

    return {
        "n_narratives":     len(texts),
        "n_sentences":      sum(len(s) for s in all_sentences),
        "conditions":       conditions,
        "pseudonyms":       pseudonyms,
        "narrative_sizes":  [len(s) for s in all_sentences],
        **semantic_diversity(narrative_embs_arr, conditions),
        **surprise(all_sentence_embs, conditions),
        **novelty(texts, conditions, model),
        **local_coherence_aggregate(all_sentence_embs, conditions),
        **global_coherence_aggregate(all_sentence_embs, conditions),
    }


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def print_report(results: Dict) -> None:
    w   = 66
    bar = "─" * w
    N   = results["n_narratives"]
    n   = results["n_sentences"]

    def fmt(v):
        if isinstance(v, float):
            return f"{v:.4f}" if not math.isnan(v) else "   n/a"
        return str(v)

    def section(title, overall_key, by_cond_key):
        print(f"├" + bar + "┤")
        print(f"│  {title:<64}│")
        print(f"│    {'Overall':<22} {fmt(results.get(overall_key, float('nan'))):>8}"
              f"{'':>32}│")
        for cond, score in sorted(results.get(by_cond_key, {}).items()):
            print(f"│    {'Condition ' + cond:<22} {fmt(score):>8}{'':>32}│")

    print()
    print("┌" + bar + "┐")
    print("│{:^{w}}│".format("TEXT EVALUATION REPORT", w=w))
    print("├" + bar + "┤")
    print(f"│  Narratives : {N:<4}   Total sentences : {n:<4}{'':>38}│")

    section("SEMANTIC DIVERSITY",
            "semantic_diversity_overall", "semantic_diversity_by_condition")
    section("SURPRISE",
            "surprise_overall", "surprise_by_condition")
    section("NOVELTY",
            "novelty_overall", "novelty_by_condition")
    print(f"│    {'D(S_G) corpus density':<22} "
          f"{fmt(results.get('D_SG', float('nan'))):>8}{'':>32}│")
    section("LOCAL COHERENCE",
            "local_coherence_overall", "local_coherence_by_condition")
    section("GLOBAL COHERENCE",
            "global_coherence_overall", "global_coherence_by_condition")
    print("└" + bar + "┘")
    print()

    # Per-narrative table
    per_sd  = results.get("per_narrative_sd", [])
    per_sur = results.get("per_narrative_surprise", [])
    per_nov = results.get("per_narrative_novelty", [])
    per_lc  = results.get("per_narrative_lc", [])
    per_gc  = results.get("per_narrative_gc", [])
    conds   = results.get("conditions", [])
    pseudos = results.get("pseudonyms", [])

    if per_sd:
        print("Per-narrative scores:")
        print(f"  {'#':<4} {'Cond':<6} {'Pseudonym':<14} "
              f"{'inv_hom':>8} {'Sur':>8} {'Nov':>8} {'LCoh':>8} {'GCoh':>8}")
        print("  " + "─" * 68)
        for i in range(len(per_sd)):
            cond = conds[i]   if i < len(conds)   else "?"
            ps   = pseudos[i] if i < len(pseudos) else "?"
            sd_v  = fmt(per_sd[i])  if i < len(per_sd)  else "  —"
            sur_v = fmt(per_sur[i]) if i < len(per_sur) else "  —"
            nov_v = fmt(per_nov[i]) if i < len(per_nov) else "  —"
            lc_v  = fmt(per_lc[i])  if i < len(per_lc)  else "  —"
            gc_v  = fmt(per_gc[i])  if i < len(per_gc)  else "  —"
            print(f"  {i+1:<4} {cond:<6} {ps[:13]:<14} "
                  f"{sd_v:>8} {sur_v:>8} {nov_v:>8} {lc_v:>8} {gc_v:>8}")
        print()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Evaluate participant narratives from a Convex JSONL/JSON export.\n"
                    "Reads the 'page5Text' field; skips records where it is absent or too short.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--json-file", type=str, required=True,
                        help="Convex export file (.jsonl or .json)")
    parser.add_argument("--model", type=str, default="all-mpnet-base-v2",
                        help="Sentence-transformer model (default: all-mpnet-base-v2)")
    parser.add_argument("--min-words", type=int, default=5,
                        help="Minimum word count for page5Text to be included (default: 5)")
    parser.add_argument("--output-json", type=str, default=None,
                        help="Optional path to write full results as JSON")

    args = parser.parse_args()

    print(f"Loading {args.json_file}...")
    records = load_convex(args.json_file, min_words=args.min_words)
    print(f"Loaded {len(records)} usable narrative(s).\n")

    results = evaluate(records, model_name=args.model)
    print_report(results)

    if args.output_json:
        def _clean(obj):
            if isinstance(obj, np.floating): return float(obj)
            if isinstance(obj, np.ndarray):  return obj.tolist()
            if isinstance(obj, dict):        return {k: _clean(v) for k, v in obj.items()}
            if isinstance(obj, list):        return [_clean(v) for v in obj]
            return obj
        with open(args.output_json, "w", encoding="utf-8") as f:
            json.dump(_clean(results), f, indent=2)
        print(f"Results written to {args.output_json}")


if __name__ == "__main__":
    main()
