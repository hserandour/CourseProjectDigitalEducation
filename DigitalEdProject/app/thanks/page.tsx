"use client";

import { ParticipantGuard } from "@/components/experiment/ParticipantGuard";

export default function ThanksPage() {
  return (
    <ParticipantGuard>
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-xl text-center">
          <h1 className="text-4xl font-bold">
            Thank you!
          </h1>

          <p className="mt-4 text-muted-foreground">
            Your participation has been
            recorded successfully.
          </p>
        </div>
      </main>
    </ParticipantGuard>
  );
}