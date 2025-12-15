// app/actions/generate-image.ts

"use server";

import { fal } from "@fal-ai/client";
import { BriaSceneSchema } from "@/types/bria";

// ENDPOINTS
const BRIA_ENDPOINT = "bria/fibo/generate"; 
const ICLIGHT_ENDPOINT = "fal-ai/iclight-v2"; 

export async function submitGenerationJob(
  skuFileBase64: string,
  schema: BriaSceneSchema
) {
  if (!process.env.FAL_KEY) {
    console.log("⚠️ No FAL_KEY found. Simulating Generation.");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return {
      imageUrl: "https://fal.media/files/monkey/A_futuristic_coke_bottle_on_mars.png",
      status: "COMPLETED",
    };
  }

  try {
    // 1. Upload SKU
    const skuUrl = await fal.storage.upload(
      new Blob([Buffer.from(skuFileBase64.split(",")[1], "base64")])
    );

    // --- STAGE 1: BRIA FIBO ---
    console.log("Stage 1: Generating Scene with Bria...");

    const objectsString = schema.structured_prompt.objects
      .map((obj) => `${obj.name} (${obj.location})`)
      .join(", ");

    // Detailed Prompt for Bria (Background)
    const briaPrompt = `
      ${schema.structured_prompt.background_setting}. 
      Objects in scene: ${objectsString}. 
      Mood: ${schema.structured_prompt.aesthetics.mood_atmosphere}.
      High quality, photorealistic background plate, negative space in center for product.
    `.trim();

    const briaResult: any = await fal.subscribe(BRIA_ENDPOINT, {
      input: {
        prompt: briaPrompt,
        aspect_ratio: "4:5",
        num_inference_steps: 30,
      },
    });

    const bgImageUrl = briaResult.data.images[0].url;

    // --- STAGE 2: IC-LIGHT V2 ---
    console.log("Stage 2: Relighting Product into Scene...");

    let lightingPreference = "None";
    const direction = schema.structured_prompt.lighting.direction;
    if (["Left", "Right", "Top", "Bottom"].includes(direction)) {
      lightingPreference = direction;
    }

    // FIX: Pass the scene description to IC-Light so the lighting matches the background
    // Previous error: "Product shot" caused it to default to dark studio lighting.
    const icLightPrompt = `
      ${schema.structured_prompt.background_setting}, 
      ${schema.structured_prompt.lighting.conditions} lighting, 
      realistic product integration
    `.trim();

    const icLightResult = await fal.subscribe(ICLIGHT_ENDPOINT, {
      input: {
        image_url: skuUrl, 
        background_image_url: bgImageUrl, 
        prompt: icLightPrompt, // <--- CHANGED THIS
        initial_latent: lightingPreference,
        guidance_scale: 5.0,
        num_inference_steps: 28,
        enable_safety_checker: false,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Pipeline Running...");
        }
      },
    });

    return {
      imageUrl: icLightResult.data.images[0].url,
      status: "COMPLETED",
    };
  } catch (error) {
    console.error("Fal Pipeline Error:", error);
    throw new Error("Generation Failed");
  }
}