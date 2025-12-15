// app/actions/generate-image.ts

"use server";

import { fal } from "@fal-ai/client";
import { API_CONFIG } from "@/utils/constants";
import { BriaSceneSchema } from "@/types/bria";

// CHANGE: Use IC-Light V2.
// Ideally suited for "SKU Locking" because it preserves the subject
// and only generates the lighting/background.
const FAL_ENDPOINT = "fal-ai/iclight-v2";

export async function submitGenerationJob(
  skuFileBase64: string,
  schema: BriaSceneSchema
) {
  if (!process.env.FAL_KEY) {
    console.log("⚠️ No FAL_KEY found. Simulating Generation.");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return {
      imageUrl:
        "https://fal.media/files/monkey/A_futuristic_coke_bottle_on_mars.png",
      status: "COMPLETED",
    };
  }

  try {
    // 1. Upload SKU to Fal Storage
    const skuUrl = await fal.storage.upload(
      new Blob([Buffer.from(skuFileBase64.split(",")[1], "base64")])
    );

    // 2. Map Bria's "Lighting Direction" to IC-Light's "initial_latent"
    // Bria options: "Left", "Right", "Top", "Bottom", "Front", "Back", "None"
    // IC-Light options: "Left", "Right", "Top", "Bottom", "None"
    let lightingPreference = "None";
    const direction = schema.structured_prompt.lighting.direction;
    if (["Left", "Right", "Top", "Bottom"].includes(direction)) {
      lightingPreference = direction;
    }

    // 3. Submit to Queue
    const result = await fal.subscribe(FAL_ENDPOINT, {
      input: {
        image_url: skuUrl,
        prompt: schema.prompt, // e.g. "Summer picnic..."

        // Controls where the light comes from based on your text description
        initial_latent: lightingPreference,

        // Standard settings for product photography
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

    // IC-Light V2 returns a list of images
    return {
      imageUrl: result.data.images[0].url,
      status: "COMPLETED",
    };
  } catch (error) {
    console.error("Fal Pipeline Error:", error);
    throw new Error("Generation Failed");
  }
}
