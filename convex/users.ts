
import { mutation, query } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // If we've seen this identity before but the name has changed and is present, patch the user.
      if (identity.name && user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name });
      }
      return user._id;
    }
    // If it's a new identity, create a new user. Only include fields that are available.
    const newUser: any = {
      tokenIdentifier: identity.tokenIdentifier,
    };
    if (identity.name) newUser.name = identity.name;
    if (identity.email) newUser.email = identity.email;
    return await ctx.db.insert("users", newUser);
  },
});

export const currentUser = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();
});

// Alias for easier import
export const getCurrentUser = currentUser;

// Helper used by password.ts
export async function getUserByEmail(
  ctx: any,
  { email }: { email: string }
) {
  return await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", email))
    .unique();
}
