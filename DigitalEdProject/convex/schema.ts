import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const answerValidator = v.union(
  v.string(),
  v.array(v.string()),
);

const answerEntryValidator = v.object({
  questionId: v.string(),
  answer: answerValidator,
});

const chatMessageValidator = v.object({
  role: v.union(
    v.literal("user"),
    v.literal("assistant"),
  ),
  content: v.string(),
  timestamp: v.number(),
});

export default defineSchema({
  participants: defineTable({
    pseudonym: v.string(),

    condition: v.union(
      v.literal("A"),
      v.literal("B"),
    ),

    currentPage: v.number(),

    completedPages: v.array(v.number()),

    // Page 4
    page4StartedAt: v.optional(v.number()),

    page4Text: v.optional(v.string()),

    page4ChatHistory: v.optional(
      v.array(chatMessageValidator),
    ),

    // Page 5
    page5Text: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_pseudonym", ["pseudonym"]),

  initialAnswers: defineTable({
    participantId: v.id("participants"),
    pseudonym: v.string(),

    answers: v.array(answerEntryValidator),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_participant", ["participantId"]),

  quizAnswers: defineTable({
    participantId: v.id("participants"),
    pseudonym: v.string(),

    answers: v.array(answerEntryValidator),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_participant", ["participantId"]),

  finalAnswers: defineTable({
    participantId: v.id("participants"),
    pseudonym: v.string(),

    answers: v.array(answerEntryValidator),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_participant", ["participantId"]),
});
