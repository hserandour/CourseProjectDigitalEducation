import {
  mutation,
  query,
} from "./_generated/server";

import { v } from "convex/values";

export const create = mutation({
  args: {
    pseudonym: v.string(),

    condition: v.union(
      v.literal("A"),
      v.literal("B"),
    ),
  },

  returns: v.id("participants"),

  handler: async (ctx, args) => {
    const now = Date.now();

    const participantId = await ctx.db.insert(
      "participants",
      {
        pseudonym: args.pseudonym.trim(),

        condition: args.condition,

        currentPage: 1,

        completedPages: [],

        createdAt: now,
        updatedAt: now,
      },
    );

    return participantId;
  },
});

export const get = query({
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

      page4ChatHistory: v.optional(
        v.array(
          v.object({
            role: v.union(
              v.literal("user"),
              v.literal("assistant"),
            ),
            content: v.string(),
            timestamp: v.number(),
          }),
        ),
      ),

      page5Text: v.optional(v.string()),

      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),

  handler: async (ctx, args) => {
    return await ctx.db.get(args.participantId);
  },
});

export const completePage = mutation({
  args: {
    participantId: v.id("participants"),
    page: v.number(),
    nextPage: v.number(),
  },

  returns: v.null(),

  handler: async (ctx, args) => {
    const participant = await ctx.db.get(
      args.participantId,
    );

    if (!participant) {
      throw new Error("Participant not found");
    }

    const completedPages = participant.completedPages.includes(
      args.page,
    )
      ? participant.completedPages
      : [
          ...participant.completedPages,
          args.page,
        ];

    await ctx.db.patch(
      args.participantId,
      {
        currentPage: args.nextPage,
        completedPages,
        updatedAt: Date.now(),
      },
    );

    return null;
  },
});

export const savePage4Text = mutation({
  args: {
    participantId: v.id("participants"),
    text: v.string(),
  },

  returns: v.null(),

  handler: async (ctx, args) => {
    await ctx.db.patch(
      args.participantId,
      {
        page4Text: args.text,
        updatedAt: Date.now(),
      },
    );

    return null;
  },
});

export const savePage5Text = mutation({
  args: {
    participantId: v.id("participants"),
    text: v.string(),
  },

  returns: v.null(),

  handler: async (ctx, args) => {
    await ctx.db.patch(
      args.participantId,
      {
        page5Text: args.text,
        updatedAt: Date.now(),
      },
    );

    return null;
  },
});