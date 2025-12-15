// app/actions/generate-image.ts

"use server";

import { fal } from "@fal-ai/client";
import { API_CONFIG } from "@/utils/constants";
import { BriaSceneSchema } from "@/types/bria";

// CHANGE 1: Use the specific Image-to-Image endpoint
const FAL_ENDPOINT = "fal-ai/flux/dev/image-to-image"; 

export async function submitGenerationJob(
  skuFileBase64: string, 
  schema: BriaSceneSchema
) {
  
  if (!process.env.FAL_KEY) {
    console.log("⚠️ No FAL_KEY found. Simulating Generation.");
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      imageUrl: "https://fal.media/files/monkey/A_futuristic_coke_bottle_on_mars.png", 
      status: "COMPLETED"
    };
  }

  try {
    // 1. Upload SKU to Fal Storage
    const skuUrl = await fal.storage.upload(new Blob([Buffer.from(skuFileBase64.split(',')[1], 'base64')]));

    // 2. Submit to Queue
    const result = await fal.subscribe(FAL_ENDPOINT, {
      input: {
        prompt: schema.prompt,
        image_url: skuUrl, 
        
        // Strength controls how much we "rewrite" the image.
        // 0.95 = mostly new image (risks changing shoe).
        // 0.85 = balanced.
        strength: 0.85, 
        
        guidance_scale: 3.5,
        num_inference_steps: 28,
        enable_safety_checker: false,
        image_size: "portrait_4_5" 
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
      status: "COMPLETED"
    };

  } catch (error) {
    console.error("Fal Pipeline Error:", error);
    throw new Error("Generation Failed");
  }
}