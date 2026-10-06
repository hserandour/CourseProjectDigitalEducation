"use client";

import {
  useAction,
  useMutation,
  useQuery,
} from "convex/react";

import { api } from "@/convex/_generated/api";

import { useRouter } from "next/navigation";

import ReactMarkdown from "react-markdown";

import {
  getParticipantId,
} from "@/lib/participant";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { PageNavigation } from "./PageNavigation";

export function Chatbot() {
  const router = useRouter();

  const participantId =
    getParticipantId();

  const history = useQuery(
    api.chatbot.getHistory,
    participantId
      ? {
          participantId:
            participantId as any,
        }
      : "skip",
  );

  const sendMessage =
    useAction(
      api.chatbot.sendMessage,
    );

  const completePage =
    useMutation(
      api.participants.completePage,
    );

  const [message, setMessage] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [finished, setFinished] =
    useState(false);

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [history]);

  async function handleSend() {
    if (
      !participantId ||
      !message.trim() ||
      sending
    ) {
      return;
    }

    const text = message.trim();

    setMessage("");
    setSending(true);

    try {
      await sendMessage({
        participantId:
          participantId as any,

        message: text,
      });
    } finally {
      setSending(false);
    }
  }

  async function handleFinish() {
    if (
      !participantId ||
      !finished
    ) {
      return;
    }

    await completePage({
      participantId:
        participantId as any,

      page: 4,
      nextPage: 5,
    });

    router.push("/writing");
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Chat
          </h1>

          <p className="text-muted-foreground">
            Interact with the chatbot
            according to the instructions.
          </p>
        </div>

        <div className="h-[500px] overflow-y-auto rounded-xl border p-4">
          <div className="space-y-4">
            {history?.map(
              (item, index) => (
                <div
                  key={index}
                  className={
                    item.role === "user"
                      ? "ml-auto max-w-[80%] rounded-xl bg-primary p-3 text-primary-foreground"
                      : "mr-auto max-w-[80%] space-y-2 rounded-xl bg-muted p-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                  }
                >
                  {item.role === "user" ? (
                    item.content
                  ) : (
                    <ReactMarkdown>
                      {item.content}
                    </ReactMarkdown>
                  )}
                </div>
              ),
            )}

            {/* Empty history = intro still generating */}
            {(sending ||
              history?.length === 0) && (
              <div className="mr-auto rounded-xl bg-muted p-3">
                Thinking...
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            value={message}
            disabled={sending}
            onChange={(event) =>
              setMessage(
                event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                handleSend();
              }
            }}
            placeholder="Write a message..."
          />

          <Button
            disabled={
              sending ||
              !message.trim()
            }
            onClick={handleSend}
          >
            Send
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={finished}
            onChange={(event) =>
              setFinished(
                event.target.checked,
              )
            }
          />

          <label>
            I have finished interacting
            with the chatbot.
          </label>
        </div>

        <PageNavigation
          previousHref="/instructions"
          nextDisabled={!finished}
          onNext={handleFinish}
          nextLabel="I've finished"
        />
      </div>
    </main>
  );
}