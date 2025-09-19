"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/components/AppContext";

export default function History() {
  const { state, actions, filteredHistory } = useApp();
  const { history, searchQuery, filterStatus } = state;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (history.length > 0) {
      setLoading(false);
    }
  }, [history]);

  const getStatusColor = (status) => {
    if (!status || typeof status !== "string") {
      console.log("Status is undefined or not a string:", status);
      return "bg-gray-500"; // Default color for undefined status
    }
    const trimmedStatus = status.trim();
    if (trimmedStatus === "Normal") return "bg-green-500";
    if (trimmedStatus === "Attention Needed") return "bg-yellow-500";
    console.log("Unexpected status:", trimmedStatus); // Log unexpected statuses
    return "bg-red-500";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl font-semibold text-gray-700">
            Loading your reports...
          </p>
          <p className="text-sm sm:text-base text-gray-500 mt-2">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 text-black">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <a
            href="/"
            className="flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 bg-white hover:bg-gray-50 text-black rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-sm sm:text-base font-medium">Home</span>
          </a>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center flex-1">
            Report History
          </h1>
          <div className="w-16 sm:w-20"></div> {/* Spacer for centering */}
        </div>
        {/* Search and Filter Section */}
        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-md mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                🔍 Search Reports
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by test type or filename..."
                value={searchQuery}
                onChange={(e) => actions.setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm sm:text-base"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="sm:w-48">
              <label
                htmlFor="filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                📊 Filter by Status
              </label>
              <select
                id="filter"
                value={filterStatus}
                onChange={(e) => actions.setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm sm:text-base"
              >
                <option value="all">All Reports</option>
                <option value="normal">Normal</option>
                <option value="abnormal">Abnormal</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredHistory.length} of {history.length} reports
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {filteredHistory.map((report, index) => (
            <div
              key={report._id ? report._id.toString() : index}
              className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black truncate">
                  {report.test_name}
                </h2>
                <div
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-semibold whitespace-nowrap ${getStatusColor(
                    report.ai_result_json?.summary?.overallStatus
                  )}`}
                >
                  {report.ai_result_json?.summary?.overallStatus || "Unknown"}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                <p className="text-gray-600 text-sm sm:text-base">
                  Date: {new Date(report.created_at).toLocaleDateString()}
                </p>
                <div className="text-xs sm:text-sm text-gray-500">
                  Report #{index + 1}
                </div>
              </div>

              <div className="mb-4">
                <img
                  src={report.report_image_url}
                  alt="Report"
                  className="w-full max-w-sm sm:max-w-md lg:max-w-lg h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                />
              </div>

              <details className="group">
                <summary className="cursor-pointer font-semibold text-base sm:text-lg hover:text-gray-700 transition-colors duration-200 flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span>View Details</span>
                  <svg
                    className="w-5 h-5 transform group-open:rotate-180 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="mt-4 space-y-4 sm:space-y-6">
                  {/* Mobile-friendly table */}
                  <div className="block sm:hidden space-y-3">
                    {report.ai_result_json?.parameters?.map(
                      (finding, paramIndex) => (
                        <div
                          key={paramIndex}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-800 text-sm">
                              {finding.name}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-white text-xs font-medium ${getStatusColor(
                                finding.status
                              )}`}
                            >
                              {finding.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Value:</span>
                              <span className="font-medium">
                                {finding.value}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Normal Range:
                              </span>
                              <span className="font-medium">
                                {finding.referenceRange}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    ) || []}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full table-auto mb-4 sm:mb-6">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-sm sm:text-base font-semibold">
                            Parameter
                          </th>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-sm sm:text-base font-semibold">
                            Value
                          </th>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-sm sm:text-base font-semibold">
                            Normal Range
                          </th>
                          <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-sm sm:text-base font-semibold">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.ai_result_json?.parameters?.map(
                          (finding, paramIndex) => (
                            <tr
                              key={paramIndex}
                              className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                            >
                              <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium">
                                {finding.name}
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                                {finding.value}
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                                {finding.referenceRange}
                              </td>
                              <td className="px-3 sm:px-4 py-2 sm:py-3">
                                <span
                                  className={`px-2 py-1 rounded text-white text-xs font-medium ${getStatusColor(
                                    finding.status
                                  )}`}
                                >
                                  {finding.status}
                                </span>
                              </td>
                            </tr>
                          )
                        ) || []}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                      <h3 className="font-semibold text-base sm:text-lg text-blue-800 mb-3 flex items-center">
                        <span className="mr-2">📋</span> Summary
                      </h3>
                      <p className="text-sm sm:text-base text-blue-900 leading-relaxed whitespace-pre-line">
                        {report.ai_result_json?.summary?.keyFindings ||
                          "No summary available"}
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
                      <h3 className="font-semibold text-base sm:text-lg text-green-800 mb-3 flex items-center">
                        <span className="mr-2">💡</span> Recommendations
                      </h3>
                      <p className="text-sm sm:text-base text-green-900 leading-relaxed">
                        {report.ai_result_json?.recommendations
                          ?.immediateActions || "No recommendations available"}
                      </p>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>

        {filteredHistory.length === 0 && !loading && (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl sm:text-3xl">
                {history.length === 0 ? "📊" : "🔍"}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              {history.length === 0
                ? "No Reports Found"
                : "No Matching Reports"}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">
              {history.length === 0
                ? "Upload and analyze your first blood report to see it here."
                : "Try adjusting your search or filter criteria."}
            </p>
            {history.length === 0 ? (
              <a
                href="/"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Go to Home</span>
              </a>
            ) : (
              <button
                onClick={() => {
                  actions.setSearchQuery("");
                  actions.setFilterStatus("all");
                }}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
