"""
Quiz Scoring Script
===================
Scores participant answers against a hard-coded correct-answer key
(exact strings as they appear in the Convex quiz data) and reports:
  - Per-participant score (% correct)
  - Per-question accuracy across all participants
  - Group averages by condition (A vs B)

Usage:
    python score_quiz.py --answers quiz.jsonl
    python score_quiz.py --answers quiz.jsonl --narratives documents.jsonl
    python score_quiz.py --answers quiz.jsonl --narratives documents.jsonl --output-json scores.json

The --narratives file (Convex documents export) is used to look up each
participant's condition (A/B) by matching participantId → _id.
"""

import argparse
import json
import math
import re
from collections import defaultdict

# ---------------------------------------------------------------------------
# Hard-coded correct answers
# (exact strings as they appear in the Convex quiz data)
# ---------------------------------------------------------------------------

ANSWER_KEY = {
    "quiz-q1":  "Gjergj Kastrioti",
    "quiz-q2":  "Alexander the Great",
    "quiz-q3":  "In his early life Skanderbeg was granted lands by the Ottaman sultan for his service",
    "quiz-q4":  "A black double-headed eagle on a red background",
    "quiz-q5":  "Skanderbeg was never Christian protestant during his life",
    "quiz-q6":  "More than 6000 men",
    "quiz-q7":  "Guerrilla war with mainly horseback riders",
    "quiz-q8":  "The Kingom of Naples",
    "quiz-q9":  "The pope praised his fight against the Ottamans",
    "quiz-q10": "He died of an illness",
    "quiz-q11": "They made jewlery out of his bones, believing it might bring courage",
    "quiz-q12": "As a national hero, who has multiple poems and movies made about him",
}


def load_condition_map(path: str) -> dict:
    """
    Reads a Convex narratives JSONL and returns {_id: condition}.
    Used to attach condition labels to quiz responses via participantId.
    """
    mapping = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            r = json.loads(line)
            if "_id" in r and "condition" in r:
                mapping[r["_id"]] = r["condition"]
    return mapping


# ---------------------------------------------------------------------------
# Load participant answers from documents.jsonl
# ---------------------------------------------------------------------------

def load_responses(path: str) -> list:
    with open(path, encoding="utf-8") as f:
        records = [json.loads(line) for line in f if line.strip()]
    return records


# ---------------------------------------------------------------------------
# Score one participant
# ---------------------------------------------------------------------------

def normalise(s: str) -> str:
    """Lowercase, collapse whitespace, remove punctuation for fuzzy matching."""
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9 ]", "", s)   # strip punctuation
    s = re.sub(r"\s+", " ", s)          # collapse spaces
    return s


def answers_match(given: str, correct: str) -> bool:
    """
    Two-stage match:
    1. Exact after normalisation (handles capitalisation, punctuation).
    2. Word-overlap: if ≥85% of words in the correct answer appear in the
       given answer, count as correct. This handles minor spelling variants
       like "Guerilla/Guerrilla", "jewelry/jewlery", "Ottomans/Ottamans",
       "Kingdom/Kingom" that differ by one or two characters.
    """
    gn = normalise(given)
    cn = normalise(correct)
    if gn == cn:
        return True
    # Word-overlap fallback
    g_words = set(gn.split())
    c_words  = cn.split()
    if not c_words:
        return False
    overlap = sum(1 for w in c_words if w in g_words)
    return overlap / len(c_words) >= 0.80


def score_participant(record: dict, key: dict,
                      condition_map: dict = None) -> dict:
    pseudonym      = record.get("pseudonym", "unknown")
    participant_id = record.get("participantId", record.get("_id", "?"))
    answers_list   = record.get("answers", [])

    # Resolve condition: prefer field on record, else look up via participantId
    condition = record.get("condition")
    if not condition and condition_map:
        condition = condition_map.get(participant_id)
    if not condition:
        condition = "?"

    # Build {questionId: answer} map
    given = {a["questionId"]: a["answer"] for a in answers_list}

    per_question = {}
    correct = 0
    total   = len(key)

    for qid, correct_ans in key.items():
        given_ans = given.get(qid, None)
        if given_ans is None:
            per_question[qid] = {"given": None, "correct_ans": correct_ans,
                                 "result": "missing"}
        else:
            match = answers_match(given_ans, correct_ans)
            per_question[qid] = {"given": given_ans, "correct_ans": correct_ans,
                                 "result": "correct" if match else "wrong"}
            if match:
                correct += 1

    pct = round(100 * correct / total, 1) if total > 0 else float("nan")

    return {
        "pseudonym":      pseudonym,
        "participantId":  participant_id,
        "condition":      condition,
        "correct":        correct,
        "total":          total,
        "score_pct":      pct,
        "per_question":   per_question,
    }


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def print_report(scored: list, key: dict) -> None:
    w   = 70
    bar = "─" * w

    def fmt_pct(v):
        return f"{v:.1f}%" if not (isinstance(v, float) and math.isnan(v)) else "n/a"

    # ── Per-participant table ────────────────────────────────────────────
    print()
    print("┌" + bar + "┐")
    print("│{:^{w}}│".format("QUIZ SCORES", w=w))
    print("├" + bar + "┤")
    print(f"│  {'Pseudonym':<30} {'Cond':<6} {'Score':>8}  {'Correct':>8}  │")
    print("├" + bar + "┤")

    for s in scored:
        print(f"│  {s['pseudonym'][:29]:<30} {s['condition']:<6} "
              f"{fmt_pct(s['score_pct']):>8}  "
              f"{s['correct']}/{s['total']:>7}  │")

    # ── Condition averages ───────────────────────────────────────────────
    print("├" + bar + "┤")
    cond_scores = defaultdict(list)
    for s in scored:
        cond_scores[s["condition"]].append(s["score_pct"])

    for cond in sorted(cond_scores):
        vals = [v for v in cond_scores[cond] if not math.isnan(v)]
        avg  = sum(vals) / len(vals) if vals else float("nan")
        print(f"│  {'Condition ' + cond + ' average':<36} "
              f"{fmt_pct(avg):>8}  (n={len(vals)}){'':>13}│")

    all_vals = [s["score_pct"] for s in scored if not math.isnan(s["score_pct"])]
    overall  = sum(all_vals) / len(all_vals) if all_vals else float("nan")
    print(f"│  {'Overall average':<36} "
          f"{fmt_pct(overall):>8}  (n={len(all_vals)}){'':>13}│")
    print("└" + bar + "┘")
    print()

    # ── Per-question accuracy ────────────────────────────────────────────
    print("Per-question accuracy:")
    print(f"  {'Q':<8} {'% Correct':>10}   Correct answer")
    print("  " + "─" * 68)

    for qid in sorted(key.keys(), key=lambda x: int(x.replace("quiz-q", ""))):
        results = [s["per_question"].get(qid, {}).get("result") for s in scored]
        n_correct = sum(1 for r in results if r == "correct")
        n_total   = len([r for r in results if r in ("correct", "wrong")])
        pct = round(100 * n_correct / n_total, 1) if n_total > 0 else float("nan")
        correct_ans = key[qid][:48]
        print(f"  {qid:<8} {fmt_pct(pct):>10}   {correct_ans}")

    print()

    # ── Per-participant detail ───────────────────────────────────────────
    print("Per-participant detail:")
    for s in scored:
        print(f"\n  {s['pseudonym']} [{s['condition']}] — {fmt_pct(s['score_pct'])} "
              f"({s['correct']}/{s['total']})")
        for qid in sorted(s["per_question"].keys(),
                          key=lambda x: int(x.replace("quiz-q", ""))):
            q = s["per_question"][qid]
            icon = "✓" if q["result"] == "correct" else ("?" if q["result"] == "missing" else "✗")
            given = (q["given"] or "—")[:55]
            print(f"    {icon} {qid}: {given}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Score quiz answers from a Convex export against a correct-answer key.",
    )
    parser.add_argument("--answers",     required=True,
                        help="Convex JSONL export with participant answers (quiz responses)")
    parser.add_argument("--narratives",  default=None,
                        help="Convex narratives JSONL (documents export) to look up condition per participant")
    parser.add_argument("--output-json", default=None,
                        help="Optional path to write results as JSON")
    args = parser.parse_args()

    key     = ANSWER_KEY
    records = load_responses(args.answers)

    print(f"Answer key: {len(key)} questions (hard-coded)")
    print(f"Participant records loaded: {len(records)}")

    # Load condition map if narratives file provided
    condition_map = {}
    if args.narratives:
        condition_map = load_condition_map(args.narratives)
        print(f"Condition map loaded: {len(condition_map)} entries")

    # Score each participant
    scored = [score_participant(r, key, condition_map) for r in records]

    print_report(scored, key)

    if args.output_json:
        with open(args.output_json, "w", encoding="utf-8") as f:
            json.dump(scored, f, indent=2, ensure_ascii=False)
        print(f"Results written to {args.output_json}")


if __name__ == "__main__":
    main()
