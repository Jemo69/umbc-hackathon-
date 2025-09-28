"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CheckSquare,
  FileText,
  MessageSquare,
  Upload,
  Sparkles,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";
import { useState } from "react";
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser);
  const isAuthenticated = !!user;

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Overview and insights",
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
      description: "Manage assignments",
    },
    {
      name: "Notes",
      href: "/notes",
      icon: FileText,
      description: "Organize knowledge",
    },
    {
      name: "AI Chat",
      href: "/chat",
      icon: MessageSquare,
      description: "Get AI assistance",
    },
    {
      name: "Documents",
      href: "/documents",
      icon: Upload,
      description: "Upload and analyze",
    },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  // Don't show navigation if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed top-4 left-4 z-40">
        <div className="liquid-glass p-2 rounded-m3-xl border border-surface-200 backdrop-blur-lg">
          <div className="flex flex-col space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center space-x-3 px-3 py-2 rounded-m3-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? "m3-primary text-white"
                      : "hover:bg-surface-100 text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="hidden group-hover:block absolute left-full ml-2 top-1/2 transform -translate-y-1/2">
                    <div className="liquid-glass px-3 py-2 rounded-m3-lg border border-surface-200 whitespace-nowrap">
                      <div className="text-body-medium font-medium text-on-surface">
                        {item.name}
                      </div>
                      <div className="text-body-small text-on-surface-variant">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-3 liquid-glass rounded-m3-lg border border-surface-200 backdrop-blur-lg"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-on-surface" />
          ) : (
            <Menu className="w-5 h-5 text-on-surface" />
          )}
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed top-4 left-4 right-4 z-50 liquid-glass p-6 rounded-m3-xl border border-surface-200 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 m3-primary rounded-m3-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-headline-small font-medium text-on-surface">
                    Edutron
                  </h2>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-m3-lg hover:bg-surface-100 transition-colors"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-m3-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? "m3-primary text-white"
                          : "hover:bg-surface-100 text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <div className="text-body-large font-medium">
                          {item.name}
                        </div>
                        <div className="text-body-small opacity-75">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {/* User info and logout for mobile */}
                {isAuthenticated && (
                  <>
                    <div className="border-t border-surface-200 pt-4 mt-4">
                      <div className="px-4 py-2 mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-body-medium font-medium text-on-surface">
                              {user?.name || 'User'}
                            </p>
                            <p className="text-body-small text-on-surface-variant">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-m3-lg hover:bg-surface-100 text-on-surface-variant hover:text-on-surface transition-all duration-200 w-full text-left"
                      >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <div className="text-body-large font-medium">
                            Sign out
                          </div>
                          <div className="text-body-small opacity-75">
                            End your session
                          </div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Brand/Logo for Desktop */}
      <div className="hidden lg:block fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
        <Link href="/dashboard">
          <div className="liquid-glass px-4 py-2 rounded-m3-xl border border-surface-200 backdrop-blur-lg hover:bg-surface-100 transition-colors cursor-pointer">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 m3-primary rounded-m3-sm flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-title-medium font-medium text-on-surface">
                Edutron
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* User Menu for Desktop */}
      {isAuthenticated && (
        <div className="hidden lg:block fixed top-4 right-4 z-40">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="liquid-glass p-2 rounded-m3-xl border border-surface-200 backdrop-blur-lg hover:bg-surface-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                {user?.name && (
                  <span className="text-body-medium text-on-surface font-medium">
                    {user.name.split(' ')[0]}
                  </span>
                )}
              </div>
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 liquid-glass rounded-m3-xl border border-surface-200 backdrop-blur-lg shadow-m3-3 z-20">
                  <div className="p-3 border-b border-surface-200">
                    <p className="text-body-medium font-medium text-on-surface">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-body-small text-on-surface-variant">
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-m3-lg hover:bg-surface-100 transition-colors text-on-surface"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-body-medium">Sign out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
