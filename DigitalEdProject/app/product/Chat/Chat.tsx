"use client";

import { Message } from "@/app/product/Chat/Message";
import { MessageList } from "@/app/product/Chat/MessageList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function Chat({
  participantId,
}: {
  participantId: Id<"participants">;
}) {
  const [newMessageText, setNewMessageText] = useState("");
  const messages = useQuery(
    api.chatbot.getHistory,
    {
      participantId,
    },
  );

  const sendMessage = useAction(
    api.chatbot.sendMessage,
  );

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const text = newMessageText.trim();

  if (!text) {
    return;
  }

  setNewMessageText("");

  try {
    await sendMessage({
      participantId,
      message: text,
    });
  } catch (error) {
    console.error(
      "Failed to send message:",
      error,
    );
  }
};

  return (
    <>
      <MessageList messages={messages}>
        {messages?.map((message) => (
          <Message
            key={`${message.timestamp}-${message.role}`}
            author={message.role}
            viewer={message.role}
          >
            {message.content}
          </Message>
        ))}
      </MessageList>
      <div className="border-t">
        <form onSubmit={handleSubmit} className="flex gap-2 p-4">
          <Input
            value={newMessageText}
            onChange={(event) => setNewMessageText(event.target.value)}
            placeholder="Write a message…"
          />
          <Button type="submit" disabled={newMessageText === ""}>
            Send
          </Button>
        </form>
      </div>
    </>
  );
}
