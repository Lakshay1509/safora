// lib/gemini-precautions-service.ts
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

export type SafetyTip ={
  tip: string;
}

export type GeneratedPrecautions ={
  [key: string]: any;
  tips: SafetyTip[];
}

export async function generateLocationPrecautions(
  locationName: string,
  city: string | null,
  country: string
): Promise<GeneratedPrecautions> {
  try {
    // Configure Google Search grounding tool
    const groundingTool = {
      googleSearch: {},
    };

    // Configure thinking settings
    const thinkingConfig = {
      thinkingBudget: -1, // Dynamic thinking
      includeThoughts: false, // Don't include thoughts for cleaner response
    };

    const locationString = city 
      ? `${locationName}, ${city}, ${country}` 
      : `${locationName}, ${country}`;

    const prompt = `**Role**: You are a safety assistant.
**Input**:
* \`place\`: ${locationString}.
**Task**:
1. Search the web for the **latest** safety guidance and incidents about \`place\`.
   * Use **credible sources**: government/police/transport advisories, local authorities, major news outlets, and official operators.
   * Only use sources **published/updated within the last 6 months**.
2. Generate **exactly 8 tips**, each on **one line** (no line breaks) and should be strictly in English .
   * **At least 5** tips must be **women-focused** (e.g., women-only transit options, helplines, harassment reporting, late-night travel practices).
   * Keep language clear, non-alarmist, and non-victim-blaming.
   * Tailor to local context (transit, neighborhoods, hours, scams, events).
3. Append **numeric citation indices** in square brackets to each tip, e.g., \`[1, 3]\`.
   * Indices refer to your **internally compiled, recency-sorted source list** (not part of the output).
   * Prefer 2-3 sources per tip when possible; 1 is acceptable if strongly authoritative.
**Output**:
* Return **only** a JSON array of 8 objects, **no extra text**.
* Each object has the shape: \`{ "tip": "..." }\`.
* Do **not** include the sources list in the output.
* If you cannot find **≥3** credible recent sources overall, return:
  \`\`\`json
  []
  \`\`\`
**Validation Rules**:
* Exactly 8 tips.
* ≥5 tips clearly **for women** (mention women/women-only options/harassment reporting/etc.).
* Each tip is **one line** (no newline), concise, and location-specific.
* Every tip ends with bracketed numeric citations like \`[2]\` or \`[1, 4]\`.
* No duplicate tips.
**Example Output Format (structure only; content is placeholder)**:
\`\`\`json
[
  { "tip": "Use well-lit main roads after dark. [1, 3]" },
  { "tip": "Women: prefer women-only transit coaches when available. [2, 5]" },
  { "tip": "Verify cab plate; share live route with contacts. [1, 4]" },
  { "tip": "Avoid isolated parks after 10 PM. [3]" },
  { "tip": "Women: call local harassment helpline if threatened. [2]" },
  { "tip": "Use official taxi stands near stations. [1, 6]" },
  { "tip": "Women: sit near driver or other women in cabs. [4]" },
  { "tip": "Beware common tourist scams reported recently. [3, 6]" }
]
  Only return the response in the format specified above and double check the format.
`;

    const config = {
      tools: [groundingTool],
      thinkingConfig: thinkingConfig,
    };

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ parts: [{ text: prompt }] }],
      config: config,
    });

   

    const responseText = result.text;
    // console.log(responseText)
    
    // Extract JSON from response
    let jsonString = '';
    const markdownMatch = responseText?.match(/```json\s*([\s\S]*?)\s*```/);

    if (markdownMatch && markdownMatch[1]) {
      jsonString = markdownMatch[1];
    } else {
      const jsonMatch = responseText?.match(/(\[[\s\S]*?\])/);
      if (jsonMatch && jsonMatch[0]) {
        jsonString = jsonMatch[0];
      }
    }

    if (!jsonString) {
      console.error('No JSON array found in response');
      throw new Error("Invalid JSON response from Gemini");
    }

    const tips: SafetyTip[] = JSON.parse(jsonString);

     if (tips.length === 0) {
      return { tips: [] };
    }

    // Validate each tip has required structure
    const invalidTips = tips.filter(tip => !tip.tip || typeof tip.tip !== 'string');
    if (invalidTips.length > 0) {
      throw new Error("Invalid tip structure in response");
    }


    return {
      tips,
    };
  } catch (error:any) {
    console.error('Error generating precautions from Gemini:', error);
    throw new Error(`Failed to generate precautions: ${error.message}`);
  }
}