"use server";

import { BriaSceneSchema } from "@/types/bria";
import { API_CONFIG } from "@/utils/constants";

// System Prompt: The "Brain" of the operation
const SYSTEM_PROMPT = `
You are an expert Creative Director and Photographer. 
Your goal is to translate a user's creative brief into a structured JSON configuration for a programmatic photography engine.

RULES:
1. You MUST output ONLY valid JSON. No markdown, no conversation.
2. You define the scene AROUND the product. The product is immutable.
3. "lighting.direction" must be one of: "Left", "Right", "Top", "Bottom", "Front", "Back", "None".
4. "photographic_characteristics.camera_angle" must be one of: "Eye Level", "Low Angle", "High Angle", "Top Down".
5. IF the user mentions a specific country or culture (e.g. "Japan"), add culturally relevant objects to the "objects" array.

JSON STRUCTURE:
{
  "prompt": "String",
  "structured_prompt": {
    "short_description": "String",
    "background_setting": "String",
    "lighting": { "direction": "Enum", "conditions": "Enum", "shadows": "String" },
    "aesthetics": { "mood_atmosphere": "String", "color_scheme": "String", "composition": "String" },
    "photographic_characteristics": { "camera_angle": "Enum", "lens_focal_length": "String", "depth_of_field": "Enum" },
    "objects": [{ "name": "String", "location": "String" }]
  }
}
`;

export async function generateSceneSchema(
  brief: string,
  skuName: string
): Promise<BriaSceneSchema> {
  // 1. If no API Key, return a deterministic "Mock" response for the Demo
  if (!API_CONFIG.Cerebras_API_KEY && !process.env.CEREBRAS_API_KEY) {
    console.log("⚠️ No Cerebras Key found. Returning Mock Agent Response.");
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate thinking
    return mockAgentResponse(brief);
  }

  // 2. Real LLM Call (Cerebras / Llama 3)
  try {
    const response = await fetch(
      "https://api.cerebras.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            API_CONFIG.Cerebras_API_KEY || process.env.CEREBRAS_API_KEY
          }`,
        },
        body: JSON.stringify({
          model: "llama3.1-8b",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Product: ${skuName}\nBrief: ${brief}` },
          ],
          temperature: 0.2, // Low temp for deterministic JSON
          response_format: { type: "json_object" },
        }),
      }
    );

    // Replace: if (!response.ok) throw new Error("Agent Failed");
    // With this:
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ CEREBRAS API ERROR:",
        response.status,
        response.statusText
      );
      console.error("❌ ERROR DETAILS:", errorText);
      throw new Error(`Agent Failed: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content) as BriaSceneSchema;
  } catch (error) {
    console.error("Agent Error:", error);
    // Fallback to mock if API fails
    return mockAgentResponse(brief);
  }
}

// Fallback "Mock Agent" to ensure the MVP works without keys
function mockAgentResponse(brief: string): BriaSceneSchema {
  const isJapan = brief.toLowerCase().includes("japan");
  const isSummer = brief.toLowerCase().includes("summer");

  return {
    prompt: brief,
    structured_prompt: {
      short_description: isJapan
        ? "Minimalist Japanese interior"
        : "Professional studio setting",
      background_setting: isJapan
        ? "Tatami room with Shoji screens"
        : "Abstract gradient background",
      lighting: {
        direction: "Left",
        conditions: isSummer ? "Sunlight" : "Soft",
        shadows: "Long, directional",
      },
      aesthetics: {
        mood_atmosphere: isSummer ? "Bright, Energetic" : "Calm, Serene",
        color_scheme: isSummer ? "Warm Gold, Blue" : "Neutral Greys, Wood",
        composition: "Rule of thirds",
      },
      photographic_characteristics: {
        camera_angle: "Eye Level",
        lens_focal_length: "50mm",
        depth_of_field: "Shallow",
      },
      objects: isJapan
        ? [
            { name: "Bonsai Tree", location: "Background Right" },
            { name: "Tea Cup", location: "Foreground Left" },
          ]
        : [{ name: "Shadow pattern", location: "Background" }],
    },
    aspect_ratio: "4:5",
  };
}
