"use client";

import { Chat } from "@/app/product/Chat/Chat";
import { ChatIntro } from "@/app/product/Chat/ChatIntro";
import { UserMenu } from "@/components/UserMenu";
import { getParticipantId } from "@/lib/participant";
import type { Id } from "@/convex/_generated/dataModel";

export default function ProductPage() {
  const participantId =
    getParticipantId() as Id<"participants"> | null;

  if (!participantId) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p>Participant not found.</p>
      </main>
    );
  }

  return (
    <main className="flex max-h-screen grow flex-col overflow-hidden">
      <div className="flex items-start justify-between border-b p-4">
        <ChatIntro />
        <UserMenu>Participant</UserMenu>
      </div>

      <Chat participantId={participantId} />
    </main>
  );
}

