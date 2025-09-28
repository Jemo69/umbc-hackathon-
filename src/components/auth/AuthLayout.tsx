import { ReactNode } from 'react';
import Link from 'next/link';

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
};

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLink,
  footerLinkText,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          
          <div className="space-y-6">
            {children}
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            {footerText}{' '}
            <Link 
              href={footerLink}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {footerLinkText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
