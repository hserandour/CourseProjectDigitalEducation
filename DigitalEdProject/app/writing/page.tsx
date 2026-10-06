"use client";

import {
  useMutation,
} from "convex/react";

import { api } from "@/convex/_generated/api";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  getParticipantId,
} from "@/lib/participant";

import {
  ParticipantGuard,
} from "@/components/experiment/ParticipantGuard";

import {
  PageNavigation,
} from "@/components/experiment/PageNavigation";

import {
  Textarea,
} from "@/components/ui/textarea";

const MAX_WORDS = 300;

function countWords(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean).length;
}

export default function WritingPage() {
  const router = useRouter();

  const participantId =
    getParticipantId();

  const saveText =
    useMutation(
      api.participants.savePage5Text,
    );

  const completePage =
    useMutation(
      api.participants.completePage,
    );

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const canContinue =
    text.trim().length > 0;

  async function handleNext() {
    if (
      !participantId ||
      !canContinue
    ) {
      return;
    }

    setLoading(true);

    try {
      await saveText({
        participantId:
          participantId as any,

        text: text.trim(),
      });

      await completePage({
        participantId:
          participantId as any,

        page: 5,
        nextPage: 6,
      });

      router.push("/quiz");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ParticipantGuard>
      <main className="mx-auto max-w-3xl p-6">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">
            Writing task
          </h1>

          <p className="text-muted-foreground">
            Write a 300 word creative short story about Skanderbeg including the following three words: 
            <ul>
              <li>Amulet</li>
              <li>Winter</li>
              <li>Sword</li>
            </ul>
          </p>

          <Textarea
            value={text}
            onChange={(event) => {
              // Block edits beyond the word limit
              if (
                countWords(
                  event.target.value,
                ) <= MAX_WORDS
              ) {
                setText(
                  event.target.value,
                );
              }
            }}
            className="min-h-[350px]"
            placeholder="Write your answer..."
          />

          <p className="text-right text-sm text-muted-foreground">
            {countWords(text)} / {MAX_WORDS} words
          </p>

          <PageNavigation
            previousHref="/task"
            nextDisabled={
              !canContinue ||
              loading
            }
            onNext={handleNext}
            nextLabel={
              loading
                ? "Saving..."
                : "I've finished"
            }
          />
        </div>
      </main>
    </ParticipantGuard>
  );
}