"use client";

import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";

import { useRouter } from "next/navigation";

import { ParticipantGuard } from "@/components/experiment/ParticipantGuard";

import { PageNavigation } from "@/components/experiment/PageNavigation";

import { getParticipantId } from "@/lib/participant";

export default function InstructionsPage() {
  const router = useRouter();

  const participantId =
    getParticipantId();

  const completePage =
    useMutation(
      api.participants.completePage,
    );

  return (
    <ParticipantGuard>
      <main className="mx-auto max-w-3xl p-6">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">
            Instructions
          </h1>

          <div className="rounded-xl border p-6 leading-7">
            <p>
              This is the text that the
              participant needs to read
              before continuing.
            </p>

            <p className="mt-4">
              Replace this text with
              your actual instructions.
            </p>
          </div>

          <PageNavigation
            previousHref="/questionnaire"
            nextDisabled={!participantId}
            onNext={async () => {
              await completePage({
                participantId:
                  participantId as any,

                page: 3,
                nextPage: 4,
              });

              router.push("/task");
            }}
          />
        </div>
      </main>
    </ParticipantGuard>
  );
}