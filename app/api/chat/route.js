import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { message, analysisResults, testType } = await request.json();

    if (!message) {
      return NextResponse.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create comprehensive context from analysis results
    let context = "";
    if (analysisResults && analysisResults.reports) {
      context = analysisResults.reports
        .map((report, index) => {
          if (report.success && report.analysis) {
            const analysis = report.analysis;

            // Build comprehensive report context
            let reportContext = `REPORT ${index + 1}: ${report.filename}\n`;
            reportContext += `Test Type: ${testType}\n`;
            reportContext += `Analysis Date: ${new Date().toLocaleDateString()}\n\n`;

            // Parameters section
            if (analysis.parameters && analysis.parameters.length > 0) {
              reportContext += `LABORATORY PARAMETERS:\n`;
              analysis.parameters.forEach((param) => {
                reportContext += `• ${param.name}: ${param.value}`;
                if (param.referenceRange) {
                  reportContext += ` (Reference: ${param.referenceRange})`;
                }
                reportContext += ` - Status: ${param.status}`;
                if (param.interpretation) {
                  reportContext += `\n  Interpretation: ${param.interpretation}`;
                }
                reportContext += `\n`;
              });
              reportContext += `\n`;
            }

            // Summary section
            if (analysis.summary) {
              reportContext += `ANALYSIS SUMMARY:\n`;
              if (analysis.summary.overallStatus) {
                reportContext += `Overall Status: ${analysis.summary.overallStatus}\n`;
              }
              if (analysis.summary.keyFindings) {
                reportContext += `Key Findings: ${analysis.summary.keyFindings}\n`;
              }
              if (analysis.summary.patternAnalysis) {
                reportContext += `Pattern Analysis: ${analysis.summary.patternAnalysis}\n`;
              }
              if (analysis.summary.riskAssessment) {
                reportContext += `Risk Assessment: ${analysis.summary.riskAssessment}\n`;
              }
              reportContext += `\n`;
            }

            // Recommendations section
            if (analysis.recommendations) {
              reportContext += `MEDICAL RECOMMENDATIONS:\n`;
              if (analysis.recommendations.immediateActions) {
                reportContext += `Immediate Actions: ${analysis.recommendations.immediateActions}\n`;
              }
              if (analysis.recommendations.lifestyleModifications) {
                reportContext += `Lifestyle Modifications: ${analysis.recommendations.lifestyleModifications}\n`;
              }
              if (analysis.recommendations.followUpTests) {
                reportContext += `Follow-up Tests: ${analysis.recommendations.followUpTests}\n`;
              }
              if (analysis.recommendations.medicalConsultation) {
                reportContext += `Medical Consultation: ${analysis.recommendations.medicalConsultation}\n`;
              }
              if (analysis.recommendations.monitoring) {
                reportContext += `Monitoring: ${analysis.recommendations.monitoring}\n`;
              }
              reportContext += `\n`;
            }

            // Clinical insights section
            if (analysis.clinicalInsights) {
              reportContext += `CLINICAL INSIGHTS:\n`;
              if (analysis.clinicalInsights.correlations) {
                reportContext += `Correlations: ${analysis.clinicalInsights.correlations}\n`;
              }
              if (analysis.clinicalInsights.possibleCauses) {
                reportContext += `Possible Causes: ${analysis.clinicalInsights.possibleCauses}\n`;
              }
              if (analysis.clinicalInsights.preventiveMeasures) {
                reportContext += `Preventive Measures: ${analysis.clinicalInsights.preventiveMeasures}\n`;
              }
              if (analysis.clinicalInsights.prognosis) {
                reportContext += `Prognosis: ${analysis.clinicalInsights.prognosis}\n`;
              }
              reportContext += `\n`;
            }

            // Metadata section
            if (analysis.metadata) {
              reportContext += `ANALYSIS DETAILS:\n`;
              reportContext += `Quality: ${
                analysis.metadata.analysisQuality || "N/A"
              }\n`;
              reportContext += `Completeness: ${
                analysis.metadata.completeness || "N/A"
              }\n`;
              reportContext += `Confidence: ${
                analysis.metadata.confidence || "N/A"
              }\n`;
              if (analysis.metadata.recommendations) {
                reportContext += `Notes: ${analysis.metadata.recommendations}\n`;
              }
            }

            return reportContext;
          }
          return `REPORT ${index + 1}: ${
            report.filename
          }\nStatus: Analysis Failed\nError: ${
            report.error || "Unknown error"
          }`;
        })
        .join("\n" + "=".repeat(80) + "\n\n");
    }

    const prompt = `
You are Dr. Sarah Mitchell, a board-certified internal medicine physician with 15+ years of clinical experience and specialized training in preventive medicine, nutrition, and lifestyle counseling. You are also a certified health coach and medical educator. You combine evidence-based medical knowledge with compassionate, patient-centered care.

${
  context
    ? `PATIENT'S RECENT BLOOD TEST RESULTS:
${context}

INTEGRATE these results naturally into your response when relevant to the patient's question. Reference specific parameters, their values, and clinical significance when they relate to the query.\n\n`
    : ""
}

PATIENT QUESTION: "${message}"

FORMATTING REQUIREMENTS:
Return your response using this exact markdown structure for proper display:

## 🎯 **Direct Answer**
[Provide a clear, concise answer to the main question]

## 📋 **Clinical Context**
[Explain relevant medical background and context]
[Reference specific blood test results when applicable]

## 💡 **Key Recommendations**
[Provide practical, actionable advice]

### Immediate Actions
- [Specific steps to take right away]
- [Urgent considerations if applicable]

### Lifestyle Modifications
- [Diet and nutrition recommendations]
- [Exercise and activity suggestions]
- [Sleep and stress management tips]

### Monitoring & Follow-up
- [What to track and observe]
- [When to schedule follow-up appointments]
- [Additional tests that may be needed]

## ⚠️ **Important Considerations**
[Red flags, when to seek medical attention]
[Limitations of this advice]
[When to consult healthcare professionals]

## 🌱 **Preventive Health Tips**
[Long-term wellness strategies]
[Healthy lifestyle habits]
[Regular health maintenance]

## 📚 **Additional Resources**
[Reliable sources for more information]
[Professional organizations or websites]

---

**🏥 Medical Disclaimer:** This information is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for personalized medical guidance.

**📞 When to Seek Immediate Care:** If you experience severe symptoms, chest pain, difficulty breathing, or other medical emergencies, call emergency services immediately.

---

*Your health and well-being are important to me. Feel free to ask follow-up questions about any aspect of your health or blood test results.*
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({
      response: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        message: "Failed to get expert response",
        error: error.message,
        response:
          "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or consult with a healthcare professional for medical advice.",
      },
      { status: 500 }
    );
  }
}
