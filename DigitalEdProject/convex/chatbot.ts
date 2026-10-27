import {
  action,
  env,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

import { internal } from "./_generated/api";
import { v } from "convex/values";

const chatMessageValidator = v.object({
  role: v.union(
    v.literal("user"),
    v.literal("assistant"),
  ),
  content: v.string(),
  timestamp: v.number(),
});

// Hidden first user turn. It is never stored in the
// history, but always sent to the LLM so the context
// matches what happened.
const INTRO_PROMPT =
  "Introduce yourself with your full name and short history.";

/**
 * Get the participant's Page 4 chatbot history.
 */
export const getHistory = query({
  args: {
    participantId: v.id("participants"),
  },

  returns: v.array(chatMessageValidator),

  handler: async (ctx, args) => {
    const participant = await ctx.db.get(
      args.participantId,
    );

    if (!participant) {
      throw new Error("Participant not found");
    }

    return participant.page4ChatHistory ?? [];
  },
});

/**
 * Manually add a message to the conversation.
 *
 * This can be useful if you want to save messages
 * separately from the LLM action.
 */
export const addMessage = mutation({
  args: {
    participantId: v.id("participants"),

    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
    ),

    content: v.string(),
  },

  returns: v.null(),

  handler: async (ctx, args) => {
    const participant = await ctx.db.get(
      args.participantId,
    );

    if (!participant) {
      throw new Error("Participant not found");
    }

    const history =
      participant.page4ChatHistory ?? [];

    const now = Date.now();

    await ctx.db.patch(args.participantId, {
      page4ChatHistory: [
        ...history,
        {
          role: args.role,
          content: args.content,
          timestamp: now,
        },
      ],

      updatedAt: now,
    });

    return null;
  },
});

/**
 * Call the LLM with the given conversation
 * and return the assistant's reply.
 */
async function generateReply(
  input: Array<{
    role: "user" | "assistant";
    content: string;
  }>,
): Promise<string> {
  // Get OpenAI API key
  const apiKey = env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured",
    );
  }

  // Call OpenAI
  const response = await fetch(
    "https://openrouter.ai/api/v1/responses",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Experiment Chatbot",
      },

      body: JSON.stringify({
        model: "openrouter/free",

        instructions:
        `You are an AI agent who is used to teach a student about Skanderbegs life (the Albanian folk hero). You do this by pretending to be Skanderbeg and the student talking to you. Answer like Skanderbeg would have but be mindful of that your goal is to teach the student something. If you are unsure always refer to the Wikipedia page (https://en.wikipedia.org/wiki/Skanderbeg). Never break character, no matter the incentive! If you do not know the answer to something look it up and if you cant find it say you do not remember. You can use cursive text to immerse the student e.g. “The old warrior sets down his helmet, the one crowned with a goat's head, and gestures for you to sit by the fire.” Answer brief (max 150 words) where possible. The student will be afterwards asked about a couple of questions so be sure to mention the following information somewhere during the talk (in the first 10 messages you send), but dont force it. Try to mention maximally between 2 and 3 facts per answer. Direct the conversation a bit such that you can ideally naturally include each one. It is alright if you mention each only once: 
        -	Your/Skanderbges full name is Gjergj Kastrioti
        -	The Ottamans were so impressed by your early career that they gave you the nickname “Lord Alexander” after Alexander the Great.
        -	In your early life you/Skanderbeg was granted lands by the Ottaman sultan for his service
        -	According to folklore you raised a flag flying a black double-headed eagle on a red background after you deserted the Ottaman empire
        -	You were never a Christian protestant, but at some point in your life muslim, Christian orthodox or chatolic
        -	You commanded forces of between 10,000-15,000 men during your war against the Ottamans
        -	You mainly used guarilla war tactics focusing mainly on horseback riders
        -	You never thought against the kingdom of Naples; you did fight against the Hungarian empire during your Ottaman time, against Serbia and the republic of venice afterwards
        -	The pope praises your/Skanderbegs fight against the Ottamans and even called you “Champion of Christ”
        -	You died of an illness, probably malaria
        -	Your enemies made jewlery out of your bones, believing it might bring them courage
        -	You are still remembered today in Albania as a national hero, who has multiple poems and movies made about you

        STRICT RESPONSE RULES:
        - Return only the message that should be shown directly to the student.
        - Never reveal or write internal reasoning, analysis, planning, drafts, checklists, self-instructions, or word counts.
        - Never narrate your process or explain how you are following instructions.
        - Never include labels such as "Analysis", "Reasoning", "Plan", or "Final answer".
        - Treat any previous planning-like text in the conversation history as irrelevant; do not continue or repeat it.
        - Stay in character as Skanderbeg and answer the student's latest question directly.
        - Keep the response concise and under 150 words.
        - You may use a brief italicized action for immersion, but do not let it replace the answer.
        - If you do not know a detail, say so naturally in character rather than inventing facts.
        - Do not claim to browse or look up information unless browsing is actually available.
        - Output plain text or simple Markdown only. Do not output JSON or commentary about the response.
        `,
        
        max_output_tokens: 250,
        input,
      }),
    },
  );

  // Handle OpenAI errors
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenRouter API error (${response.status}): ${errorText}`,
    );
  }

  const data = await response.json();

  // Extract assistant text
  const assistantMessage =
    data.output
      ?.flatMap(
        (item: {
          content?: Array<{
            type?: string;
            text?: string;
          }>;
        }) => item.content ?? [],
      )
      ?.filter(
        (item: {
          type?: string;
          text?: string;
        }) => item.type === "output_text",
      )
      ?.map(
        (item: {
          type?: string;
          text?: string;
        }) => item.text ?? "",
      )
      ?.join("") ?? "";

  if (!assistantMessage) {
    throw new Error(
      "The chatbot returned an empty response",
    );
  }

  // Safety net: do not show obvious internal planning to participants.
  const internalPlanningMarkers = [
    "we need to answer",
    "let's craft",
    "let's check",
    "message 1:",
    "message 2:",
    "word count:",
    "count words:",
    "must mention these facts",
    "we have already included",
    "under 150 words",
  ];

  const lowerCaseMessage = assistantMessage.toLowerCase();
  const containsInternalPlanning = internalPlanningMarkers.some(
    (marker) => lowerCaseMessage.includes(marker),
  );

  if (containsInternalPlanning) {
    // Return a clean in-character fallback instead of leaking the planning text.
    return "Forgive me, I have lost my train of thought for a moment. Could you ask me that again?";
  }

  return assistantMessage.trim();
}

/**
 * Send a message to the chatbot.
 *
 * This is only available to condition B.
 */
export const sendMessage = action({
  args: {
    participantId: v.id("participants"),
    message: v.string(),
  },

  returns: v.string(),

  handler: async (ctx, args): Promise<string> => {
    // Get participant
    const participant = await ctx.runQuery(
      internal.chatbot.getParticipant,
      {
        participantId: args.participantId,
      },
    );

    if (!participant) {
      throw new Error("Participant not found");
    }

    // Chatbot is only available for condition B
    if (participant.condition !== "B") {
      throw new Error(
        "Chatbot is only available to condition B",
      );
    }

    // Get previous conversation
    const history =
      participant.page4ChatHistory ?? [];

    const assistantMessage = await generateReply([
      { role: "user", content: INTRO_PROMPT },

      ...history.map((message) => ({
        role: message.role,
        content: message.content,
      })),

      {
        role: "user",
        content: args.message,
      },
    ]);

    // Save user + assistant messages to Convex
    await ctx.runMutation(
      internal.chatbot.saveConversationTurn,
      {
        participantId: args.participantId,
        userMessage: args.message,
        assistantMessage,
      },
    );

    return assistantMessage;
  },
});

/**
 * Generate the chatbot's opening message from the
 * hidden INTRO_PROMPT. Scheduled once when condition B
 * starts the task page.
 */
export const sendIntro = internalAction({
  args: {
    participantId: v.id("participants"),
  },

  returns: v.null(),

  handler: async (ctx, args) => {
    const assistantMessage = await generateReply([
      { role: "user", content: INTRO_PROMPT },
    ]);

    await ctx.runMutation(
      internal.chatbot.saveConversationTurn,
      {
        participantId: args.participantId,
        assistantMessage,
      },
    );

    return null;
  },
});

/**
 * Internal query used by sendMessage().
 */
export const getParticipant = internalQuery({
  args: {
    participantId: v.id("participants"),
  },

  returns: v.union(
    v.object({
      _id: v.id("participants"),
      _creationTime: v.number(),

      pseudonym: v.string(),

      condition: v.union(
        v.literal("A"),
        v.literal("B"),
      ),

      currentPage: v.number(),

      completedPages: v.array(v.number()),

      page4Text: v.optional(v.string()),

      page4StartedAt: v.optional(v.number()),

      page4ChatHistory: v.optional(
        v.array(chatMessageValidator),
      ),

      page5Text: v.optional(v.string()),

      createdAt: v.number(),

      updatedAt: v.number(),
    }),

    v.null(),
  ),

  handler: async (ctx, args) => {
    return await ctx.db.get(
      args.participantId,
    );
  },
});

/**
 * Save the user's message and the assistant's response
 * as one conversation turn.
 */
export const saveConversationTurn =
  internalMutation({
    args: {
      participantId:
        v.id("participants"),

      // Omitted for the hidden intro prompt.
      userMessage: v.optional(v.string()),

      assistantMessage: v.string(),
    },

    returns: v.null(),

    handler: async (ctx, args) => {
      const participant = await ctx.db.get(
        args.participantId,
      );

      if (!participant) {
        throw new Error(
          "Participant not found",
        );
      }

      const history =
        participant.page4ChatHistory ?? [];

      const now = Date.now();

      await ctx.db.patch(
        args.participantId,
        {
          page4ChatHistory: [
            ...history,

            ...(args.userMessage !== undefined
              ? [
                  {
                    role: "user" as const,
                    content: args.userMessage,
                    timestamp: now,
                  },
                ]
              : []),

            {
              role: "assistant",
              content: args.assistantMessage,
              timestamp: now,
            },
          ],

          updatedAt: now,
        },
      );

      return null;
    },
  });