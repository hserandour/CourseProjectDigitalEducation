import {
  mutation,
  query,
} from "./_generated/server";

import { internal } from "./_generated/api";
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

    const participantId =
      await ctx.db.insert(
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

      completedPages:
        v.array(v.number()),

      // Page 4
      page4Text: v.optional(v.string()),

      page4StartedAt:
        v.optional(v.number()),

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

      // Page 5
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

export const completePage = mutation({
  args: {
    participantId: v.id("participants"),
    page: v.number(),
    nextPage: v.number(),
  },

  returns: v.null(),

  handler: async (ctx, args) => {
    const participant =
      await ctx.db.get(
        args.participantId,
      );

    if (!participant) {
      throw new Error(
        "Participant not found",
      );
    }

    // ADD THIS HERE
    if (
      participant.currentPage !==
      args.page
    ) {
      throw new Error(
        "Participant cannot complete a page they are not currently on",
      );
    }

    const completedPages =
      participant.completedPages.includes(
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

/*
 * Start the 10-minute Task A/B timer.
 *
 * If the timer has already been started,
 * return the original timestamp instead of
 * starting a new timer.
 */
export const startPage4 = mutation({
  args: {
    participantId:
      v.id("participants"),
  },

  returns: v.number(),

  handler: async (ctx, args) => {
    const participant =
      await ctx.db.get(
        args.participantId,
      );

    if (!participant) {
      throw new Error(
        "Participant not found",
      );
    }

    if (
      participant.currentPage !== 4
    ) {
      throw new Error(
        "Participant is not on the task page",
      );
    }

    if (participant.page4StartedAt) {
      return participant.page4StartedAt;
    }

    const now = Date.now();

    await ctx.db.patch(
      args.participantId,
      {
        page4StartedAt: now,
        updatedAt: now,
      },
    );

    // Runs only once, since page4StartedAt is
    // now set.
    if (participant.condition === "B") {
      await ctx.scheduler.runAfter(
        0,
        internal.chatbot.sendIntro,
        {
          participantId: args.participantId,
        },
      );
    }

    return now;
  },
});

/*
 * Complete Page 4 after the 10-minute
 * timer has expired.
 */
export const completePage4AfterTimeout =
  mutation({
    args: {
      participantId:
        v.id("participants"),
    },

    returns: v.null(),

    handler: async (ctx, args) => {
      const participant =
        await ctx.db.get(
          args.participantId,
        );

      if (!participant) {
        throw new Error(
          "Participant not found",
        );
      }

      if (
        participant.currentPage !== 4
      ) {
        // Already completed.
        return null;
      }

      if (
        !participant.page4StartedAt
      ) {
        throw new Error(
          "Task timer has not been started",
        );
      }

      const TASK_DURATION_MS =
        10 * 60 * 1000;

      const expiresAt =
        participant.page4StartedAt +
        TASK_DURATION_MS;

      if (Date.now() < expiresAt) {
        throw new Error(
          "The 10-minute task period has not expired yet",
        );
      }

      const completedPages =
        participant.completedPages.includes(
          4,
        )
          ? participant.completedPages
          : [
              ...participant.completedPages,
              4,
            ];

      await ctx.db.patch(
        args.participantId,
        {
          currentPage: 5,
          completedPages,
          updatedAt: Date.now(),
        },
      );

      return null;
    },
  });

export const savePage4Text = mutation({
  args: {
    participantId:
      v.id("participants"),
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
    participantId:
      v.id("participants"),
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