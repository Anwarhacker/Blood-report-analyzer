"use client";

import { useState } from "react";

export default function ResponsiveHeader({ onChatOpen }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-black border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-600">
              <svg
                className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">
              AI Blood Report Analyzer
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 ml-4">
            <a
              href="/history"
              className="px-3 py-2 lg:px-4 text-sm lg:text-base bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-all duration-200 border border-gray-300 whitespace-nowrap"
            >
              <span className="hidden lg:inline">View History</span>
              <span className="lg:hidden">History</span>
            </a>
            <button
              onClick={onChatOpen}
              className="px-3 py-2 lg:px-4 text-sm lg:text-base bg-green-400 hover:bg-gray-800 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <span className="hidden lg:inline">💬 Chat</span>
              <span className="lg:hidden">💬</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-black rounded-lg flex items-center justify-center transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
            <div className="flex flex-col space-y-3">
              <a
                href="/history"
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-all duration-200 border border-gray-300 text-center font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                📊 View History
              </a>
              <button
                onClick={() => {
                  onChatOpen();
                  setIsMenuOpen(false);
                }}
                className="px-4 py-3 bg-green-400 hover:bg-gray-800 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
              >
                💬 Chat with Expert
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
