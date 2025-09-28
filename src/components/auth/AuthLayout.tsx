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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-surface-50 to-secondary-50 dark:from-primary-950 dark:via-surface-900 dark:to-secondary-950 flex items-center justify-center p-4 animate-m3-fade-in">
      <div className="w-full max-w-md">
        <div className="liquid-glass shadow-glass-lg rounded-m3-2xl p-8 m-4 border border-white/20 dark:border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-display-small font-bold text-on-surface mb-2">
              {title}
            </h1>
            <p className="text-body-large text-on-surface-variant">{subtitle}</p>
          </div>

          {children}

          <div className="mt-8 text-center text-body-medium text-on-surface-variant">
            {footerText}{" "}
            <Link
              href={footerLink}
              className="font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-300"
            >
              {footerLinkText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
