"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FormInput } from "@/components/auth/FormInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Loader2 } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const resetPassword = useMutation(api.password.resetPassword);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setAuthError("No reset token found. Please request a new reset link.");
      return;
    }
    setIsLoading(true);
    setAuthError("");
    try {
      await resetPassword({ token, password: data.password });
      setIsSuccess(true);
    } catch (error) {
      console.error("Reset password error:", error);
      setAuthError(
        (error as Error).message ||
          "Failed to reset password. The link may be invalid or expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Password Reset"
        subtitle="Your password has been successfully updated."
        footerText=""
        footerLink="/login"
        footerLinkText="Proceed to Sign In"
      >
        <div className="text-center">
          <p className="text-body-large text-on-surface mb-6">
            You can now use your new password to log in to your account.
          </p>
          <AuthButton onClick={() => router.push("/login")} fullWidth>
            Go to Sign In
          </AuthButton>
        </div>
      </AuthLayout>
    );
  }

  if (!token) {
    return (
      <AuthLayout
        title="Invalid Link"
        subtitle="This password reset link is missing a token."
        footerText="Need help?"
        footerLink="/forgot-password"
        footerLinkText="Request a new link"
      />
    );
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Choose a new, secure password for your account."
      footerText="Remember your password?"
      footerLink="/login"
      footerLinkText="Back to Sign In"
    >
      <div className="space-y-6">
        {authError && (
          <div className="rounded-m3-md bg-red-500/10 p-4 border border-red-500/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-200">{authError}</h3>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <FormInput
            label="New Password"
            type="password"
            autoComplete="new-password"
            required
            error={errors.password?.message}
            {...register("password")}
          />
          <FormInput
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <AuthButton type="submit" isLoading={isLoading} fullWidth>
            Set New Password
          </AuthButton>
        </form>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader2 className="animate-spin" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}