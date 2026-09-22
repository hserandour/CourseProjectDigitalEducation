"use client";

import {
  useMutation,
  useQuery,
} from "convex/react";

import { api } from "@/convex/_generated/api";

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
  Questionnaire,
} from "@/components/experiment/Questionnaire";

import {
  finalQuestions,
} from "@/lib/questions";

export default function FinalQuestionnairePage() {
  const router = useRouter();

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

  const saveAnswers =
    useMutation(
      api.questionnaires
        .saveFinalAnswers,
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
          Final questionnaire
        </h1>

        <Questionnaire
          questions={
            finalQuestions
          }
          submitLabel="Finish"
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

              page: 7,
              nextPage: 8,
            });

            router.push("/thanks");
          }}
        />
      </main>
    </ParticipantGuard>
  );
}