"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { usePathname, useRouter } from "next/navigation";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import { getParticipantId } from "@/lib/participant";

type ParticipantGuardProps = {
  children: ReactNode;
};

export function ParticipantGuard({
  children,
}: ParticipantGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] =
    useState(false);

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
    setMounted(true);
  }, []);

  /*
   * Do not render anything dependent on
   * localStorage until the browser has mounted.
   */
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  /*
   * No participant ID means the participant
   * has not registered.
   */
  if (!participantId) {
    router.replace("/");
    
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  /*
   * Convex is still loading the participant.
   */
  if (participant === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  /*
   * Participant ID exists but the participant
   * doesn't exist in Convex.
   */
  if (participant === null) {
    router.replace("/");

    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  /*
   * Prevent participants from accessing a page
   * that they have not reached yet.
   *
   * Page mapping:
   *
   * 1 = Registration
   * 2 = Questionnaire
   * 3 = Instructions
   * 4 = Task
   * 5 = Writing
   * 6 = Quiz
   * 7 = Final Questionnaire
   * 8 = Thanks
   */
  const pageMap: Record<string, number> = {
    "/questionnaire": 2,
    "/instructions": 3,
    "/task": 4,
    "/writing": 5,
    "/quiz": 6,
    "/final-questionnaire": 7,
    "/thanks": 8,
  };

  const requiredPage =
    pageMap[pathname];

  if (
    requiredPage !== undefined &&
    participant.currentPage <
      requiredPage
  ) {
    const routes: Record<
      number,
      string
    > = {
      1: "/",
      2: "/questionnaire",
      3: "/instructions",
      4: "/task",
      5: "/writing",
      6: "/quiz",
      7: "/final-questionnaire",
      8: "/thanks",
    };

    router.replace(
      routes[participant.currentPage] ??
        "/",
    );

    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}