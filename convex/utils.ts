import { query, mutation, action, type QueryCtx, type MutationCtx, type ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

// A union for any Convex server context
type AnyCtx = QueryCtx | MutationCtx | ActionCtx;

// Get the current identity from ctx. Throws if missing for required user flows.
async function requireIdentity(ctx: AnyCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

// Returns the current user document if exists, otherwise creates it.
export async function getOrCreateUser(ctx: AnyCtx): Promise<Doc<"users">> {
  const identity = await requireIdentity(ctx);

  // Query/Mutation context has direct DB access
  if ("db" in ctx && ctx.db) {
    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user) return user as Doc<"users">;

    if (!("insert" in ctx.db)) {
      throw new Error("User not found and cannot be created in read-only context.");
    }

    const newUser: any = { tokenIdentifier: identity.tokenIdentifier };
    if (identity.name) newUser.name = identity.name;
    if (identity.email) newUser.email = identity.email;
    const userId = await ctx.db.insert("users", newUser);
    const created = await ctx.db.get(userId);
    // created must exist right after insert
    return created as Doc<"users">;
  }

  // Action context: use runQuery/runMutation to interact with DB
  if ("runQuery" in ctx && "runMutation" in ctx) {
    await ctx.runMutation(api.users.store, {} as any);
    const user = await ctx.runQuery(api.users.currentUser, {} as any);
    if (!user) throw new Error("User not found after store");
    return user as Doc<"users">;
  }

  throw new Error("Unsupported context for getOrCreateUser");
}

// Returns the current user document or null. Does not create.
export async function getCurrentUserOrNull(
  ctx: AnyCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  if ("db" in ctx && ctx.db) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    return (user as Doc<"users">) ?? null;
  }

  if ("runQuery" in ctx) {
    const user = await (ctx as ActionCtx).runQuery(api.users.currentUser, {} as any);
    return (user as Doc<"users">) ?? null;
  }

  return null;
}

// Wrapper helpers to automatically fetch user before every request
export function withUserQuery(def: {
  args?: any;
  handler: (ctx: QueryCtx, args: any, user: Doc<"users">) => any | Promise<any>;
}) {
  return query({
    args: def.args ?? {},
    handler: async (ctx, args) => {
      const user = await getOrCreateUser(ctx);
      return def.handler(ctx, args, user);
    },
  });
}

export function withOptionalUserQuery(def: {
  args?: any;
  handler: (ctx: QueryCtx, args: any, user: Doc<"users"> | null) => any | Promise<any>;
}) {
  return query({
    args: def.args ?? {},
    handler: async (ctx, args) => {
      const user = await getCurrentUserOrNull(ctx);
      return def.handler(ctx, args, user);
    },
  });
}

export function withUserMutation(def: {
  args?: any;
  handler: (ctx: MutationCtx, args: any, user: Doc<"users">) => any | Promise<any>;
}) {
  return mutation({
    args: def.args ?? {},
    handler: async (ctx, args) => {
      const user = await getOrCreateUser(ctx);
      return def.handler(ctx, args, user);
    },
  });
}

export function withOptionalUserMutation(def: {
  args?: any;
  handler: (ctx: MutationCtx, args: any, user: Doc<"users"> | null) => any | Promise<any>;
}) {
  return mutation({
    args: def.args ?? {},
    handler: async (ctx, args) => {
      const user = await getCurrentUserOrNull(ctx);
      return def.handler(ctx, args, user);
    },
  });
}

export function withUserAction(def: {
  args?: any;
  handler: (ctx: ActionCtx, args: any, user: Doc<"users">) => any | Promise<any>;
}) {
  return action({
    args: def.args ?? {},
    handler: async (ctx, args) => {
      const user = await getOrCreateUser(ctx);
      return def.handler(ctx, args, user);
    },
  });
}

export function withOptionalUserAction(def: {
  args?: any;
  handler: (ctx: ActionCtx, args: any, user: Doc<"users"> | null) => any | Promise<any>;
}) {
  return action({
    args: def.args ?? {},
    handler: async (ctx, args) => {
      const user = await getCurrentUserOrNull(ctx);
      return def.handler(ctx, args, user);
    },
  });
}
