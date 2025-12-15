"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react"; // <-- IMPORT useMemo
import { getSessionId } from "@/lib/session";
import { BriaSceneSchema } from "@/types/bria"; 
import { toast } from "sonner";

export interface SkuAsset {
  id: string;
  url: string; // Blob URL for preview
  file: File;  // Actual file for 16-bit upload
  name: string;
  uploadedAt: Date;
}

interface StudioContextType {
  // Session
  sessionId: string;
  
  // SKU Management
  skus: SkuAsset[];
  // --- NEW SEARCH FIELDS ---
  searchTerm: string;
  filteredSkus: SkuAsset[];
  setSearchTerm: (term: string) => void;
  // -------------------------
  activeSkuId: string | null;
  addSku: (file: File) => void;
  removeSku: (id: string) => void;
  setActiveSku: (id: string | null) => void;
  
  // Bria Schema (The "Brain")
  currentSchema: BriaSceneSchema | null;
  updateSchema: (partial: Partial<BriaSceneSchema>) => void;
  updateSchemaNested: (section: keyof BriaSceneSchema["structured_prompt"], key: string, value: any) => void;
  
  // UI States
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

// Initial Default Schema to avoid null crashes
const DEFAULT_SCHEMA: BriaSceneSchema = {
  prompt: "",
  structured_prompt: {
    short_description: "",
    background_setting: "",
    lighting: { direction: "None", conditions: "Studio", shadows: "Soft" },
    aesthetics: { mood_atmosphere: "", color_scheme: "", composition: "" },
    photographic_characteristics: { camera_angle: "Eye Level", lens_focal_length: "50mm", depth_of_field: "Medium" },
    objects: []
  },
  aspect_ratio: "4:5"
};

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState("");
  const [skus, setSkus] = useState<SkuAsset[]>([]);
  const [activeSkuId, setActiveSkuId] = useState<string | null>(null);
  const [currentSchema, setCurrentSchema] = useState<BriaSceneSchema>(DEFAULT_SCHEMA);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // New: State for search term
  const [searchTerm, setSearchTerm] = useState(""); 

  // Initialize Session
  useEffect(() => {
    const id = getSessionId();
    setSessionId(id);
  }, []);

  // New: Filtered SKUs logic
  const filteredSkus = useMemo(() => {
    if (!searchTerm) {
      return skus;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();

    return skus.filter(sku => 
      sku.name.toLowerCase().includes(lowerCaseSearch)
    );
  }, [skus, searchTerm]);

  // SKU Logic
  const addSku = (file: File) => {
    // Basic validation for "SKU-Lock" (Alpha Channel check would happen here in full Prod)
    if (!file.type.includes("png") && !file.type.includes("tiff")) {
        toast.error("Invalid Format", { description: "SKU-Lock requires PNG or TIFF with transparency." });
        return;
    }

    const newSku: SkuAsset = {
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file,
      name: file.name,
      uploadedAt: new Date()
    };

    setSkus((prev) => [newSku, ...prev]);
    setActiveSkuId(newSku.id); // Auto-select new upload
    toast.success("SKU Locked", { description: `${file.name} ready for compositing.` });
  };

  const removeSku = (id: string) => {
    setSkus((prev) => prev.filter((s) => s.id !== id));
    if (activeSkuId === id) setActiveSkuId(null);
  };

  // Schema Logic
  const updateSchema = (partial: Partial<BriaSceneSchema>) => {
    setCurrentSchema((prev) => ({ ...prev, ...partial }));
  };

  // Helper for deep updates in the Inspector
  const updateSchemaNested = (section: keyof BriaSceneSchema["structured_prompt"], key: string, value: any) => {
    setCurrentSchema((prev) => {
      if (!prev) return DEFAULT_SCHEMA;
      return {
        ...prev,
        structured_prompt: {
          ...prev.structured_prompt,
          [section]: {
            ...prev.structured_prompt[section],
            [key]: value
          }
        }
      };
    });
  };

  return (
    <StudioContext.Provider
      value={{
        sessionId,
        skus,
        searchTerm,        // Expose search term
        filteredSkus,      // Expose filtered list
        setSearchTerm,     // Expose setter function
        activeSkuId,
        addSku,
        removeSku,
        setActiveSku: setActiveSkuId,
        currentSchema,
        updateSchema,
        updateSchemaNested,
        isGenerating,
        setIsGenerating
      }}
    >
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error("useStudio must be used within a StudioProvider");
  }
  return context;
}