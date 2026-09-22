import {
  mutation,
  query,
} from "./_generated/server";

import { v } from "convex/values";

const answerValidator = v.union(
  v.string(),
  v.array(v.string()),
);

const answersValidator = v.array(
  v.object({
    questionId: v.string(),
    answer: answerValidator,
  }),
);

export const getInitialAnswers = query({
  args: {
    participantId: v.id("participants"),
  },

  returns: v.union(
    v.object({
      _id: v.id("initialAnswers"),
      _creationTime: v.number(),
      participantId: v.id("participants"),
      pseudonym: v.string(),
      answers: answersValidator,
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),

  handler: async (ctx, args) => {
    return await ctx.db
      .query("initialAnswers")
      .withIndex(
        "by_participant",
        (q) =>
          q.eq(
            "participantId",
            args.participantId,
          ),
      )
      .first();
  },
});

export const saveInitialAnswers = mutation({
  args: {
    participantId: v.id("participants"),
    pseudonym: v.string(),
    answers: answersValidator,
  },

  returns: v.null(),

  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("initialAnswers")
      .withIndex(
        "by_participant",
        (q) =>
          q.eq(
            "participantId",
            args.participantId,
          ),
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(
        existing._id,
        {
          answers: args.answers,
          updatedAt: now,
        },
      );
    } else {
      await ctx.db.insert(
        "initialAnswers",
        {
          participantId: args.participantId,
          pseudonym: args.pseudonym,
          answers: args.answers,
          createdAt: now,
          updatedAt: now,
        },
      );
    }

    return null;
  },
});

export const saveQuizAnswers = mutation({
  args: {
    participantId: v.id("participants"),
    pseudonym: v.string(),
    answers: answersValidator,
  },

  returns: v.null(),

  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("quizAnswers")
      .withIndex(
        "by_participant",
        (q) =>
          q.eq(
            "participantId",
            args.participantId,
          ),
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(
        existing._id,
        {
          answers: args.answers,
          updatedAt: now,
        },
      );
    } else {
      await ctx.db.insert(
        "quizAnswers",
        {
          participantId: args.participantId,
          pseudonym: args.pseudonym,
          answers: args.answers,
          createdAt: now,
          updatedAt: now,
        },
      );
    }

    return null;
  },
});

export const getQuizAnswers = query({
  args: {
    participantId: v.id("participants"),
  },

  returns: v.union(
    v.object({
      _id: v.id("quizAnswers"),
      _creationTime: v.number(),
      participantId: v.id("participants"),
      pseudonym: v.string(),
      answers: answersValidator,
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),

  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizAnswers")
      .withIndex(
        "by_participant",
        (q) =>
          q.eq(
            "participantId",
            args.participantId,
          ),
      )
      .first();
  },
});

export const saveFinalAnswers = mutation({
  args: {
    participantId: v.id("participants"),
    pseudonym: v.string(),
    answers: answersValidator,
  },

  returns: v.null(),

  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("finalAnswers")
      .withIndex(
        "by_participant",
        (q) =>
          q.eq(
            "participantId",
            args.participantId,
          ),
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(
        existing._id,
        {
          answers: args.answers,
          updatedAt: now,
        },
      );
    } else {
      await ctx.db.insert(
        "finalAnswers",
        {
          participantId: args.participantId,
          pseudonym: args.pseudonym,
          answers: args.answers,
          createdAt: now,
          updatedAt: now,
        },
      );
    }

    return null;
  },
});

export const getFinalAnswers = query({
  args: {
    participantId: v.id("participants"),
  },

  returns: v.union(
    v.object({
      _id: v.id("finalAnswers"),
      _creationTime: v.number(),
      participantId: v.id("participants"),
      pseudonym: v.string(),
      answers: answersValidator,
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),

  handler: async (ctx, args) => {
    return await ctx.db
      .query("finalAnswers")
      .withIndex(
        "by_participant",
        (q) =>
          q.eq(
            "participantId",
            args.participantId,
          ),
      )
      .first();
  },
});