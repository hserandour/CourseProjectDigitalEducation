"use client";

import {
  useMutation,
  useQuery,
} from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { Questionnaire } from "@/components/experiment/Questionnaire";

import { initialQuestions } from "@/lib/questions";

import { ParticipantGuard } from "@/components/experiment/ParticipantGuard";

import { getParticipantId } from "@/lib/participant";

import { useRouter } from "next/navigation";

export default function QuestionnairePage() {
  const router = useRouter();

  const participantId =
    getParticipantId() as Id<"participants"> | null;

  const participant = useQuery(
    api.participants.get,
    participantId
      ? {
          participantId,
        }
      : "skip",
  );

  const saveAnswers =
    useMutation(
      api.questionnaires
        .saveInitialAnswers,
    );

  const completePage =
    useMutation(
      api.participants.completePage,
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
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-8 text-3xl font-bold">
          Questionnaire
        </h1>

        <Questionnaire
          questions={initialQuestions}
          onSubmit={async (answers) => {
            await saveAnswers({
              participantId:
                participant._id,

              pseudonym:
                participant.pseudonym,

              answers,
            });

            await completePage({
              participantId:
                participant._id,

              page: 2,
              nextPage: 3,
            });

            router.push(
              "/instructions",
            );
          }}
        />
      </main>
    </ParticipantGuard>
  );
}