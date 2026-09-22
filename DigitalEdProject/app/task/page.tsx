"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import { getParticipantId } from "@/lib/participant";

import { ParticipantGuard } from "@/components/experiment/ParticipantGuard";

import { ReadingTask } from "@/components/experiment/ReadingTask";

import { Chatbot } from "@/components/experiment/Chatbot";

export default function TaskPage() {
  const participantId =
    getParticipantId();

  const participant = useQuery(
    api.participants.get,
    participantId
      ? {
          participantId:
            participantId as any,
        }
      : "skip",
  );

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
      {participant.condition ===
      "A" ? (
        <ReadingTask />
      ) : (
        <Chatbot />
      )}
    </ParticipantGuard>
  );
}