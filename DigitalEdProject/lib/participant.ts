"use client";

const PARTICIPANT_KEY =
  "experiment-participant-id";

export function saveParticipantId(
  id: string,
) {
  localStorage.setItem(
    PARTICIPANT_KEY,
    id,
  );
}

export function getParticipantId() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    PARTICIPANT_KEY,
  );
}

export function clearParticipantId() {
  localStorage.removeItem(
    PARTICIPANT_KEY,
  );
}