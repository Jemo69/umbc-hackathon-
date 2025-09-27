
import { customCtx, customQuery } from "./_generated/server";
import { v } from "convex/values";

export const isAuthenticated = customQuery({
  args: {},
  handler: async (ctx) => {
    return !!ctx.viewer;
  },
});
