"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FormInput } from "@/components/auth/FormInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthLayout } from "@/components/auth/AuthLayout";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [authError, setAuthError] = useState("");
  const requestReset = useMutation(api.password.requestPasswordReset);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setAuthError("");
    try {
      await requestReset({ email: data.email });
      // We set submitted to true regardless of whether the email exists
      // to prevent email enumeration attacks.
      setIsSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      // Show a generic error to the user
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent password reset instructions"
        footerText="Remember your password?"
        footerLink="/login"
        footerLinkText="Back to sign in"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/20 mb-4">
            <svg
              className="h-6 w-6 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-body-large text-on-surface mb-4">
            We sent a password reset link to{" "}
            <strong className="font-medium">{getValues("email")}</strong>
          </p>
          <p className="text-body-small text-on-surface-variant">
            Didn't receive it? Check your spam folder.
          </p>
          <div className="mt-6">
            <AuthButton
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              fullWidth
            >
              Try a different email
            </AuthButton>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email to receive reset instructions"
      footerText="Remember your password?"
      footerLink="/login"
      footerLinkText="Back to sign in"
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
                <h3 className="text-sm font-medium text-red-200">
                  {authError}
                </h3>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <FormInput
            label="Email address"
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register("email")}
          />

          <AuthButton type="submit" isLoading={isLoading} fullWidth>
            Send reset instructions
          </AuthButton>
        </form>
      </div>
    </AuthLayout>
  );
}