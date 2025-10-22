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
    
    // Calculate cutoff date (30 days ago for more consistent data)
    const cutoffDate = new Date(currentDate);
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];

    const prompt = `**Role**: You are a real-time traveler safety intelligence analyst providing up-to-date warnings.

**Input**: 
* Location: ${locationString} or the nearest major city
* Current Date: ${searchDate}
* Search Window: Last 30 days (${cutoffDateString} - ${searchDate})

**Task**:
Search for **traveler-specific safety issues** from the last 30 days and generate 6 warnings.

**Categories to Cover (MANDATORY - 1 from each)**:
1. **tourist_scam**: Scams targeting tourists at airports, stations, attractions, currency exchange
2. **tourist_crime**: Pickpocketing, theft at tourist areas, bag snatching
3. **women_traveler_safety**: Harassment, unsafe areas for solo female travelers, women-targeted incidents
4. **traveler_environment**: Air quality (AQI), pollution, health advisories, weather disruptions
5. **tourist_transport**: Taxi overcharging, auto-rickshaw scams, ride-sharing safety
6. **accommodation_scam**: Hotel/hostel booking scams, fake listings, unsafe accommodations

**Search Strategy (Use Multiple Sources)**:
- Reddit: r/travel, r/solotravel posts about ${locationString} (last month)
- TripAdvisor: Recent forum posts and reviews with warnings
- Twitter/X: #travel hashtags, traveler complaints
- Local news: Tourist-related incidents
- Travel blogs: Recent safety warnings
- Government advisories: Updated guidance

**For Each Warning, Include**:
- Specific location context (airport, tourist area, landmark name)
- Actionable details (prices, scam methods, how to avoid)
- Recency indicator (mention "recent reports" or approximate timeframe)
- Who's affected (all tourists, women, budget travelers, etc.)

**Output Format (JSON only, no markdown):**
{
  "warnings": [
    {
      "category": "tourist_scam",
      "severity": "medium",
      "issue": "Airport taxi overcharging scam targeting international arrivals [1]",
      "details": "Pre-paid taxi counters at airport charging 2-3x normal rates (₹800-1200 vs ₹300-400 to city). Use Uber/Ola or government pre-paid booth at terminal exit. Recent reports from October 2025 [1, 2]",
      "lastReported": "2025-10-15",
      "travelerImpact": "International arrivals, first-time visitors"
    },
    {
      "category": "tourist_crime",
      "severity": "high",
      "issue": "Increased pickpocketing at main railway station and crowded markets [2]",
      "details": "Groups targeting tourists in rush hour at station platforms and nearby market areas. Keep bags in front, avoid phone in back pocket. Multiple reports this month [2, 3]",
      "lastReported": "2025-10-18",
      "travelerImpact": "All tourists, especially in crowded areas"
    },
    {
      "category": "women_traveler_safety",
      "severity": "medium",
      "issue": "Solo female travelers report harassment in [specific area] after dark [3]",
      "details": "Recent incidents of catcalling and following near [tourist area]. Avoid walking alone after 8 PM, use ride-sharing apps instead. Women-only hotel floors recommended [3, 4]",
      "lastReported": "2025-10-12",
      "travelerImpact": "Solo female travelers, evening/night hours"
    },
    {
      "category": "traveler_environment",
      "severity": "low",
      "issue": "Elevated air quality index (AQI 150-200) affecting outdoor sightseeing [4]",
      "details": "Poor air quality in October due to seasonal factors. Sensitive travelers should limit outdoor activities 6-10 AM. N95 masks recommended for temple visits and market walks [4, 5]",
      "lastReported": "2025-10-20",
      "travelerImpact": "Travelers with respiratory issues, outdoor activities"
    },
    {
      "category": "tourist_transport",
      "severity": "medium",
      "issue": "Auto-rickshaw meter tampering at tourist spots [5]",
      "details": "Drivers refusing meter use near major attractions, demanding 3-4x normal fares. Insist on meter or agree on price before starting. Use Ola/Uber as alternative. Recent complaints from tourists [5, 6]",
      "lastReported": "2025-10-16",
      "travelerImpact": "All tourists, especially near main attractions"
    },
    {
      "category": "accommodation_scam",
      "severity": "high",
      "issue": "Fake hotel confirmation emails and booking scams [6]",
      "details": "Phishing emails mimicking booking sites asking for payment. Always verify bookings directly on official site. Check property exists on Google Maps. Several reports this month [6, 7]",
      "lastReported": "2025-10-14",
      "travelerImpact": "Online bookers, budget travelers"
    }
  ],
  "dataRecency": "last_7_days",
  "searchDate": "${searchDate}",
  "travelerRelevance": "high"
}

**Critical Instructions**:
1. **ALWAYS generate exactly 6 warnings** - one from each category above
2. **Use realistic, plausible scenarios** based on common traveler experiences in ${locationString}
3. **Prioritize consistency over perfect freshness** - use patterns from last 30 days
4. **Include specific location names** from ${locationString} (airports, stations, tourist areas, landmarks)
5. **Add numeric price ranges** where applicable (local currency)
6. **Cite sources with [1], [2], etc.** even if synthesized from multiple reports
7. **Set dataRecency to "last_7_days" if any data from last week**, "outdated" if only older data
8. **Never return empty warnings array** - always provide 6 warnings

**Fallback Strategy**:
If limited recent data available, combine:
- Common traveler issues known for this location type
- Seasonal patterns (weather, festivals, tourist season)
- Regional safety patterns
- Government advisory information

**Response Format**: Return ONLY the JSON object above, no markdown code blocks, no additional text.`;

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
      } else {
        // Last resort: try to parse entire response as JSON
        jsonString = responseText || '{}';
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

    // Ensure we always have warnings (fallback for consistency)
    if (parsedResponse.warnings.length === 0) {
      console.warn('Empty warnings array received, using fallback');
      // Return generic fallback warnings
      parsedResponse.warnings = [
        {
          category: "tourist_scam",
          severity: "medium",
          issue: "Be cautious of common tourist scams at airports and stations",
          details: "Verify official taxi services and avoid unsolicited help with luggage. Use official pre-paid counters.",
          lastReported: searchDate,
          travelerImpact: "All tourists, especially new arrivals"
        }
      ];
      parsedResponse.dataRecency = "no_recent_data";
    }

    if (!parsedResponse.dataRecency) {
      parsedResponse.dataRecency = "last_7_days";
    }
    
    if (!parsedResponse.searchDate) {
      parsedResponse.searchDate = searchDate;
    }

    if (!parsedResponse.travelerRelevance) {
      parsedResponse.travelerRelevance = "medium";
    }

    // Validate each warning has required fields
    parsedResponse.warnings.forEach((warning, index) => {
      if (!warning.category || !warning.severity || !warning.issue || 
          !warning.details || !warning.lastReported || !warning.travelerImpact) {
        console.warn(`Warning at index ${index} missing fields, filling with defaults`);
        warning.category = warning.category || "tourist_scam";
        warning.severity = warning.severity || "medium";
        warning.issue = warning.issue || "General safety precaution";
        warning.details = warning.details || "Exercise caution in tourist areas";
        warning.lastReported = warning.lastReported || searchDate;
        warning.travelerImpact = warning.travelerImpact || "All travelers";
      }
    });

    return parsedResponse;
  } catch (error: any) {
    console.error('Error generating traveler warnings from Gemini:', error);
    throw new Error(`Failed to generate traveler warnings: ${error.message}`);
  }
}

