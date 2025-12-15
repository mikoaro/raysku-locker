// app/actions/generate-image.ts

"use server";

import { fal } from "@fal-ai/client";
import { API_CONFIG } from "@/utils/constants";
import { BriaSceneSchema } from "@/types/bria";

// CHANGE 1: Use the correct endpoint for Product Photography
// "ic-light" preserves the subject and generates background/lighting
const FAL_ENDPOINT = "fal-ai/ic-light"; 

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

    // 2. Submit to Queue (IC-Light specific inputs)
    const result = await fal.subscribe(FAL_ENDPOINT, {
      input: {
        // IC-Light expects 'image_url' to be the foreground subject
        image_url: skuUrl, 
        prompt: schema.prompt, // e.g. "Summer picnic..."
        
        // Optional: Helps guide where the light comes from (Left, Right, etc.)
        image_width: 1024,
        image_height: 1280,
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