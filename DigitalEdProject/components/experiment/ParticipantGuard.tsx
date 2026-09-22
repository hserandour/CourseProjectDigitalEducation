"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { getParticipantId } from "@/lib/participant";

export function ParticipantGuard({
  children,
}: {
  children: ReactNode;
}) {
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

  useEffect(() => {
    if (
      participantId &&
      participant === null
    ) {
      router.replace("/");
    }

    if (!participantId) {
      router.replace("/");
    }
  }, [
    participant,
    participantId,
    router,
  ]);

  if (!participantId) {
    return null;
  }

  if (participant === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!participant) {
    return null;
  }

  return <>{children}</>;
}