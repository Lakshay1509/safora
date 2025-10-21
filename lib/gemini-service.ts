// lib/gemini-service.ts
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

// Type definitions
export type WarningCategory = 
  | "tourist_scam"
  | "tourist_crime"
  | "women_traveler_safety"
  | "traveler_environment"
  | "tourist_transport"
  | "accommodation_scam";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export type DataRecency = "last_7_days" | "outdated" | "no_recent_data";

export type TravelerRelevance = "high" | "medium" | "low";

export interface TravelerWarning {
  category: WarningCategory;
  severity: SeverityLevel;
  issue: string;
  details: string;
  lastReported: string;
  travelerImpact: string;
}

export interface GeneratedWarnings {
  warnings: TravelerWarning[];
  dataRecency: DataRecency;
  searchDate: string;
  travelerRelevance: TravelerRelevance;
}

// Legacy types for backward compatibility
export type SafetyTip = {
  tip: string;
}

export type GeneratedPrecautions = {
  [key: string]: any;
  tips: SafetyTip[];
}

/**
 * Generates real-time traveler safety warnings for a specific location
 * Focuses on tourist-specific safety issues from the last 7 days
 */
export async function generateTravelerWarnings(
  locationName: string,
  city: string | null,
  country: string
): Promise<GeneratedWarnings> {
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

    // Get current date in ISO format
    const currentDate = new Date();
    const searchDate = currentDate.toISOString().split('T')[0];
    
    // Calculate cutoff date (7 days ago)
    const cutoffDate = new Date(currentDate);
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];

    const prompt = `**Role**: You are a real-time traveler safety intelligence analyst providing up-to-date warnings.

**Input**: 
* Location:  ${locationString} or the nearest major city
* Current Date: ${searchDate}
* Cutoff Date: ${cutoffDateString} (only use information from the **last 7 days**)

**Task**:
1. Search the web for **traveler-specific safety issues** reported between **${cutoffDateString} - ${searchDate}**:
   * **Primary Focus**: Issues affecting tourists/travelers/visitors specifically (not general resident crime)
   * **Include**: Tourist scams at airports/stations/attractions, taxi/transport overcharging, fake tour guides, accommodation scams, tourist-targeted theft/pickpocketing, currency exchange fraud, restaurant bill padding, SIM card scams, ATM skimming at tourist areas, harassment of travelers, tourist police incidents
   * **Environmental for Travelers**: AQI/pollution affecting outdoor sightseeing, health advisories, water quality at hotels, disease outbreaks, travel disruptions (strikes, protests, weather)
   * **Women Travelers**: Harassment in tourist areas, unsafe accommodations, transport safety, solo female traveler incidents, women-only facilities
   
   **Sources**: 
   - r/travel, r/solotravel, r/IndiaTravel subreddits (last 7 days)
   - TripAdvisor recent reviews and forums (October 2025)
   - Local news: "tourist scam [location]", "traveler robbed [location]" (last week)
   - Twitter/X: #travel[location], recent traveler complaints (last 7 days)
   - Government travel advisories updated this week
   - Hostel/hotel review warnings (Booking.com, Hostelworld) from last 7 days

2. Generate **exactly 6 traveler-specific warnings**:
   * **At least 2 for women travelers** (female solo traveler incidents, unsafe areas for women, women-targeted scams)
   * **At least 1 environmental/health** (affecting sightseeing, outdoor activities, or traveler health)
   * **At least 3 scam/crime-related** (specifically targeting tourists, not general crime)
   * **MANDATORY**: Each warning must be based on incidents reported **${cutoffDateString} - ${searchDate}**
   * Each must include:
     - **Specific traveler context** (at airport, near [landmark], in [tourist area], at [accommodation type])
     - **Actionable info** (exact prices travelers should pay, specific scam methods, where to report, alternative options)
     - **Recency proof** (mention "this week", "recent reports", or specific date)
     - One sentence, max 150 chars, traveler-focused language

3. Add **numeric citations** [1], [2] for each tip.

**Output Format** (JSON only):
\`\`\`json
{
  "warnings": [
    {
      "category": "tourist_scam|tourist_crime|women_traveler_safety|traveler_environment|tourist_transport|accommodation_scam",
      "severity": "low|medium|high|critical",
      "issue": "Brief traveler-focused description [1, 2]",
      "details": "Specific information: where tourists encounter this, exact scam method, prices, what to do instead [1, 2]",
      "lastReported": "YYYY-MM-DD",
      "travelerImpact": "Brief note on who's affected: all tourists, solo travelers, women, budget travelers, etc."
    }
  ],
  "dataRecency": "last_7_days|outdated|no_recent_data",
  "searchDate": "${searchDate}",
  "travelerRelevance": "high|medium|low"
}
\`\`\`

**Strict Validation Rules**:
* ❌ **REJECT** any information older than ${cutoffDateString}
* ❌ **REJECT** general crime statistics not specific to travelers
* ❌ **REJECT** generic safety advice ("be careful", "stay alert")
* ✅ **ONLY ACCEPT** recent traveler experiences, scams targeting tourists, incidents at tourist locations
* ✅ Must have at least 4 sources from last 7 days to proceed
* If insufficient recent traveler-specific data: return \`dataRecency: "no_recent_data"\` with empty warnings array

**Search Query Instructions for Gemini**:
When searching, prioritize:
1. "tourist scam ${locationString} October 2025"
2. "traveler safety ${locationString} this week"
3. "site:reddit.com/r/travel ${locationString} pickpocket scam" (last 7 days)
4. "solo female traveler ${locationString} harassment October 2025"
5. "${locationString} airport taxi scam recent"
6. "${locationString} AQI traveler advisory October 2025"

**Critical Rules**:
- 🚫 No data older than **${cutoffDateString}**
- 🎯 Must be **traveler/tourist-specific** (not general crime)
- 📍 Must mention specific **tourist locations** (airports, stations, landmarks, tourist neighborhoods)
- 💰 Must include **prices/amounts** for scams where applicable
- 👤 Must specify **which type of travelers** are affected
- If you cannot find at least 4 recent traveler-specific sources, return:
  \`\`\`json
  {
    "warnings": [],
    "dataRecency": "no_recent_data",
    "searchDate": "${searchDate}",
    "travelerRelevance": "low"
  }
  \`\`\`

our final output must be only the JSON object,and double check the format.`;

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

    
    
    // Extract JSON from response
    let jsonString = '';
    const markdownMatch = responseText?.match(/```json\s*([\s\S]*?)\s*```/);

    if (markdownMatch && markdownMatch[1]) {
      jsonString = markdownMatch[1];
    } else {
      // Try to find JSON object in response
      const jsonMatch = responseText?.match(/(\{[\s\S]*?"warnings"[\s\S]*?\})/);
      if (jsonMatch && jsonMatch[0]) {
        jsonString = jsonMatch[0];
      }
    }

    if (!jsonString) {
      console.error('No JSON found in response');
      throw new Error("Invalid JSON response from Gemini");
    }

    const parsedResponse: GeneratedWarnings = JSON.parse(jsonString);

    // Validate response structure
    if (!parsedResponse.warnings || !Array.isArray(parsedResponse.warnings)) {
      throw new Error("Invalid response structure: missing warnings array");
    }

    if (!parsedResponse.dataRecency || !parsedResponse.searchDate) {
      throw new Error("Invalid response structure: missing required metadata");
    }

    // Validate each warning has required fields
    parsedResponse.warnings.forEach((warning, index) => {
      if (!warning.category || !warning.severity || !warning.issue || 
          !warning.details || !warning.lastReported || !warning.travelerImpact) {
        throw new Error(`Invalid warning structure at index ${index}: missing required fields`);
      }
    });

   

    return parsedResponse;
  } catch (error: any) {
    console.error('Error generating traveler warnings from Gemini:', error);
    throw new Error(`Failed to generate traveler warnings: ${error.message}`);
  }
}

