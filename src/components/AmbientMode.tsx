"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Focus, Zap } from "lucide-react";

interface AmbientModeProps {
  children: React.ReactNode;
}

const AmbientMode: React.FC<AmbientModeProps> = ({ children }) => {
  const [isAmbientMode, setIsAmbientMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved preference
    const savedAmbientMode = localStorage.getItem("ambientMode");
    const savedDarkMode = localStorage.getItem("darkMode");

    if (savedAmbientMode === "true") {
      setIsAmbientMode(true);
    }
    if (savedDarkMode === "true") {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Apply ambient mode styles
    if (isAmbientMode) {
      document.body.classList.add("ambient-mode");
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("ambient-mode");
      if (!isDarkMode) {
        document.body.classList.remove("dark");
      }
    }
  }, [isAmbientMode, isDarkMode]);

  useEffect(() => {
    // Apply dark mode styles
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleAmbientMode = () => {
    const newAmbientMode = !isAmbientMode;
    setIsAmbientMode(newAmbientMode);
    localStorage.setItem("ambientMode", newAmbientMode.toString());
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isAmbientMode
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
          : "bg-background"
      }`}
    >
      {/* Ambient Mode Overlay */}
      {isAmbientMode && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-cyan-500/5 to-transparent" />
        </div>
      )}

      {/* Control Panel */}
      <div className="fixed top-4 right-4 z-50">
        <div
          className={`liquid-glass p-2 rounded-m3-xl border ${
            isAmbientMode
              ? "border-blue-300/50 bg-blue-500/10"
              : "border-surface-200"
          } backdrop-blur-lg`}
        >
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-m3-lg transition-all duration-300 ${
                isDarkMode
                  ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                  : "hover:bg-surface-100 text-on-surface-variant"
              }`}
              title="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={toggleAmbientMode}
              className={`p-2 rounded-m3-lg transition-all duration-300 ${
                isAmbientMode
                  ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  : "hover:bg-surface-100 text-on-surface-variant"
              }`}
              title="Toggle ambient mode"
            >
              {isAmbientMode ? (
                <Focus className="w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Ambient Mode Indicator */}
      {isAmbientMode && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="liquid-glass px-4 py-2 rounded-m3-xl border border-blue-300/50 bg-blue-500/10 backdrop-blur-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-body-small text-blue-300 font-medium">
                Focus Mode Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content with ambient mode styling */}
      <div
        className={`transition-all duration-500 ${
          isAmbientMode ? "opacity-90 brightness-110" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default AmbientMode;
