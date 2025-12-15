// types/bria.d.ts

export type LightingDirection = "Left" | "Right" | "Top" | "Bottom" | "Front" | "Back" | "None";
export type LightingCondition = "Natural" | "Studio" | "Hard" | "Soft" | "Warm" | "Cool" | "Neon" | "Sunlight";
export type CameraAngle = "Eye Level" | "Low Angle" | "High Angle" | "Top Down" | "Isometric";
export type LensType = "Wide Angle" | "Standard" | "Telephoto" | "Macro";

export interface BriaObject {
  name: string;
  description?: string;
  location?: "Foreground" | "Background" | "Left" | "Right" | "Center";
}

export interface BriaAesthetics {
  mood_atmosphere: string;
  color_scheme: string;
  composition: string;
}

export interface BriaPhotographic {
  camera_angle: CameraAngle;
  lens_focal_length: string; // e.g. "50mm"
  depth_of_field: "Shallow" | "Deep" | "Medium";
}

export interface BriaLighting {
  direction: LightingDirection;
  conditions: LightingCondition;
  shadows: string;
}

export interface BriaSceneSchema {
  prompt: string; // The natural language fallback
  structured_prompt: {
    short_description: string;
    background_setting: string;
    lighting: BriaLighting;
    aesthetics: BriaAesthetics;
    photographic_characteristics: BriaPhotographic;
    objects: BriaObject[];
  };
  aspect_ratio?: "1:1" | "16:9" | "9:16" | "4:5";
  sync_mode?: boolean;
}
