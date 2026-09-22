"use client";

import { useState } from "react";

import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";

import { useRouter } from "next/navigation";

import {
  saveParticipantId,
} from "@/lib/participant";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import { Label } from "@/components/ui/label";

export default function HomePage() {
  const router = useRouter();

  const createParticipant =
    useMutation(
      api.participants.create,
    );

  const [pseudonym, setPseudonym] =
    useState("");

  const [condition, setCondition] =
    useState<"A" | "B" | "">("");

  const [loading, setLoading] =
    useState(false);

  const canContinue =
    pseudonym.trim().length > 0 &&
    condition !== "";

  async function handleSubmit() {
    if (!canContinue || loading) {
      return;
    }

    setLoading(true);

    try {
      const participantId =
        await createParticipant({
          pseudonym:
            pseudonym.trim(),

          condition:
            condition as "A" | "B",
        });

      saveParticipantId(
        participantId,
      );

      router.push(
        "/questionnaire",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">
            Welcome
          </h1>

          <p className="text-muted-foreground">
            Please enter the information
            below to begin.
          </p>
        </div>

        <div className="space-y-6 rounded-xl border p-6">
          <div className="space-y-2">
            <Label>
              Pseudonym / name
            </Label>

            <Input
              value={pseudonym}
              onChange={(event) =>
                setPseudonym(
                  event.target.value,
                )
              }
              placeholder="Your pseudonym"
            />
          </div>

          <div className="space-y-3">
            <Label>
              Group
            </Label>

            <RadioGroup
              value={condition}
              onValueChange={(value) =>
                setCondition(
                  value as "A" | "B",
                )
              }
            >
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="A"
                    id="condition-a"
                  />

                  <Label htmlFor="condition-a">
                    A
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="B"
                    id="condition-b"
                  />

                  <Label htmlFor="condition-b">
                    B
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Button
            className="w-full"
            disabled={
              !canContinue ||
              loading
            }
            onClick={handleSubmit}
          >
            {loading
              ? "Starting..."
              : "Start"}
          </Button>
        </div>
      </div>
    </main>
  );
}