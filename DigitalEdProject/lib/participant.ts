const PARTICIPANT_ID_KEY = "participantId";

export function saveParticipantId(
  participantId: string,
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    PARTICIPANT_ID_KEY,
    participantId,
  );
}

export function getParticipantId():
  | string
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    PARTICIPANT_ID_KEY,
  );
}

export function clearParticipantId() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    PARTICIPANT_ID_KEY,
  );
}