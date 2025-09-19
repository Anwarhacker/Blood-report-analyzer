export default function SkeletonLoader({ type = "card", count = 1 }) {
  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-300 rounded w-full"></div>
              <div className="h-3 bg-gray-300 rounded w-5/6"></div>
              <div className="h-3 bg-gray-300 rounded w-4/6"></div>
            </div>
          </div>
        );
      case "parameter":
        return (
          <div className="bg-white border border-gray-200 p-2 sm:p-3 lg:p-4 rounded-lg animate-pulse">
            <div className="flex justify-between items-center mb-2">
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              <div className="h-5 bg-gray-300 rounded-full w-16"></div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-1"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        );
      case "image":
        return (
          <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 animate-pulse">
            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-300 rounded-full"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
            <div className="bg-gray-300 rounded-md sm:rounded-lg h-20 sm:h-24 lg:h-32 w-full"></div>
          </div>
        );
      default:
        return (
          <div className="bg-gray-300 rounded animate-pulse h-4 w-full"></div>
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}
