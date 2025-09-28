"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@convex-dev/auth/react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/auth/FormInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const storeUser = useMutation(api.users.store);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setAuthError('');
    
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('flow', 'signUp');
      
      await signIn('password', formData);
      // Ensure a corresponding user document exists in our Convex users table
      await storeUser();
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your learning journey with Edutron"
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign in"
    >
      {authError && (
        <div className="rounded-m3-md bg-red-100 p-4 mb-6 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-600"
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
              <h3 className="text-sm font-medium text-red-800">{authError}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            label="Full Name"
            type="text"
            autoComplete="name"
            required
            error={errors.name?.message}
            {...register("name")}
          />

          <FormInput
            label="Email address"
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register("email")}
          />

          <FormInput
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            error={errors.password?.message}
            {...register("password")}
          />

          <FormInput
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              className="h-4 w-4 rounded border-outline bg-transparent text-primary-600 focus:ring-primary-500"
              required
            />
            <label
              htmlFor="agree-terms"
              className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Terms of Service
              </Link>
            </label>
          </div>

          <AuthButton type="submit" isLoading={isLoading} fullWidth>
            Create Account
          </AuthButton>
        </form>

      </div>
    </AuthLayout>
  );
}