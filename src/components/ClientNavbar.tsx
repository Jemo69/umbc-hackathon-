"use client";
import React from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";

const ClientNavbar: React.FC = () => {
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4 backdrop-blur-lg bg-white/40 dark:bg-gray-800/40 shadow-lg rounded-b-2xl">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900 dark:text-white hover:text-indigo-600"
        >
          Edutron
        </Link>
        <div className="flex items-center space-x-6">
          <ul className="flex space-x-4">
            <li>
              <Link
                href="/"
                className="text-gray-900 dark:text-white hover:text-indigo-600 transition-colors duration-200"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/tasks"
                className="text-gray-900 dark:text-white hover:text-indigo-600 transition-colors duration-200"
              >
                Tasks
              </Link>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-900 dark:text-white hover:text-indigo-600 transition-colors duration-200"
              >
                Documents
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-900 dark:text-white hover:text-indigo-600 transition-colors duration-200"
              >
                Chat AI
              </a>
            </li>
          </ul>
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <button className="px-5 py-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg font-medium">
                New Task
              </button>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default ClientNavbar;
