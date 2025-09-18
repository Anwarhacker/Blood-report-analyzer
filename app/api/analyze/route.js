import { NextResponse } from "next/server";
import { analyzeReportWithGemini } from "@/utils/gemini";

export async function POST(request) {
  try {
    const { imageUrls, testType } = await request.json();

    if (
      !imageUrls ||
      !Array.isArray(imageUrls) ||
      imageUrls.length === 0 ||
      !testType
    ) {
      return NextResponse.json(
        { message: "Image URLs array and test type are required" },
        { status: 400 }
      );
    }

    // Analyze each report
    const analysisPromises = imageUrls.map(async (imageUrl, index) => {
      try {
        const result = await analyzeReportWithGemini(imageUrl.url, testType);
        return {
          filename: imageUrl.filename,
          url: imageUrl.url,
          analysis: result,
          success: true,
        };
      } catch (error) {
        console.error(`Error analyzing ${imageUrl.filename}:`, error);
        return {
          filename: imageUrl.filename,
          url: imageUrl.url,
          analysis: null,
          success: false,
          error: error.message,
        };
      }
    });

    const results = await Promise.all(analysisPromises);

    // Combine results
    const combinedResult = {
      testType,
      reports: results,
      summary: {
        totalReports: results.length,
        successfulAnalyses: results.filter((r) => r.success).length,
        failedAnalyses: results.filter((r) => !r.success).length,
      },
    };

    return NextResponse.json(combinedResult);
  } catch (error) {
    console.error("Error in analysis API route:", error);
    return NextResponse.json(
      { message: "Failed to analyze reports", error: error.message },
      { status: 500 }
    );
  }
}
