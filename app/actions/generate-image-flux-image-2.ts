// app/actions/generate-image.ts

"use server";

import { fal } from "@fal-ai/client";
import { API_CONFIG } from "@/utils/constants";
import { BriaSceneSchema } from "@/types/bria";

// Keep the Image-to-Image endpoint
const FAL_ENDPOINT = "fal-ai/flux/dev/image-to-image";

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

    // 2. Submit to Queue
    // We removed 'image_size' and 'enable_safety_checker' to fix the 422 Error
    const result = await fal.subscribe(FAL_ENDPOINT, {
      input: {
        prompt: schema.prompt,
        image_url: skuUrl,

        // Strength: 0.85 tries to keep the shoe's shape while changing the background.
        // CHANGE THIS VALUE
        // 0.85 was turning your Salomon into a New Balance.
        // 0.70 will force it to keep the original branding/colors.
        strength: 0.7,

        guidance_scale: 3.5,
        num_inference_steps: 28,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Pipeline Running...");
        }
      },
    });

    return {
      imageUrl: result.data.images[0].url,
      status: "COMPLETED",
    };
  } catch (error) {
    console.error("Fal Pipeline Error:", error);
    throw new Error("Generation Failed");
  }
}
