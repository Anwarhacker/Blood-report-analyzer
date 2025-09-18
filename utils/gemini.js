import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract valid JSON from Gemini response text
 */
function extractJsonFromResponse(text) {
  try {
    // Remove code block markers (```json ... ```)
    const cleaned = text.replace(/```(?:json)?/g, "").trim();

    // Sometimes model adds explanations before/after JSON, so extract first JSON block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in response.");

    return JSON.parse(match[0]);
  } catch (err) {
    throw new Error(
      `Failed to parse Gemini response as JSON. Raw output: ${text}`
    );
  }
}

/**
 * Analyze a blood report using Gemini
 * @param {string} imageUrl - URL of the blood report image
 * @param {string} testType - Type of test (e.g., "CBC", "Liver Function Test")
 * @returns {Promise<Object>} - Structured JSON with parameters, summary, and recommendations
 */
export async function analyzeReportWithGemini(imageUrl, testType) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert medical laboratory analyst with 15+ years of experience in blood report interpretation. Your task is to provide a comprehensive, accurate, and well-structured analysis of the blood report image.

CONTEXT:
- Test Type: ${testType}
- Analysis Date: ${new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
- Analysis Time: ${new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}

ANALYSIS REQUIREMENTS:

1. **METICULOUS PARAMETER EXTRACTION**
 - Carefully examine every visible parameter, value, and reference range
 - Extract ALL available test results with their exact values and units
 - Note any parameters that are out of normal range
 - Include reference ranges when visible on the report

2. **CLINICAL INTERPRETATION**
 - Evaluate each parameter against established medical reference ranges
 - Identify patterns and correlations between related parameters
 - Flag any critical or abnormal values that require immediate attention
 - Consider the clinical significance of each finding

3. **STRUCTURED RESPONSE FORMAT**
 Provide analysis in this exact JSON structure:
 {
   "parameters": [
     {
       "name": "Parameter Name (e.g., Hemoglobin)",
       "value": "Exact Value with Units (e.g., 14.5 g/dL)",
       "referenceRange": "Normal Range (e.g., 12.0-16.0 g/dL)",
       "status": "Normal|High|Low|Critical|Borderline",
       "interpretation": "Brief clinical significance (2-3 sentences)",
       "clinicalImportance": "High|Medium|Low"
     }
   ],
   "summary": {
     "overallStatus": "Normal|Abnormal|Critical",
     "keyFindings": "3-5 bullet points of most important findings",
     "patternAnalysis": "Analysis of parameter relationships and patterns",
     "riskAssessment": "Any health risks or concerns identified"
   },
   "recommendations": {
     "immediateActions": "Actions needed within 24-48 hours",
     "lifestyleModifications": "Diet, exercise, and lifestyle recommendations",
     "followUpTests": "Any additional tests that may be needed",
     "medicalConsultation": "When and why to consult healthcare provider",
     "monitoring": "How to monitor condition and when to retest"
   },
   "clinicalInsights": {
     "correlations": "Relationships between abnormal parameters",
     "possibleCauses": "Potential underlying causes for abnormalities",
     "preventiveMeasures": "Steps to prevent similar issues",
     "prognosis": "Expected outcome and recovery expectations"
   },
   "metadata": {
     "analysisQuality": "Excellent|Good|Fair|Poor",
     "completeness": "Complete|Partial|Incomplete",
     "confidence": "High|Medium|Low",
     "recommendations": "Any limitations or additional context needed"
   }
 }

4. **QUALITY STANDARDS**
 - Use precise medical terminology with explanations
 - Provide evidence-based interpretations
 - Include appropriate medical disclaimers
 - Maintain patient-centered, empathetic tone
 - Ensure all recommendations are safe and practical

5. **FORMATTING RULES**
 - Return ONLY valid JSON - no markdown, no extra text
 - Use proper JSON syntax and escaping
 - Keep parameter names consistent and professional
 - Include units for all measurements
 - Use "N/A" for missing or unreadable values

6. **CLINICAL ACCURACY**
 - Base interpretations on established medical guidelines
 - Flag any potentially life-threatening abnormalities
 - Provide appropriate urgency levels for follow-up
 - Include relevant differential diagnoses when applicable

EXAMPLE RESPONSE STRUCTURE:
{
"parameters": [
  {
    "name": "Hemoglobin",
    "value": "14.5 g/dL",
    "referenceRange": "12.0-16.0 g/dL",
    "status": "Normal",
    "interpretation": "Hemoglobin levels are within the normal range for adult males. This indicates adequate oxygen-carrying capacity of the blood.",
    "clinicalImportance": "High"
  }
],
"summary": {
  "overallStatus": "Normal",
  "keyFindings": "• Hemoglobin is within normal limits\n• No critical abnormalities detected\n• All major parameters are stable",
  "patternAnalysis": "Parameters show normal hematological function with no concerning patterns",
  "riskAssessment": "No immediate health risks identified from this blood work"
},
"recommendations": {
  "immediateActions": "No immediate actions required",
  "lifestyleModifications": "Maintain balanced diet, regular exercise, and adequate sleep",
  "followUpTests": "Routine follow-up in 6-12 months unless symptoms develop",
  "medicalConsultation": "Consult physician if experiencing unusual symptoms",
  "monitoring": "Monitor for any new symptoms and maintain healthy lifestyle"
},
"clinicalInsights": {
  "correlations": "All parameters are within expected ranges with normal correlations",
  "possibleCauses": "No abnormalities detected that would suggest underlying pathology",
  "preventiveMeasures": "Continue current healthy lifestyle practices",
  "prognosis": "Excellent prognosis with normal blood work"
},
"metadata": {
  "analysisQuality": "Excellent",
  "completeness": "Complete",
  "confidence": "High",
  "recommendations": "Analysis based on standard medical reference ranges"
}
}

Return ONLY the JSON object with complete analysis.
  `;

  // Convert image to base64
  const imageBuffer = await (await fetch(imageUrl)).arrayBuffer();
  const imagePart = {
    inlineData: {
      data: Buffer.from(imageBuffer).toString("base64"),
      mimeType: "image/jpeg",
    },
  };

  const maxRetries = 5;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response;
      const text = response.text();

      return extractJsonFromResponse(text);
    } catch (error) {
      lastError = error;

      const isOverloaded = error.status === 503;
      const isLastAttempt = attempt === maxRetries - 1;

      if (isOverloaded && !isLastAttempt) {
        const delayTime = Math.pow(2, attempt) * 2000 + Math.random() * 500; // backoff + jitter
        console.warn(
          `Gemini API overloaded. Retrying in ${Math.round(
            delayTime / 1000
          )}s...`
        );
        await delay(delayTime);
      } else {
        throw error;
      }
    }
  }

  console.error("All retries to Gemini API failed.");
  throw lastError;
}
