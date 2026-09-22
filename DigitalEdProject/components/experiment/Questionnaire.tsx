"use client";

import { useMemo, useState } from "react";

import {
  Question,
} from "@/lib/questions";

import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";

import {
  Label,
} from "@/components/ui/label";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import {
  Textarea,
} from "@/components/ui/textarea";

export type Answer = {
  questionId: string;
  answer: string | string[];
};

type Props = {
  questions: Question[];

  initialAnswers?: Answer[];

  submitLabel?: string;

  onSubmit: (
    answers: Answer[],
  ) => Promise<void>;
};

export function Questionnaire({
  questions,
  initialAnswers = [],
  submitLabel = "Continue",
  onSubmit,
}: Props) {
  const initialState = useMemo(() => {
    const state: Record<
      string,
      string | string[]
    > = {};

    for (const answer of initialAnswers) {
      state[answer.questionId] =
        answer.answer;
    }

    return state;
  }, [initialAnswers]);

  const [answers, setAnswers] =
    useState(initialState);

  const [submitting, setSubmitting] =
    useState(false);

  function setOpenAnswer(
    questionId: string,
    value: string,
  ) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  }

  function setSingleAnswer(
    questionId: string,
    value: string,
  ) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  }

  function toggleMcqAnswer(
    questionId: string,
    option: string,
  ) {
    setAnswers((current) => {
      const currentValue =
        current[questionId];

      const currentAnswers =
        Array.isArray(currentValue)
          ? currentValue
          : [];

      const exists =
        currentAnswers.includes(option);

      return {
        ...current,
        [questionId]: exists
          ? currentAnswers.filter(
              (item) =>
                item !== option,
            )
          : [
              ...currentAnswers,
              option,
            ],
      };
    });
  }

  function isAnswered(
    question: Question,
  ) {
    if (!question.required) {
      return true;
    }

    const answer =
      answers[question.id];

    if (
      answer === undefined ||
      answer === ""
    ) {
      return false;
    }

    if (
      Array.isArray(answer) &&
      answer.length === 0
    ) {
      return false;
    }

    return true;
  }

  const canSubmit = questions.every(
    isAnswered,
  );

  async function handleSubmit() {
    if (!canSubmit || submitting) {
      return;
    }

    const result: Answer[] =
      questions
        .filter(
          (question) =>
            answers[question.id] !==
            undefined,
        )
        .map((question) => ({
          questionId: question.id,
          answer:
            answers[question.id],
        }));

    try {
      setSubmitting(true);

      await onSubmit(result);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10">
      {questions.map(
        (question, index) => (
          <div
            key={question.id}
            className="space-y-4"
          >
            <div>
              <Label className="text-base font-medium">
                {index + 1}.{" "}
                {question.question}
              </Label>

              {question.required && (
                <span className="ml-2 text-sm text-muted-foreground">
                  Required
                </span>
              )}
            </div>

            {question.type ===
              "open" && (
              <Textarea
                value={
                  typeof answers[
                    question.id
                  ] === "string"
                    ? (answers[
                        question.id
                      ] as string)
                    : ""
                }
                onChange={(event) =>
                  setOpenAnswer(
                    question.id,
                    event.target.value,
                  )
                }
                placeholder="Your answer..."
                className="min-h-32"
              />
            )}

            {question.type ===
              "single" && (
              <RadioGroup
                value={
                  typeof answers[
                    question.id
                  ] === "string"
                    ? (answers[
                        question.id
                      ] as string)
                    : ""
                }
                onValueChange={(
                  value,
                ) =>
                  setSingleAnswer(
                    question.id,
                    value,
                  )
                }
                className="space-y-3"
              >
                {question.options.map(
                  (option) => (
                    <div
                      key={option}
                      className="flex items-center gap-3"
                    >
                      <RadioGroupItem
                        value={option}
                        id={`${question.id}-${option}`}
                      />

                      <Label
                        htmlFor={`${question.id}-${option}`}
                      >
                        {option}
                      </Label>
                    </div>
                  ),
                )}
              </RadioGroup>
            )}

            {question.type ===
              "mcq" && (
              <div className="space-y-3">
                {question.options.map(
                  (option) => {
                    const selected =
                      Array.isArray(
                        answers[
                          question.id
                        ],
                      )
                        ? (
                            answers[
                              question.id
                            ] as string[]
                          ).includes(
                            option,
                          )
                        : false;

                    return (
                      <div
                        key={option}
                        className="flex items-center gap-3"
                      >
                        <Checkbox
                          id={`${question.id}-${option}`}
                          checked={selected}
                          onCheckedChange={() =>
                            toggleMcqAnswer(
                              question.id,
                              option,
                            )
                          }
                        />

                        <Label
                          htmlFor={`${question.id}-${option}`}
                        >
                          {option}
                        </Label>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        ),
      )}

      <Button
        className="w-full"
        disabled={
          !canSubmit ||
          submitting
        }
        onClick={handleSubmit}
      >
        {submitting
          ? "Saving..."
          : submitLabel}
      </Button>
    </div>
  );
}