"use client";

import { useState } from "react";

export default function AnalysisResults({
  analysis,
  testType,
  onCopyAll,
  onChatOpen,
  copiedText,
}) {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (reportIndex, sectionKey) => {
    const key = `${reportIndex}-${sectionKey}`;
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const copyToClipboard = async (text, label = "Text") => {
    try {
      await navigator.clipboard.writeText(text);
      // You might want to handle the copiedText state in the parent component
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (!analysis) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h3 className="text-lg sm:text-xl font-semibold text-black">
          📊 Analysis Results
        </h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            {analysis.summary.successfulAnalyses}/
            {analysis.summary.totalReports} successful
          </span>
          <div
            className={`w-3 h-3 rounded-full ${
              analysis.summary.successfulAnalyses ===
              analysis.summary.totalReports
                ? "bg-green-500"
                : analysis.summary.successfulAnalyses > 0
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          ></div>
          <button
            onClick={onCopyAll}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-1 touch-manipulation"
            title="Copy all analysis results"
          >
            <span>📋</span>
            <span className="hidden sm:inline">Copy All</span>
          </button>
          <button
            onClick={onChatOpen}
            className="px-3 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 touch-manipulation"
          >
            <span className="hidden sm:inline">💬 Ask Expert</span>
            <span className="sm:hidden">💬</span>
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4 sm:space-y-6">
        {analysis.reports.map((report, index) => (
          <div
            key={index}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6"
          >
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    report.success ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <h4 className="text-base sm:text-lg font-semibold text-black truncate">
                  {report.filename}
                </h4>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                {report.success && (
                  <button
                    onClick={() =>
                      copyToClipboard(
                        generateReportText(report, testType),
                        `${report.filename} Analysis`
                      )
                    }
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-all duration-200 flex-shrink-0 touch-manipulation"
                    title="Copy this report"
                  >
                    📋
                  </button>
                )}
                <span
                  className={`px-2 py-1 sm:px-3 text-xs font-medium rounded-full whitespace-nowrap ${
                    report.success
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {report.success ? "✅ Success" : "❌ Failed"}
                </span>
              </div>
            </div>

            {report.success ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Parameters Section */}
                <div>
                  <button
                    onClick={() => toggleSection(index, "parameters")}
                    className="w-full flex items-center justify-between p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
                  >
                    <h5 className="text-base sm:text-lg font-semibold text-black flex items-center">
                      <span className="mr-2">📈</span> Parameters
                    </h5>
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-200 ${
                        expandedSections[`${index}-parameters`]
                          ? "rotate-180"
                          : ""
                      }`}
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
                  </button>

                  {expandedSections[`${index}-parameters`] && (
                    <div className="mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                        {report.analysis.parameters.map((param, paramIndex) => (
                          <div
                            key={paramIndex}
                            className="bg-white border border-gray-200 p-2 sm:p-3 lg:p-4 rounded-lg hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 space-y-1 sm:space-y-0">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm lg:text-base truncate">
                                {param.name}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-medium rounded-full flex-shrink-0 whitespace-nowrap ${
                                  param.status === "Normal"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : param.status === "High"
                                    ? "bg-red-100 text-red-800 border border-red-200"
                                    : param.status === "Low"
                                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                    : "bg-gray-100 text-gray-800 border border-gray-200"
                                }`}
                              >
                                {param.status}
                              </span>
                            </div>
                            <p className="text-black font-semibold text-sm sm:text-base lg:text-lg">
                              {param.value}
                            </p>
                            {param.referenceRange && (
                              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                Normal: {param.referenceRange}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary Section */}
                {report.analysis.summary && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <h5 className="text-sm sm:text-base font-semibold text-black mb-3 flex items-center">
                      <span className="mr-2">📋</span> Analysis Summary
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-800">
                          Overall Status:
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            report.analysis.summary.overallStatus === "Normal"
                              ? "bg-green-100 text-green-800"
                              : report.analysis.summary.overallStatus ===
                                "Abnormal"
                              ? "bg-yellow-100 text-yellow-800"
                              : report.analysis.summary.overallStatus ===
                                "Critical"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {report.analysis.summary.overallStatus}
                        </span>
                      </div>

                      {report.analysis.summary.keyFindings && (
                        <div>
                          <span className="text-sm font-medium text-blue-800 block mb-1">
                            Key Findings:
                          </span>
                          <div className="text-sm text-blue-900 leading-relaxed whitespace-pre-line">
                            {report.analysis.summary.keyFindings}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendations Section */}
                {report.analysis.recommendations && (
                  <div className="space-y-3">
                    <h5 className="text-sm sm:text-base font-semibold text-black mb-3 flex items-center">
                      <span className="mr-2">💡</span> Medical Recommendations
                    </h5>

                    {report.analysis.recommendations.immediateActions && (
                      <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-3 sm:p-4">
                        <h6 className="text-sm font-semibold text-red-800 mb-2 flex items-center">
                          <span className="mr-2">🚨</span> Immediate Actions
                          Required
                        </h6>
                        <p className="text-sm text-red-900 leading-relaxed">
                          {report.analysis.recommendations.immediateActions}
                        </p>
                      </div>
                    )}

                    {report.analysis.recommendations.lifestyleModifications && (
                      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-3 sm:p-4">
                        <h6 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                          <span className="mr-2">🏃‍♂️</span> Lifestyle
                          Modifications
                        </h6>
                        <p className="text-sm text-green-900 leading-relaxed">
                          {
                            report.analysis.recommendations
                              .lifestyleModifications
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-red-600 text-lg sm:text-xl">⚠️</span>
                  <div className="flex-1">
                    <h5 className="text-red-800 font-semibold text-sm sm:text-base">
                      Analysis Failed
                    </h5>
                    <p className="text-red-700 mt-1 text-sm sm:text-base">
                      {report.error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function generateReportText(report, testType) {
  let reportContent = `${report.filename}\n`;
  reportContent += `Test Type: ${testType}\n`;
  reportContent += `Analysis Date: ${new Date().toLocaleDateString()}\n\n`;

  if (report.analysis.parameters && report.analysis.parameters.length > 0) {
    reportContent += `LABORATORY PARAMETERS:\n`;
    report.analysis.parameters.forEach((param) => {
      reportContent += `• ${param.name}: ${param.value}`;
      if (param.referenceRange) {
        reportContent += ` (Reference: ${param.referenceRange})`;
      }
      reportContent += ` - Status: ${param.status}\n`;
    });
    reportContent += `\n`;
  }

  if (report.analysis.summary) {
    reportContent += `ANALYSIS SUMMARY:\n`;
    if (report.analysis.summary.overallStatus) {
      reportContent += `Overall Status: ${report.analysis.summary.overallStatus}\n`;
    }
    if (report.analysis.summary.keyFindings) {
      reportContent += `Key Findings:\n${report.analysis.summary.keyFindings}\n`;
    }
  }

  return reportContent;
}
