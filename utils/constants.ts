// utils/constants.ts
export const APP_NAME = "RaySKU Locker";
export const APP_VERSION = "1.0.0-MVP";

export const API_CONFIG = {
  FAL_KEY: process.env.FAL_KEY || "FAL_KEY_NOT_SET",
  FAL_QUEUE_URL: "queue/fal-ai/comfy-ui", // Placeholder for custom endpoint
  BRIA_API_KEY: process.env.BRIA_API_KEY || "BRIA_KEY_NOT_SET",
  CEREBRAS_API_KEY: process.env.CEREBRAS_API_KEY || "CEREBRAS_KEY_NOT_SET",
};

export const MOCK_TRENDS = [
  { id: "1", topic: "#PinkMoon", aesthetic: "Surreal, glowing pink illumination, night sky" },
  { id: "2", topic: "#CyberMonday", aesthetic: "Neon blue and purple, digital grid, high tech" },
  { id: "3", topic: "#CottageCore", aesthetic: "Rustic, warm sunlight, wooden textures, floral" },
];

export const MOCK_REGIONS = [
  { code: "US", name: "United States", objects: ["Pancakes", "Baseball"] },
  { code: "JP", name: "Japan", objects: ["Tatami Mat", "Tea Set", "Bonsai"] },
  { code: "BR", name: "Brazil", objects: ["Tropical foliage", "Bright colors"] },
];
