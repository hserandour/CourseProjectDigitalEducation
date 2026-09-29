"use client";

import {
  useMutation,
  useQuery,
} from "convex/react";

import type { Id } from "@/convex/_generated/dataModel";

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
  quizQuestions,
} from "@/lib/questions";

export default function QuizPage() {
  const router = useRouter();

  const participantId =
    getParticipantId() as Id<"participants"> | null;
  
  const participant = useQuery(
    api.participants.get,
    participantId
      ? { participantId }
      : "skip",
  );

  const saveAnswers =
    useMutation(
      api.questionnaires
        .saveQuizAnswers,
    );

  const completePage =
    useMutation(
      api.participants.completePage,
    );

  return (
    <ParticipantGuard>
      <main className="mx-auto max-w-3xl p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Quiz
          </h1>
        </div>

        <Questionnaire
          questions={
            quizQuestions
          }
          submitLabel="Submit quiz"
          onSubmit={async (answers) => {
            if (!participantId) {
              return;
            }

            if (!participant) {
              return;
            }

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

              page: 6,
              nextPage: 7,
            });

            router.push(
              "/final-questionnaire",
            );
          }}
        />
      </main>
    </ParticipantGuard>
  );
}