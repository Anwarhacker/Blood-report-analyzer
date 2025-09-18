"use client";

import { useState, useEffect } from "react";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import ExpertChat from "@/components/ExpertChat";

export default function Home() {
  const [imageUrls, setImageUrls] = useState([]);
  const [testType, setTestType] = useState("CBC (Complete Blood Count)");
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [copiedText, setCopiedText] = useState("");

  // Copy to clipboard function
  const copyToClipboard = async (text, label = "Text") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedText(label);
      setTimeout(() => setCopiedText(""), 2000);
    }
  };

  const handleImageUpload = (urls) => {
    setImageUrls((prevUrls) => [...prevUrls, ...urls]);
  };

  const handleAnalyze = async () => {
    if (!imageUrls || imageUrls.length === 0) {
      setError("Please upload report images first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Call the new analysis API route
      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrls, testType }),
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.message || "Failed to analyze reports");
      }

      const aiResult = await analyzeResponse.json();

      // Save each report to the database
      const savePromises = aiResult.reports.map(async (report) => {
        const reportData = {
          test_name: testType,
          report_image_url: report.url,
          ai_result_json: report.analysis,
          filename: report.filename,
        };

        const saveResponse = await fetch("/api/reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reportData),
        });

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          throw new Error(
            errorData.message || `Failed to save report ${report.filename}`
          );
        }

        return await saveResponse.json();
      });

      await Promise.all(savePromises);
      setAnalysis(aiResult);
    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
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
            <div className="flex items-center space-x-2 sm:space-x-3 ml-4">
              <a
                href="/history"
                className="px-2 py-1 sm:px-3 sm:py-2 lg:px-4 text-xs sm:text-sm lg:text-base bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-all duration-200 border border-gray-300 whitespace-nowrap"
              >
                <span className="hidden sm:inline">View History</span>
                <span className="sm:hidden">History</span>
              </a>
              <button
                onClick={() => setIsChatOpen(true)}
                className="px-2 py-1 sm:px-3 sm:py-2 lg:px-4 text-xs sm:text-sm lg:text-base bg-green-400 hover:bg-gray-800 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                <span className="hidden sm:inline">💬 Chat</span>
                <span className="sm:hidden">💬</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-12">
        <div className="bg-white border border-gray-200 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-xl space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-2 sm:mb-3 lg:mb-4">
              Upload Your Reports
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2 leading-relaxed">
              Upload one or more images of your blood test reports to get
              AI-powered analysis for each report with advanced medical
              insights.
            </p>
          </div>

          <CloudinaryUpload onUpload={handleImageUpload} />

          {imageUrls && imageUrls.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <h3 className="text-lg sm:text-xl font-semibold text-black">
                  📋 Uploaded Reports ({imageUrls.length})
                </h3>
                <button
                  onClick={() => setImageUrls([])}
                  className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                >
                  🗑️ Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {imageUrls.map((imageData, index) => (
                  <div
                    key={`${imageData.url}-${index}`}
                    className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 relative group hover:shadow-lg transition-all duration-300"
                  >
                    <button
                      onClick={() => {
                        setImageUrls((prevUrls) =>
                          prevUrls.filter((_, i) => i !== index)
                        );
                      }}
                      className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 z-10"
                      title="Remove image"
                    >
                      ×
                    </button>
                    <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700 truncate pr-4 sm:pr-6 lg:pr-8">
                        {imageData.filename}
                      </p>
                    </div>
                    <div className="relative overflow-hidden rounded-md sm:rounded-lg">
                      <img
                        src={imageData.url}
                        alt={`Uploaded blood report ${index + 1}`}
                        className="w-full h-20 sm:h-24 lg:h-32 object-cover rounded-md sm:rounded-lg hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label
                htmlFor="testType"
                className="block text-base sm:text-lg font-semibold text-black mb-2 sm:mb-3"
              >
                🧪 Select Test Type
              </label>
              <select
                id="testType"
                name="testType"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-lg text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
              >
                {/* Infectious Diseases */}
                <optgroup label="Infectious Diseases">
                  <option className="bg-white text-black">Dengue</option>
                  <option className="bg-white text-black">Malaria</option>
                  <option className="bg-white text-black">Typhoid</option>
                  <option className="bg-white text-black">HIV</option>
                  <option className="bg-white text-black">Hepatitis B</option>
                  <option className="bg-white text-black">Hepatitis C</option>
                  <option className="bg-white text-black">Syphilis</option>
                </optgroup>

                {/* Hormonal Tests */}
                <optgroup label="Hormonal Tests">
                  <option className="bg-white text-black">Thyroid</option>
                  <option className="bg-white text-black">Testosterone</option>
                  <option className="bg-white text-black">Estrogen</option>
                  <option className="bg-white text-black">Progesterone</option>
                  <option className="bg-white text-black">Cortisol</option>
                  <option className="bg-white text-black">Prolactin</option>
                </optgroup>

                {/* Metabolic Tests */}
                <optgroup label="Metabolic Tests">
                  <option className="bg-white text-black">Diabetes</option>
                  <option className="bg-white text-black">Lipid Profile</option>
                  <option className="bg-white text-black">
                    Liver Function Test
                  </option>
                  <option className="bg-white text-black">
                    Kidney Function Test
                  </option>
                  <option className="bg-white text-black">
                    Electrolyte Panel
                  </option>
                  <option className="bg-white text-black">Vitamin D</option>
                  <option className="bg-white text-black">Vitamin B12</option>
                  <option className="bg-white text-black">Iron Studies</option>
                </optgroup>

                {/* Complete Blood Count */}
                <optgroup label="Complete Blood Count">
                  <option className="bg-white text-black">
                    CBC (Complete Blood Count)
                  </option>
                  <option className="bg-white text-black">Hemoglobin</option>
                  <option className="bg-white text-black">
                    White Blood Cell Count
                  </option>
                  <option className="bg-white text-black">
                    Platelet Count
                  </option>
                  <option className="bg-white text-black">
                    ESR (Erythrocyte Sedimentation Rate)
                  </option>
                </optgroup>

                {/* Cardiac Markers */}
                <optgroup label="Cardiac Markers">
                  <option className="bg-white text-black">Troponin</option>
                  <option className="bg-white text-black">CK-MB</option>
                  <option className="bg-white text-black">BNP</option>
                  <option className="bg-white text-black">hs-CRP</option>
                </optgroup>

                {/* Cancer Markers */}
                <optgroup label="Cancer Markers">
                  <option className="bg-white text-black">
                    PSA (Prostate Specific Antigen)
                  </option>
                  <option className="bg-white text-black">CA-125</option>
                  <option className="bg-white text-black">
                    CEA (Carcinoembryonic Antigen)
                  </option>
                  <option className="bg-white text-black">
                    AFP (Alpha Fetoprotein)
                  </option>
                </optgroup>

                {/* Autoimmune Tests */}
                <optgroup label="Autoimmune Tests">
                  <option className="bg-white text-black">
                    ANA (Antinuclear Antibody)
                  </option>
                  <option className="bg-white text-black">RA Factor</option>
                  <option className="bg-white text-black">Anti-CCP</option>
                  <option className="bg-white text-black">dsDNA</option>
                </optgroup>

                {/* Coagulation Tests */}
                <optgroup label="Coagulation Tests">
                  <option className="bg-white text-black">PT/INR</option>
                  <option className="bg-white text-black">APTT</option>
                  <option className="bg-white text-black">D-Dimer</option>
                  <option className="bg-white text-black">Fibrinogen</option>
                </optgroup>

                {/* Other Common Tests */}
                <optgroup label="Other Tests">
                  <option className="bg-white text-black">
                    Blood Group & Rh Factor
                  </option>
                  <option className="bg-white text-black">
                    Urine Analysis
                  </option>
                  <option className="bg-white text-black">
                    Stool Analysis
                  </option>
                  <option className="bg-white text-black">
                    Semen Analysis
                  </option>
                </optgroup>
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !imageUrls || imageUrls.length === 0}
              className="w-full py-3 px-4 sm:py-4 sm:px-6 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>🔬</span>
                  <span>
                    Analyze {imageUrls.length || 0} Report
                    {imageUrls.length === 1 ? "" : "s"}
                  </span>
                </div>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">⚠️</span>
                </div>
                <div>
                  <h4 className="text-red-800 font-semibold">Analysis Error</h4>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {analysis && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-black">
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
                    onClick={() => {
                      const fullAnalysis = analysis.reports
                        .filter((report) => report.success)
                        .map((report) => {
                          let reportContent = `${report.filename}\n`;
                          reportContent += `Test Type: ${testType}\n`;
                          reportContent += `Analysis Date: ${new Date().toLocaleDateString()}\n\n`;

                          // Parameters section
                          if (
                            report.analysis.parameters &&
                            report.analysis.parameters.length > 0
                          ) {
                            reportContent += `LABORATORY PARAMETERS:\n`;
                            report.analysis.parameters.forEach((param) => {
                              reportContent += `• ${param.name}: ${param.value}`;
                              if (param.referenceRange) {
                                reportContent += ` (Reference: ${param.referenceRange})`;
                              }
                              reportContent += ` - Status: ${param.status}`;
                              if (param.interpretation) {
                                reportContent += `\n  Interpretation: ${param.interpretation}`;
                              }
                              reportContent += `\n`;
                            });
                            reportContent += `\n`;
                          }

                          // Summary section
                          if (report.analysis.summary) {
                            reportContent += `ANALYSIS SUMMARY:\n`;
                            if (report.analysis.summary.overallStatus) {
                              reportContent += `Overall Status: ${report.analysis.summary.overallStatus}\n`;
                            }
                            if (report.analysis.summary.keyFindings) {
                              reportContent += `Key Findings:\n${report.analysis.summary.keyFindings}\n`;
                            }
                            if (report.analysis.summary.patternAnalysis) {
                              reportContent += `Pattern Analysis: ${report.analysis.summary.patternAnalysis}\n`;
                            }
                            if (report.analysis.summary.riskAssessment) {
                              reportContent += `Risk Assessment: ${report.analysis.summary.riskAssessment}\n`;
                            }
                            reportContent += `\n`;
                          }

                          // Recommendations section
                          if (report.analysis.recommendations) {
                            reportContent += `MEDICAL RECOMMENDATIONS:\n`;
                            if (
                              report.analysis.recommendations.immediateActions
                            ) {
                              reportContent += `Immediate Actions: ${report.analysis.recommendations.immediateActions}\n`;
                            }
                            if (
                              report.analysis.recommendations
                                .lifestyleModifications
                            ) {
                              reportContent += `Lifestyle Modifications: ${report.analysis.recommendations.lifestyleModifications}\n`;
                            }
                            if (report.analysis.recommendations.followUpTests) {
                              reportContent += `Follow-up Tests: ${report.analysis.recommendations.followUpTests}\n`;
                            }
                            if (
                              report.analysis.recommendations
                                .medicalConsultation
                            ) {
                              reportContent += `Medical Consultation: ${report.analysis.recommendations.medicalConsultation}\n`;
                            }
                            if (report.analysis.recommendations.monitoring) {
                              reportContent += `Monitoring: ${report.analysis.recommendations.monitoring}\n`;
                            }
                            reportContent += `\n`;
                          }

                          // Clinical insights section
                          if (report.analysis.clinicalInsights) {
                            reportContent += `CLINICAL INSIGHTS:\n`;
                            if (report.analysis.clinicalInsights.correlations) {
                              reportContent += `Correlations: ${report.analysis.clinicalInsights.correlations}\n`;
                            }
                            if (
                              report.analysis.clinicalInsights.possibleCauses
                            ) {
                              reportContent += `Possible Causes: ${report.analysis.clinicalInsights.possibleCauses}\n`;
                            }
                            if (
                              report.analysis.clinicalInsights
                                .preventiveMeasures
                            ) {
                              reportContent += `Preventive Measures: ${report.analysis.clinicalInsights.preventiveMeasures}\n`;
                            }
                            if (report.analysis.clinicalInsights.prognosis) {
                              reportContent += `Prognosis: ${report.analysis.clinicalInsights.prognosis}\n`;
                            }
                            reportContent += `\n`;
                          }

                          // Metadata section
                          if (report.analysis.metadata) {
                            reportContent += `ANALYSIS DETAILS:\n`;
                            reportContent += `Quality: ${
                              report.analysis.metadata.analysisQuality || "N/A"
                            }\n`;
                            reportContent += `Completeness: ${
                              report.analysis.metadata.completeness || "N/A"
                            }\n`;
                            reportContent += `Confidence: ${
                              report.analysis.metadata.confidence || "N/A"
                            }\n`;
                            if (report.analysis.metadata.recommendations) {
                              reportContent += `Notes: ${report.analysis.metadata.recommendations}\n`;
                            }
                          }

                          return reportContent + `\n${"=".repeat(80)}\n`;
                        })
                        .join("\n\n");
                      copyToClipboard(
                        fullAnalysis,
                        "Complete Analysis Results"
                      );
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-1"
                    title="Copy all analysis results"
                  >
                    <span>📋</span>
                    <span>Copy All</span>
                  </button>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    💬 Ask Expert
                  </button>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {analysis.reports.map((report, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6"
                  >
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
                            onClick={() => {
                              let reportContent = `${report.filename}\n`;
                              reportContent += `Test Type: ${testType}\n`;
                              reportContent += `Analysis Date: ${new Date().toLocaleDateString()}\n\n`;

                              // Parameters section
                              if (
                                report.analysis.parameters &&
                                report.analysis.parameters.length > 0
                              ) {
                                reportContent += `LABORATORY PARAMETERS:\n`;
                                report.analysis.parameters.forEach((param) => {
                                  reportContent += `• ${param.name}: ${param.value}`;
                                  if (param.referenceRange) {
                                    reportContent += ` (Reference: ${param.referenceRange})`;
                                  }
                                  reportContent += ` - Status: ${param.status}`;
                                  if (param.interpretation) {
                                    reportContent += `\n  Interpretation: ${param.interpretation}`;
                                  }
                                  reportContent += `\n`;
                                });
                                reportContent += `\n`;
                              }

                              // Summary section
                              if (report.analysis.summary) {
                                reportContent += `ANALYSIS SUMMARY:\n`;
                                if (report.analysis.summary.overallStatus) {
                                  reportContent += `Overall Status: ${report.analysis.summary.overallStatus}\n`;
                                }
                                if (report.analysis.summary.keyFindings) {
                                  reportContent += `Key Findings:\n${report.analysis.summary.keyFindings}\n`;
                                }
                                if (report.analysis.summary.patternAnalysis) {
                                  reportContent += `Pattern Analysis: ${report.analysis.summary.patternAnalysis}\n`;
                                }
                                if (report.analysis.summary.riskAssessment) {
                                  reportContent += `Risk Assessment: ${report.analysis.summary.riskAssessment}\n`;
                                }
                                reportContent += `\n`;
                              }

                              // Recommendations section
                              if (report.analysis.recommendations) {
                                reportContent += `MEDICAL RECOMMENDATIONS:\n`;
                                if (
                                  report.analysis.recommendations
                                    .immediateActions
                                ) {
                                  reportContent += `Immediate Actions: ${report.analysis.recommendations.immediateActions}\n`;
                                }
                                if (
                                  report.analysis.recommendations
                                    .lifestyleModifications
                                ) {
                                  reportContent += `Lifestyle Modifications: ${report.analysis.recommendations.lifestyleModifications}\n`;
                                }
                                if (
                                  report.analysis.recommendations.followUpTests
                                ) {
                                  reportContent += `Follow-up Tests: ${report.analysis.recommendations.followUpTests}\n`;
                                }
                                if (
                                  report.analysis.recommendations
                                    .medicalConsultation
                                ) {
                                  reportContent += `Medical Consultation: ${report.analysis.recommendations.medicalConsultation}\n`;
                                }
                                if (
                                  report.analysis.recommendations.monitoring
                                ) {
                                  reportContent += `Monitoring: ${report.analysis.recommendations.monitoring}\n`;
                                }
                                reportContent += `\n`;
                              }

                              // Clinical insights section
                              if (report.analysis.clinicalInsights) {
                                reportContent += `CLINICAL INSIGHTS:\n`;
                                if (
                                  report.analysis.clinicalInsights.correlations
                                ) {
                                  reportContent += `Correlations: ${report.analysis.clinicalInsights.correlations}\n`;
                                }
                                if (
                                  report.analysis.clinicalInsights
                                    .possibleCauses
                                ) {
                                  reportContent += `Possible Causes: ${report.analysis.clinicalInsights.possibleCauses}\n`;
                                }
                                if (
                                  report.analysis.clinicalInsights
                                    .preventiveMeasures
                                ) {
                                  reportContent += `Preventive Measures: ${report.analysis.clinicalInsights.preventiveMeasures}\n`;
                                }
                                if (
                                  report.analysis.clinicalInsights.prognosis
                                ) {
                                  reportContent += `Prognosis: ${report.analysis.clinicalInsights.prognosis}\n`;
                                }
                                reportContent += `\n`;
                              }

                              // Metadata section
                              if (report.analysis.metadata) {
                                reportContent += `ANALYSIS DETAILS:\n`;
                                reportContent += `Quality: ${
                                  report.analysis.metadata.analysisQuality ||
                                  "N/A"
                                }\n`;
                                reportContent += `Completeness: ${
                                  report.analysis.metadata.completeness || "N/A"
                                }\n`;
                                reportContent += `Confidence: ${
                                  report.analysis.metadata.confidence || "N/A"
                                }\n`;
                                if (report.analysis.metadata.recommendations) {
                                  reportContent += `Notes: ${report.analysis.metadata.recommendations}\n`;
                                }
                              }

                              copyToClipboard(
                                reportContent,
                                `${report.filename} Analysis`
                              );
                            }}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-all duration-200 flex-shrink-0"
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
                        <div>
                          <h5 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4 flex items-center">
                            <span className="mr-2">📈</span> Parameters
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                            {report.analysis.parameters.map(
                              (param, paramIndex) => (
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
                              )
                            )}
                          </div>
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
                                    report.analysis.summary.overallStatus ===
                                    "Normal"
                                      ? "bg-green-100 text-green-800"
                                      : report.analysis.summary
                                          .overallStatus === "Abnormal"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : report.analysis.summary
                                          .overallStatus === "Critical"
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

                              {report.analysis.summary.patternAnalysis && (
                                <div>
                                  <span className="text-sm font-medium text-blue-800 block mb-1">
                                    Pattern Analysis:
                                  </span>
                                  <p className="text-sm text-blue-900 leading-relaxed">
                                    {report.analysis.summary.patternAnalysis}
                                  </p>
                                </div>
                              )}

                              {report.analysis.summary.riskAssessment && (
                                <div>
                                  <span className="text-sm font-medium text-blue-800 block mb-1">
                                    Risk Assessment:
                                  </span>
                                  <p className="text-sm text-blue-900 leading-relaxed">
                                    {report.analysis.summary.riskAssessment}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Recommendations Section */}
                        {report.analysis.recommendations && (
                          <div className="space-y-3">
                            <h5 className="text-sm sm:text-base font-semibold text-black mb-3 flex items-center">
                              <span className="mr-2">💡</span> Medical
                              Recommendations
                            </h5>

                            {report.analysis.recommendations
                              .immediateActions && (
                              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-3 sm:p-4">
                                <h6 className="text-sm font-semibold text-red-800 mb-2 flex items-center">
                                  <span className="mr-2">🚨</span> Immediate
                                  Actions Required
                                </h6>
                                <p className="text-sm text-red-900 leading-relaxed">
                                  {
                                    report.analysis.recommendations
                                      .immediateActions
                                  }
                                </p>
                              </div>
                            )}

                            {report.analysis.recommendations
                              .lifestyleModifications && (
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

                            {report.analysis.recommendations.followUpTests && (
                              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3 sm:p-4">
                                <h6 className="text-sm font-semibold text-purple-800 mb-2 flex items-center">
                                  <span className="mr-2">🔬</span> Follow-up
                                  Tests
                                </h6>
                                <p className="text-sm text-purple-900 leading-relaxed">
                                  {
                                    report.analysis.recommendations
                                      .followUpTests
                                  }
                                </p>
                              </div>
                            )}

                            {report.analysis.recommendations
                              .medicalConsultation && (
                              <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3 sm:p-4">
                                <h6 className="text-sm font-semibold text-orange-800 mb-2 flex items-center">
                                  <span className="mr-2">👨‍⚕️</span> Medical
                                  Consultation
                                </h6>
                                <p className="text-sm text-orange-900 leading-relaxed">
                                  {
                                    report.analysis.recommendations
                                      .medicalConsultation
                                  }
                                </p>
                              </div>
                            )}

                            {report.analysis.recommendations.monitoring && (
                              <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-lg p-3 sm:p-4">
                                <h6 className="text-sm font-semibold text-teal-800 mb-2 flex items-center">
                                  <span className="mr-2">📊</span> Monitoring &
                                  Follow-up
                                </h6>
                                <p className="text-sm text-teal-900 leading-relaxed">
                                  {report.analysis.recommendations.monitoring}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Clinical Insights Section */}
                        {report.analysis.clinicalInsights && (
                          <div className="space-y-3">
                            <h5 className="text-sm sm:text-base font-semibold text-black mb-3 flex items-center">
                              <span className="mr-2">🔍</span> Clinical Insights
                            </h5>

                            {report.analysis.clinicalInsights.correlations && (
                              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-3 sm:p-4">
                                <h6 className="text-sm font-semibold text-indigo-800 mb-2">
                                  Parameter Correlations
                                </h6>
                                <p className="text-sm text-indigo-900 leading-relaxed">
                                  {
                                    report.analysis.clinicalInsights
                                      .correlations
                                  }
                                </p>
                              </div>
                            )}

                            {report.analysis.clinicalInsights
                              .possibleCauses && (
                              <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-3 sm:p-4">
                                <h6 className="text-sm font-semibold text-pink-800 mb-2">
                                  Possible Causes
                                </h6>
                                <p className="text-sm text-pink-900 leading-relaxed">
                                  {
                                    report.analysis.clinicalInsights
                                      .possibleCauses
                                  }
                                </p>
                              </div>
                            )}

                            {report.analysis.clinicalInsights
                              .preventiveMeasures && (
                              <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 border border-cyan-200 rounded-lg p-3 sm:p-4">
                                <h6 className="text-sm font-semibold text-cyan-800 mb-2">
                                  Preventive Measures
                                </h6>
                                <p className="text-sm text-cyan-900 leading-relaxed">
                                  {
                                    report.analysis.clinicalInsights
                                      .preventiveMeasures
                                  }
                                </p>
                              </div>
                            )}

                            {report.analysis.clinicalInsights.prognosis && (
                              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-3 sm:p-4">
                                <h6 className="text-sm font-semibold text-emerald-800 mb-2">
                                  Prognosis & Outlook
                                </h6>
                                <p className="text-sm text-emerald-900 leading-relaxed">
                                  {report.analysis.clinicalInsights.prognosis}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Metadata Section */}
                        {report.analysis.metadata && (
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4">
                            <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                              <span className="mr-2">ℹ️</span> Analysis Details
                            </h5>
                            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                              <div>
                                <span className="font-medium text-gray-600 block">
                                  Quality:
                                </span>
                                <span
                                  className={`font-medium ${
                                    report.analysis.metadata.analysisQuality ===
                                    "Excellent"
                                      ? "text-green-600"
                                      : report.analysis.metadata
                                          .analysisQuality === "Good"
                                      ? "text-blue-600"
                                      : report.analysis.metadata
                                          .analysisQuality === "Fair"
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {report.analysis.metadata.analysisQuality}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600 block">
                                  Completeness:
                                </span>
                                <span className="font-medium text-gray-800">
                                  {report.analysis.metadata.completeness}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600 block">
                                  Confidence:
                                </span>
                                <span
                                  className={`font-medium ${
                                    report.analysis.metadata.confidence ===
                                    "High"
                                      ? "text-green-600"
                                      : report.analysis.metadata.confidence ===
                                        "Medium"
                                      ? "text-blue-600"
                                      : "text-yellow-600"
                                  }`}
                                >
                                  {report.analysis.metadata.confidence}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600 block">
                                  Analysis Date:
                                </span>
                                <span className="font-medium text-gray-800">
                                  {new Date().toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {report.analysis.metadata.recommendations && (
                              <div className="mt-3 pt-3 border-t border-gray-300">
                                <span className="font-medium text-gray-600 block mb-1">
                                  Notes:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                  {report.analysis.metadata.recommendations}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-red-600 text-lg sm:text-xl">
                            ⚠️
                          </span>
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
          )}

          {analysis && (
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-black hover:bg-gray-800 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
                title="Chat with Medical Expert"
              >
                <span className="text-lg sm:text-xl">💬</span>
              </button>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Copy notification */}
          {copiedText && (
            <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-green-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg animate-pulse text-sm sm:text-base">
              ✅ {copiedText} copied to clipboard!
            </div>
          )}
        </div>
      </main>

      <ExpertChat
        analysisResults={analysis}
        testType={testType}
        isVisible={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
