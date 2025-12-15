"use client";

import { useStudio } from "@/components/providers/studio-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, Camera, Palette, FileJson, Layers } from "lucide-react";

export function StagingInspector() {
  const { currentSchema, isGenerating } = useStudio();

  // Default state if no generation has happened yet
  if (!currentSchema) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/50">
        <Layers className="w-12 h-12 mb-4 opacity-20" />
        <h3 className="font-semibold mb-1">Awaiting Brief</h3>
        <p className="text-xs">
          Generate a scene to inspect the agent's photographic decisions.
        </p>
      </div>
    );
  }

  const { structured_prompt } = currentSchema;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border bg-card">
        <h2 className="font-semibold text-sm tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          STAGING INSPECTOR
        </h2>
        <p className="text-[10px] text-muted-foreground mt-1">
          Bria FIBO JSON Controller
        </p>
      </div>

      <Tabs defaultValue="physics" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="physics">📸 Physics</TabsTrigger>
            <TabsTrigger value="json">🤖 JSON Brain</TabsTrigger>
          </TabsList>
        </div>

        {/* VISUAL INSPECTOR */}
        <TabsContent
          value="physics"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Lighting Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Lightbulb className="w-3 h-3" /> Lighting Physics
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <InspectorItem
                    label="Direction"
                    value={structured_prompt.lighting.direction}
                  />
                  <InspectorItem
                    label="Condition"
                    value={structured_prompt.lighting.conditions}
                  />
                  <div className="col-span-2">
                    <InspectorItem
                      label="Shadows"
                      value={structured_prompt.lighting.shadows}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Camera Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Camera className="w-3 h-3" /> Camera & Lens
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <InspectorItem
                    label="Angle"
                    value={
                      structured_prompt.photographic_characteristics
                        .camera_angle
                    }
                  />
                  <InspectorItem
                    label="Focal Len"
                    value={
                      structured_prompt.photographic_characteristics
                        .lens_focal_length
                    }
                  />
                  <InspectorItem
                    label="DoF"
                    value={
                      structured_prompt.photographic_characteristics
                        .depth_of_field
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Aesthetics Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Palette className="w-3 h-3" /> Composition
                </div>
                <InspectorItem
                  label="Mood"
                  value={structured_prompt.aesthetics.mood_atmosphere}
                />
                <InspectorItem
                  label="Setting"
                  value={structured_prompt.background_setting}
                  fullWidth
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* RAW JSON INSPECTOR */}
        <TabsContent value="json" className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-zinc-950 p-4 overflow-auto">
            <pre className="text-[10px] font-mono text-green-400 whitespace-pre-wrap">
              {JSON.stringify(currentSchema, null, 2)}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InspectorItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`bg-secondary/30 rounded-md p-2 border border-border ${
        fullWidth ? "w-full" : ""
      }`}
    >
      <span className="text-[10px] text-muted-foreground block mb-0.5">
        {label}
      </span>
      <span
        className="text-xs font-medium text-foreground block truncate"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
