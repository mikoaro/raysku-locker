"use client";

import React, { useState, useEffect } from "react"; // 1. Added useEffect
import { useStudio } from "@/components/providers/studio-context";
import { generateSceneSchema } from "@/app/actions/generate-schema";
import { submitGenerationJob } from "@/app/actions/generate-image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Wand2, Zap, Globe, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_TRENDS, MOCK_REGIONS } from "@/utils/constants";

export function CampaignInput() {
  const {
    activeSkuId,
    skus,
    currentSchema,
    updateSchema,
    isGenerating,
    setIsGenerating,
  } = useStudio();

  const [brief, setBrief] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<string>("");

  // 2. Add Mounted State to prevent Hydration Mismatch on Radix UI components
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeSku = skus.find((s) => s.id === activeSkuId);

  // Helper: Convert File to Base64 (for MVP Server Action)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Helper: Handle Image Download
  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      toast.info("Preparing Download...");

      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `infinite-shelf-asset-${Date.now()}.png`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download Started");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download Failed", {
        description: "Could not save the image.",
      });
    }
  };

  const handleGenerate = async () => {
    if (!activeSku || !brief) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      setProgressStep("Agent Analyzing Brief...");
      const schema = await generateSceneSchema(brief, activeSku.name);
      updateSchema(schema);

      setProgressStep("Calculating Light Physics...");
      await new Promise((r) => setTimeout(r, 800));

      setProgressStep("Compositing 16-bit HDR...");
      const base64File = await fileToBase64(activeSku.file);
      const result = await submitGenerationJob(base64File, schema);

      setGeneratedImage(result.imageUrl);
      toast.success("Generation Complete", {
        description: "16-bit Asset ready for download.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Generation Failed", {
        description: "Please check the console.",
      });
    } finally {
      setIsGenerating(false);
      setProgressStep("");
    }
  };

  const applyTrend = (trend: string) => {
    setBrief((prev) => (prev ? `${prev}, ${trend}` : trend));
  };

  // 3. Prevent rendering the interactive UI (Radix Selects) until client-side hydration is complete
  // This prevents the ID mismatch error while maintaining the layout structure.
  if (!isMounted) {
    return (
      <div className="flex-1 flex flex-col h-full bg-background relative" />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      {/* Top Bar: Controls */}
      <div className="p-4 border-b border-border flex items-start gap-4 bg-card/30">
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder={
              activeSku
                ? "Describe the scene (e.g., 'Summer picnic on a wooden table, sunlight from right')"
                : "Select a SKU from the Locker to begin..."
            }
            className="resize-none h-20 text-sm"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            disabled={!activeSku || isGenerating}
          />

          <div className="flex items-center gap-2">
            {/* Quick Actions / Trends */}
            <Select onValueChange={(val) => applyTrend(val)}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <Zap className="w-3 h-3 mr-2 text-yellow-500" />
                <SelectValue placeholder="Trend Jack" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_TRENDS.map((t) => (
                  <SelectItem
                    key={t.id}
                    value={t.aesthetic}
                    className="text-xs"
                  >
                    {t.topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(val) => applyTrend(val)}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <Globe className="w-3 h-3 mr-2 text-blue-500" />
                <SelectValue placeholder="Localize" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_REGIONS.map((r) => (
                  <SelectItem key={r.code} value={r.name} className="text-xs">
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          size="lg"
          className="h-20 w-32 flex flex-col gap-1"
          disabled={!activeSku || !brief || isGenerating}
          onClick={handleGenerate}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs">Processing</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span className="text-xs font-semibold">GENERATE</span>
            </>
          )}
        </Button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 p-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-64 space-y-4">
              <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
                <div className="h-full bg-primary animate-indeterminate-bar" />
              </div>
              <p className="text-sm font-medium text-center animate-pulse text-muted-foreground">
                {progressStep}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedImage && !isGenerating && (
          <div className="text-center opacity-30 select-none">
            <h1 className="text-4xl font-bold tracking-tighter mb-2">
              RaySKU LOCKER
            </h1>
            <p className="text-sm uppercase tracking-widest">
              Bria FIBO • 16-bit Engine
            </p>
          </div>
        )}

        {/* Result Image */}
        {generatedImage && !isGenerating && (
          <div className="relative group max-h-full max-w-full shadow-2xl rounded-sm overflow-hidden border-4 border-white dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedImage}
              alt="Generated Asset"
              className="max-h-[70vh] object-contain"
            />

            {/* Indemnity Badge */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge
                variant="secondary"
                className="gap-1 shadow-lg cursor-pointer hover:bg-white"
                onClick={handleDownload}
              >
                <Download className="w-3 h-3" />
                Download 16-bit TIFF
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
