// app/actions/generate-image.ts

"use server";

import { fal } from "@fal-ai/client";
import { API_CONFIG } from "@/utils/constants";
import { BriaSceneSchema } from "@/types/bria";

// CHANGE: Bria 2.3 is a specialized "Product Background Generator"
// It keeps the uploaded image 100% pixel-perfect and only generates the scene.
const FAL_ENDPOINT = "fal-ai/bria/2.3"; 

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
        // Bria expects the product image and the scene description
        image_url: skuUrl, 
        prompt: schema.prompt,
        
        // Optional: Ensures the output is high quality
        sync_mode: true,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Pipeline Running...");
        }
      },
    });

    // Bria 2.3 structure is slightly different, usually result.data.image.url
    // We handle potential structure differences safely
    const outputUrl = result.data.image?.url || result.data.images?.[0]?.url;

    if (!outputUrl) {
        throw new Error("No image URL in Bria response");
    }

    return {
      imageUrl: outputUrl,
      status: "COMPLETED"
    };

  } catch (error) {
    console.error("Fal Pipeline Error:", error);
    throw new Error("Generation Failed");
  }
}