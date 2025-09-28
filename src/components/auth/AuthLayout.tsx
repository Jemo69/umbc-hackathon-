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
        <div className="min-h-screen bg-gradient-to-br from-background to-surface-100 dark:from-background dark:to-surface-900 flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute inset-0 z-0 motion-reduce:hidden" aria-hidden="true">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary-500/10 rounded-full filter blur-3xl motion-safe:animate-pulse"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary-500/10 rounded-full filter blur-3xl motion-safe:animate-pulse" style={{ animationDelay: '1000ms' }}></div>
            </div>
            <div className="w-full max-w-md motion-safe:animate-m3-slide-up z-10">
                <div className="bg-white/60 dark:bg-surface-950/60 backdrop-blur-glass-lg rounded-m3-2xl p-8 m-4 border border-white/30 dark:border-white/10 shadow-glass-lg">
                    <div className="text-center mb-8">
                        <h1 className="text-headline-medium font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {title}
                        </h1>
                        <p className="text-body-large text-gray-700 dark:text-gray-300">{subtitle}</p>
                    </div>

                    {children}

                    <div className="mt-8 text-center text-body-medium text-gray-700 dark:text-gray-300">
                        {footerText}{" "}
                        <Link
                            href={footerLink}
                            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-300 focus-ring rounded"
                        >
                            {footerLinkText}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
