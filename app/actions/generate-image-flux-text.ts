// app/actions/generate-image.ts

"use server";

import { fal } from "@fal-ai/client";
import { API_CONFIG } from "@/utils/constants";
import { BriaSceneSchema } from "@/types/bria";

// CHANGE: Switch to Flux Dev, the most reliable high-quality model on Fal right now
const FAL_ENDPOINT = "fal-ai/flux/dev"; 

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
    // We create a blob from the base64 string
    const skuUrl = await fal.storage.upload(new Blob([Buffer.from(skuFileBase64.split(',')[1], 'base64')]));

    // 2. Submit to Queue (Flux Dev Image-to-Image configuration)
    const result = await fal.subscribe(FAL_ENDPOINT, {
      input: {
        prompt: schema.prompt,
        image_url: skuUrl, // Passing the shoe image here enables "Image-to-Image" mode
        
        // Critical Parameter: Strength
        // 1.0 = Ignore input image completely (Hallucinate new shoes)
        // 0.95 = Change background heavily, keep main shapes
        // 0.70 = Keep structure rigid, change style lightly
        strength: 0.95, 
        
        // Flux specific settings for realism
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