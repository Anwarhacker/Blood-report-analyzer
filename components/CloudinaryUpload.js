"use client";

import { useState, useRef } from "react";

export default function CloudinaryUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Handle file input change
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFiles(files);
  };

  // Process files (used by both drag-drop and file input)
  const handleFiles = async (files) => {
    if (files.length === 0) return;

    // Validate and filter files
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} is not an image file.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      validFiles.push(file);
    }

    // Show errors if any
    if (errors.length > 0) {
      alert(`Some files were skipped:\n${errors.join("\n")}`);
    }

    // If no valid files, return
    if (validFiles.length === 0) {
      alert("No valid files to upload.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onUpload(data.urls);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="w-full">
      <div
        ref={dropZoneRef}
        className={`relative border-2 border-dashed rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-12 text-center transition-all duration-300 ${
          dragActive
            ? "border-black bg-gray-100 shadow-2xl"
            : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />

        <div className="space-y-4 sm:space-y-6">
          <div className="flex justify-center">
            <div
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${
                dragActive ? "bg-black shadow-lg" : "bg-gray-200"
              }`}
            >
              <svg
                className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors duration-300 ${
                  dragActive ? "text-white" : "text-gray-600"
                }`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div>
            <label
              htmlFor="file-upload"
              className={`cursor-pointer ${
                uploading ? "pointer-events-none" : ""
              }`}
            >
              <span className="text-xl sm:text-2xl font-bold text-black block mb-2">
                {uploading
                  ? "⏳ Uploading..."
                  : "📤 Drop your blood report images here"}
              </span>
              <span className="text-base sm:text-lg text-gray-600">
                or{" "}
                <span className="text-white bg-blue-900 p-2 rounded-lg font-semibold transition-colors duration-200">
                  browse files
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span>📷</span>
              <span>JPG, PNG, GIF, WebP</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📏</span>
              <span>Max 10MB per image</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📚</span>
              <span>Multiple files supported</span>
            </div>
          </div>
        </div>

        {dragActive && (
          <div className="absolute inset-0 bg-black/5 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center border-2 border-black">
            <div className="bg-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl shadow-2xl border border-gray-300">
              <p className="text-black font-bold text-base sm:text-lg lg:text-xl">
                🎯 Drop files here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
