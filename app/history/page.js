"use client";

import { useState, useEffect } from "react";
import { getReports } from "../../lib/mongodb";

export default function History() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    if (status === "Normal") return "bg-green-500";
    if (status === "Attention Needed") return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Report History</h1>
        <div className="space-y-4">
          {reports.map((report, index) => (
            <div
              key={report._id ? report._id.toString() : index}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{report.test_name}</h2>
                <div
                  className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(
                    report.ai_result_json.overallStatus
                  )}`}
                >
                  {report.ai_result_json.overallStatus}
                </div>
              </div>
              <p className="text-gray-600 mb-2">
                Date: {new Date(report.created_at).toLocaleDateString()}
              </p>
              <img
                src={report.report_image_url}
                alt="Report"
                className="max-w-xs mb-4"
              />
              <details>
                <summary className="cursor-pointer font-semibold">
                  View Details
                </summary>
                <div className="mt-4">
                  <table className="w-full table-auto mb-4">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="px-4 py-2">Parameter</th>
                        <th className="px-4 py-2">Value</th>
                        <th className="px-4 py-2">Normal Range</th>
                        <th className="px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.ai_result_json.keyFindings.map(
                        (finding, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2">{finding.parameter}</td>
                            <td className="px-4 py-2">{finding.value}</td>
                            <td className="px-4 py-2">{finding.normalRange}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded text-white text-xs ${getStatusColor(
                                  finding.status
                                )}`}
                              >
                                {finding.status}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                  <div className="mb-4">
                    <h3 className="font-semibold">Summary:</h3>
                    <p>{report.ai_result_json.summary}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Recommendation:</h3>
                    <p>{report.ai_result_json.recommendation}</p>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
