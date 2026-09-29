"use client";

import { useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { getParticipantId } from "@/lib/participant";

import { ParticipantGuard } from "@/components/experiment/ParticipantGuard";
import { ReadingTask } from "@/components/experiment/ReadingTask";
import { Chatbot } from "@/components/experiment/Chatbot";
import { TaskTimer } from "@/components/TaskTimer";

const TASK_DURATION_MS = 10 * 60 * 1000;

export default function TaskPage() {
  const router = useRouter();

  const participantId =
    getParticipantId() as Id<"participants"> | null;

  const participant = useQuery(
    api.participants.get,
    participantId
      ? { participantId }
      : "skip",
  );

  const startPage4 = useMutation(
    api.participants.startPage4,
  );

  const completePage4AfterTimeout =
    useMutation(
      api.participants.completePage4AfterTimeout,
    );

  // Start the timer once when the participant
  // reaches page 4.
  useEffect(() => {
    if (!participantId || !participant) {
      return;
    }

    if (participant.currentPage !== 4) {
      return;
    }

    if (participant.page4StartedAt) {
      return;
    }

    void startPage4({ participantId });
  }, [
    participantId,
    participant,
    startPage4,
  ]);

  const handleTimeUp = useCallback(async () => {
    if (!participantId || !participant?.page4StartedAt) {
      return;
    }

    const expiresAt =
      participant.page4StartedAt +
      TASK_DURATION_MS;

    // The browser timer can fire a few milliseconds
    // before the Convex server considers the timer
    // expired. Wait until the exact expiry time.
    const remaining =
      expiresAt - Date.now();

    if (remaining > 0) {
      window.setTimeout(() => {
        void handleTimeUp();
      }, remaining + 100);

      return;
    }

    try {
      await completePage4AfterTimeout({
        participantId,
      });

      router.push("/writing");
    } catch (error) {
      console.error(
        "Failed to complete Task page:",
        error,
      );
    }
  }, [
    participantId,
    participant?.page4StartedAt,
    completePage4AfterTimeout,
    router,
  ]);

  // Handle the case where the page is loaded
  // after the timer has already expired.
  useEffect(() => {
    if (!participantId || !participant) {
      return;
    }

    if (
      participant.currentPage !== 4 ||
      !participant.page4StartedAt
    ) {
      return;
    }

    const expiresAt =
      participant.page4StartedAt +
      TASK_DURATION_MS;

    const remaining =
      expiresAt - Date.now();

    if (remaining <= 0) {
      void handleTimeUp();
    }
  }, [
    participantId,
    participant,
    handleTimeUp,
  ]);

  if (!participant) {
    return (
      <ParticipantGuard>
        <div className="p-6">
          Loading...
        </div>
      </ParticipantGuard>
    );
  }

  return (
    <ParticipantGuard>
      <div className="relative">
        {participant.page4StartedAt && (
          <TaskTimer
            startedAt={
              participant.page4StartedAt
            }
            onTimeUp={handleTimeUp}
          />
        )}

        {participant.condition === "A" ? (
          <ReadingTask />
        ) : (
          <Chatbot />
        )}
      </div>
    </ParticipantGuard>
  );
}