"use client";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserByEmail } from "./users";
import { customAlphabet } from "nanoid";

const TOKEN_EXPIRY_MS = 1000 * 60 * 60; // 1 hour

// Generate a random token (e.g., "ABC123XYZ")
const generateToken = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  10
);

export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await getUserByEmail(ctx, { email });

    if (!user) {
      // To prevent email enumeration, we don't reveal if the user exists.
      // In a real app, you might log this attempt for security monitoring.
      console.log(`Password reset requested for non-existent user: ${email}`);
      return;
    }

    const token = generateToken();
    const expiry = Date.now() + TOKEN_EXPIRY_MS;

    await ctx.db.patch(user._id, {
      passwordResetToken: token,
      passwordResetExpiry: expiry,
    });

    // In a real app, you would send an email here.
    // For this mock, we'll log the reset link to the console.
    const resetLink = `${
      process.env.CONVEX_SITE_URL
    }/reset-password?token=${token}`;
    console.log(`Password reset link for ${email}: ${resetLink}`);

    return { success: true };
  },
});

export const resetPassword = mutation({
  args: { token: v.string(), password: v.string() },
  handler: async (ctx, { token, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_password_reset_token", (q) => q.eq("passwordResetToken", token))
      .first();

    if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < Date.now()) {
      throw new Error("Invalid or expired password reset token.");
    }

    // =================================================================
    // MOCK IMPLEMENTATION: Cannot update password directly.
    // The @convex-dev/auth library (v0.0.90) with the Password provider
    // does not expose a function to programmatically update a user's password.
    // This is a critical security feature that should be handled by the
    // authentication provider itself.
    //
    // In a real-world application, this would require:
    // 1. An update to the @convex-dev/auth library to support this flow.
    // 2. Switching to a different auth provider that supports password resets.
    // 3. Building a custom password authentication system from scratch.
    //
    // For the purpose of this demonstration, we are logging the action
    // and clearing the token to simulate a successful password reset.
    // =================================================================
    console.log(
      `Password for user ${user.email} would be reset to: ${password}`
    );

    // Clear the reset token to ensure it cannot be used again
    await ctx.db.patch(user._id, {
      passwordResetToken: undefined,
      passwordResetExpiry: undefined,
    });

    return { success: true };
  },
});