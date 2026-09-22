"use client";

import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";

import { getParticipantId } from "@/lib/participant";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { useState } from "react";

export function ReadingTask() {
  const router = useRouter();

  const participantId =
    getParticipantId();

  const saveText =
    useMutation(
      api.participants
        .savePage4Text,
    );

  const completePage =
    useMutation(
      api.participants.completePage,
    );

  const [finished, setFinished] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  async function handleFinish() {
    if (!participantId || !finished) {
      return;
    }

    setLoading(true);

    try {
      await saveText({
        participantId:
          participantId as any,

        text:
          "Condition A: participant read the assigned text.",
      });

      await completePage({
        participantId:
          participantId as any,

        page: 4,
        nextPage: 5,
      });

      router.push("/writing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">
          Reading task
        </h1>

        <div className="rounded-xl border p-6 leading-7">
          <p>
            Put the text that participant A
            needs to read here.
          </p>

          <p className="mt-4">
            This can be as long as necessary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={finished}
            onChange={(event) =>
              setFinished(
                event.target.checked,
              )
            }
          />

          <label>
            I have finished reading the
            text.
          </label>
        </div>

        <div className="flex justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={() =>
              router.push(
                "/instructions",
              )
            }
          >
            ← Previous
          </Button>

          <Button
            disabled={
              !finished || loading
            }
            onClick={handleFinish}
          >
            {loading
              ? "Saving..."
              : "I've finished →"}
          </Button>
        </div>
      </div>
    </main>
  );
}