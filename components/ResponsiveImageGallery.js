"use client";

import { useState } from "react";

export default function ResponsiveImageGallery({
  images,
  onRemove,
  onClearAll,
}) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h3 className="text-lg sm:text-xl font-semibold text-black">
            📋 Uploaded Reports ({images.length})
          </h3>
          <button
            onClick={onClearAll}
            className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto touch-manipulation"
          >
            🗑️ Clear All
          </button>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {images.map((imageData, index) => (
            <div
              key={`${imageData.url}-${index}`}
              className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 relative group hover:shadow-lg transition-all duration-300 touch-manipulation"
            >
              {/* Remove Button */}
              <button
                onClick={() => onRemove(index)}
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 z-10 touch-manipulation"
                title="Remove image"
                aria-label={`Remove ${imageData.filename}`}
              >
                ×
              </button>

              {/* Image Info */}
              <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <p className="text-xs sm:text-sm font-medium text-gray-700 truncate pr-6 sm:pr-8 lg:pr-10">
                  {imageData.filename}
                </p>
              </div>

              {/* Image */}
              <div className="relative overflow-hidden rounded-md sm:rounded-lg cursor-pointer">
                <img
                  src={imageData.url}
                  alt={`Uploaded blood report ${index + 1}`}
                  className="w-full h-20 sm:h-24 lg:h-32 object-cover rounded-md sm:rounded-lg hover:scale-105 transition-transform duration-300"
                  onClick={() => setSelectedImage(imageData)}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors duration-200 touch-manipulation"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.filename}
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 rounded-b-lg">
              <p className="text-sm font-medium">{selectedImage.filename}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
