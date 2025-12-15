// app/actions/generate-image.ts
"use server";

import { fal } from "@fal-ai/client";
import { BriaSceneSchema } from "@/types/bria";

const BRIA_ENDPOINT = "bria/fibo/generate"; // Scene Generator
const ICLIGHT_ENDPOINT = "fal-ai/iclight-v2"; // Relighting/Compositor

export async function submitGenerationJob(
  skuFileBase64: string,
  schema: BriaSceneSchema
) {
  // 1. Upload SKU (The Shoe)
  const skuUrl = await fal.storage.upload(
    new Blob([Buffer.from(skuFileBase64.split(",")[1], "base64")])
  );

  // --- STAGE 1: BRIA FIBO (Generate the Scene) ---
  // The Agent must have generated a prompt specifically for a BACKGROUND.
  // e.g., "A rustic picnic table with space in the center..."
  console.log("Stage 1: Generating Scene with Bria...");
  
  const briaResult: any = await fal.subscribe(BRIA_ENDPOINT, {
    input: {
      prompt: schema.structured_prompt.background_setting + ", " + schema.structured_prompt.aesthetics.mood_atmosphere,
      // Bria specific parameters for high fidelity
      aspect_ratio: "4:5", 
      num_inference_steps: 30,
    },
  });
  
  const bgImageUrl = briaResult.data.images[0].url;

  // --- STAGE 2: IC-LIGHT V2 (Relight & Merge) ---
  console.log("Stage 2: Relighting Product into Scene...");

  // Map Lighting Direction
  let lightingPreference = "None";
  const direction = schema.structured_prompt.lighting.direction;
  if (["Left", "Right", "Top", "Bottom"].includes(direction)) {
    lightingPreference = direction;
  }

  const icLightResult = await fal.subscribe(ICLIGHT_ENDPOINT, {
    input: {
      image_url: skuUrl, // The Foreground (Shoe)
      
      // CRITICAL: We pass the Bria image as the "background" 
      // IC-Light will calculate lighting based on THIS image.
      background_image_url: bgImageUrl, 
      
      prompt: "Product shot, realistic lighting, 8k", // Keep simple, let the image do the work
      initial_latent: lightingPreference,
      guidance_scale: 5.0,
      enable_safety_checker: false,
    },
  });

  return {
    imageUrl: icLightResult.data.images[0].url,
    status: "COMPLETED",
  };
}