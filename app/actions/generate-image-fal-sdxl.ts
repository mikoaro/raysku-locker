"use server";

import { fal } from "@fal-ai/client";
import { API_CONFIG } from "@/utils/constants";
import { BriaSceneSchema } from "@/types/bria";

// The endpoint ID for our Custom ComfyUI workflow on Fal
// For MVP, we use a placeholder or a standard Bria/IC-Light endpoint
const FAL_ENDPOINT = "fal-ai/fast-sdxl"; // Placeholder for the actual ComfyUI endpoint ID

export async function submitGenerationJob(
  skuFileBase64: string, // Base64 for simplicity in MVP (or signed URL in Prod)
  schema: BriaSceneSchema
) {
  
  if (!process.env.FAL_KEY) {
    // If no key, return a mock image for demo purposes
    console.log("⚠️ No FAL_KEY found. Simulating Generation.");
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      imageUrl: "https://fal.media/files/monkey/A_futuristic_coke_bottle_on_mars.png", // Example static asset
      status: "COMPLETED"
    };
  }

  try {
    // 1. Upload SKU to Fal Storage (Temporary)
    // Note: For large 16-bit files, we'd use a client-side direct upload.
    // Here we assume the frontend passes a data URI or we upload the blob.
    const skuUrl = await fal.storage.upload(new Blob([Buffer.from(skuFileBase64.split(',')[1], 'base64')]));

    // 2. Submit to Queue
    const result = await fal.subscribe(FAL_ENDPOINT, {
      input: {
        prompt: schema.prompt,
        image_url: skuUrl,
        // Mapping Bria Schema to ComfyUI Inputs
        lighting_direction: schema.structured_prompt.lighting.direction,
        camera_angle: schema.structured_prompt.photographic_characteristics.camera_angle,
        // ... mapped parameters passed to Custom Node
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
