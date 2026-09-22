"use client";

import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

type Props = {
  previousHref?: string;
  nextHref?: string;

  nextDisabled?: boolean;

  onNext?: () => Promise<void> | void;

  nextLabel?: string;
};

export function PageNavigation({
  previousHref,
  nextHref,
  nextDisabled = false,
  onNext,
  nextLabel = "Continue",
}: Props) {
  const router = useRouter();

  async function handleNext() {
    if (onNext) {
      await onNext();
    }

    if (nextHref) {
      router.push(nextHref);
    }
  }

  return (
    <div className="mt-8 flex items-center justify-between border-t pt-6">
      <div>
        {previousHref && (
          <Button
            variant="outline"
            onClick={() =>
              router.push(previousHref)
            }
          >
            ← Previous
          </Button>
        )}
      </div>

      <Button
        disabled={nextDisabled}
        onClick={handleNext}
      >
        {nextLabel} →
      </Button>
    </div>
  );
}