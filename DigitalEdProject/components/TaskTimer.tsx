"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const TASK_DURATION_MS = 10 * 60 * 1000;

type TaskTimerProps = {
  startedAt: number;
  onTimeUp: () => void;
};

export function TaskTimer({
  startedAt,
  onTimeUp,
}: TaskTimerProps) {
  const hasTriggered = useRef(false);

  const [remainingMs, setRemainingMs] =
    useState(() =>
      Math.max(
        0,
        TASK_DURATION_MS -
          (Date.now() - startedAt),
      ),
    );

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(
        0,
        TASK_DURATION_MS -
          (Date.now() - startedAt),
      );

      setRemainingMs(remaining);

      if (
        remaining <= 0 &&
        !hasTriggered.current
      ) {
        hasTriggered.current = true;
        onTimeUp();
      }
    };

    // Update immediately when the component starts.
    updateTimer();

    // Then update every second.
    const intervalId = window.setInterval(
      updateTimer,
      1000,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [startedAt, onTimeUp]);

  const totalSeconds = Math.ceil(
    remainingMs / 1000,
  );

  const minutes = Math.floor(
    totalSeconds / 60,
  );

  const seconds = totalSeconds % 60;

  return (
    <div className="fixed right-6 top-6 z-50 rounded-lg border bg-white px-4 py-3 shadow-md">
      <div className="text-sm text-gray-500">
        Time remaining
      </div>

      <div className="font-mono text-2xl font-bold">
        {minutes}:
        {seconds
          .toString()
          .padStart(2, "0")}
      </div>
    </div>
  );
}