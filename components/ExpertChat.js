"use client";

import { useState, useRef, useEffect } from "react";

export default function ExpertChat({
  analysisResults,
  testType,
  isVisible,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Copy to clipboard function
  const copyToClipboard = async (text, messageId) => {
    // Strip markdown formatting for clean text copy
    let cleanText = text;

    // Remove markdown headers
    cleanText = cleanText.replace(/^##\s*/gm, "");
    cleanText = cleanText.replace(/^###\s*/gm, "");

    // Remove markdown bold
    cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, "$1");

    // Remove markdown links but keep text
    cleanText = cleanText.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

    // Remove extra line breaks and clean up
    cleanText = cleanText.replace(/\n{3,}/g, "\n\n");
    cleanText = cleanText.trim();

    try {
      await navigator.clipboard.writeText(cleanText);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = cleanText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          analysisResults,
          testType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const expertMessage = {
        id: Date.now() + 1,
        type: "expert",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, expertMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "expert",
        content:
          "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or consult with a healthcare professional for medical advice.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render formatted content
  const renderFormattedContent = (content) => {
    if (!content) return content;

    // Split content into sections
    const sections = content.split("\n## ").filter((section) => section.trim());

    return sections.map((section, index) => {
      // Handle main headings (##)
      if (section.startsWith("## ")) {
        const headingMatch = section.match(/^## (.+)$/);
        if (headingMatch) {
          const heading = headingMatch[1];
          const content = section.replace(/^## .+$/m, "").trim();

          // Different styling based on heading type
          let headingClass =
            "text-lg font-bold text-blue-800 mb-3 flex items-center";
          let contentClass = "text-gray-800 leading-relaxed mb-4";
          let icon = "📋";

          if (heading.includes("Direct Answer")) {
            headingClass =
              "text-lg font-bold text-green-800 mb-3 flex items-center";
            icon = "🎯";
          } else if (heading.includes("Clinical Context")) {
            headingClass =
              "text-lg font-bold text-purple-800 mb-3 flex items-center";
            icon = "📋";
          } else if (heading.includes("Key Recommendations")) {
            headingClass =
              "text-lg font-bold text-blue-800 mb-3 flex items-center";
            icon = "💡";
          } else if (heading.includes("Important Considerations")) {
            headingClass =
              "text-lg font-bold text-red-800 mb-3 flex items-center";
            icon = "⚠️";
          } else if (heading.includes("Preventive Health")) {
            headingClass =
              "text-lg font-bold text-teal-800 mb-3 flex items-center";
            icon = "🌱";
          } else if (heading.includes("Additional Resources")) {
            headingClass =
              "text-lg font-bold text-indigo-800 mb-3 flex items-center";
            icon = "📚";
          }

          return (
            <div key={index} className="mb-6">
              <h3 className={headingClass}>
                <span className="mr-2">{icon}</span>
                {heading}
              </h3>
              <div className={contentClass}>
                {renderSectionContent(content)}
              </div>
            </div>
          );
        }
      }

      // Handle other content (disclaimers, etc.)
      if (
        section.includes("Medical Disclaimer") ||
        section.includes("When to Seek")
      ) {
        return (
          <div
            key={index}
            className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div className="text-sm text-yellow-800 leading-relaxed">
              {renderSectionContent(section)}
            </div>
          </div>
        );
      }

      // Handle italic text at the end
      if (section.includes("*Your health")) {
        return (
          <div
            key={index}
            className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <p className="text-sm text-blue-800 italic leading-relaxed">
              {renderSectionContent(section)}
            </p>
          </div>
        );
      }

      return (
        <div key={index} className="mb-4">
          {renderSectionContent(section)}
        </div>
      );
    });
  };

  // Function to render section content with formatting
  const renderSectionContent = (content) => {
    if (!content) return content;

    // Handle bold text (**text**)
    content = content.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-gray-900">$1</strong>'
    );

    // Handle bullet points
    const lines = content.split("\n");
    const formattedLines = lines.map((line, lineIndex) => {
      if (line.trim().startsWith("- ")) {
        return (
          <div key={lineIndex} className="flex items-start space-x-2 mb-2">
            <span className="text-blue-500 mt-1.5 flex-shrink-0">•</span>
            <span
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: line.substring(2) }}
            />
          </div>
        );
      } else if (line.trim().startsWith("### ")) {
        // Handle subheadings
        const subheading = line.replace("### ", "");
        return (
          <h4
            key={lineIndex}
            className="text-md font-semibold text-gray-800 mb-2 mt-4"
          >
            {subheading}
          </h4>
        );
      } else if (line.trim()) {
        return (
          <p
            key={lineIndex}
            className="text-gray-700 leading-relaxed mb-2"
            dangerouslySetInnerHTML={{ __html: line }}
          />
        );
      }
      return null;
    });

    return <div>{formattedLines}</div>;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] sm:h-[80vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm sm:text-lg">🩺</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-black truncate">
                Medical Expert Chat
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Your comprehensive health advisor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-black transition-colors flex-shrink-0"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🩺</span>
              </div>
              <h4 className="text-lg font-semibold text-black mb-2">
                Your Health Advisor is Here
              </h4>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Ask me anything about health, wellness, nutrition, symptoms,
                medications, lifestyle, or your blood test results. I'm here to
                provide professional guidance and help you understand your
                health better.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex group ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 relative ${
                    message.type === "user"
                      ? "bg-black text-white"
                      : message.isError
                      ? "bg-red-50 border border-red-200 text-red-800"
                      : "bg-gray-100 border border-gray-200 text-gray-800"
                  }`}
                >
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className={`absolute -top-1 sm:-top-2 ${
                      message.type === "user"
                        ? "-left-1 sm:-left-2"
                        : "-right-1 sm:-right-2"
                    } w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 rounded-full flex items-center justify-center text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:shadow-lg`}
                    title="Copy message"
                  >
                    {copiedMessageId === message.id ? "✓" : "📋"}
                  </button>
                  {message.type === "expert" ? (
                    <div className="text-sm sm:text-base leading-relaxed pr-4 sm:pr-6">
                      {renderFormattedContent(message.content)}
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base leading-relaxed pr-4 sm:pr-6">
                      {message.content}
                    </p>
                  )}
                  <p
                    className={`text-xs mt-1 sm:mt-2 ${
                      message.type === "user"
                        ? "text-gray-200"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-black rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-black rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-gray-600 text-sm">
                    Expert is typing...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Copy notification */}
        {copiedMessageId && (
          <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-green-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg animate-pulse text-sm sm:text-base">
            ✅ Message copied!
          </div>
        )}

        {/* Input */}
        <div className="p-4 sm:p-6 border-t border-gray-200">
          <div className="flex space-x-2 sm:space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about health, nutrition, symptoms, medications, wellness, or your blood reports..."
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none text-sm sm:text-base"
                rows="1"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Send</span>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Always consult healthcare professionals for
            medical advice
          </p>
        </div>
      </div>
    </div>
  );
}
