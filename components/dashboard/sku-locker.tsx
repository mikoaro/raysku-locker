"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useStudio } from "@/components/providers/studio-context";
import { cn } from "@/lib/utils";
import { Trash2, UploadCloud, Lock, Image as ImageIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function SkuLocker() {
  // Destructure new values: filteredSkus, searchTerm, setSearchTerm
  const { 
    skus, 
    filteredSkus, 
    searchTerm, 
    setSearchTerm, 
    addSku, 
    activeSkuId, 
    setActiveSku, 
    removeSku 
  } = useStudio();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      addSku(file);
    });
  }, [addSku]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/tiff': ['.tif', '.tiff']
    },
    maxFiles: 5
  });

  return (
    <div className="flex flex-col h-full border-r border-border bg-card/50">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground flex items-center gap-2">
          <Lock className="w-3 h-3" /> SKU Locker
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          16-bit Pipeline. PNG/TIFF only.
        </p>
      </div>

      {/* Search Input Field */}
      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search SKUs by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Drop Zone */}
      <div className="p-4">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="bg-background p-2 rounded-full mb-2 shadow-sm">
            <UploadCloud className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium">Drop Product SKU</p>
          <p className="text-xs text-muted-foreground mt-1">
            Transparency required
          </p>
        </div>
      </div>

      {/* SKU Grid */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="space-y-3 pb-4">
           {/* Check the length of filteredSkus */}
            {filteredSkus.length === 0 && (
              <div className="text-center py-10 opacity-50">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    {searchTerm 
                      ? `No SKUs found for "${searchTerm}"` 
                      : "No Assets Locked"
                    }
                </p>
              </div>
            )}

            {filteredSkus.map((sku) => (
              <div
                key={sku.id}
                onClick={() => setActiveSku(sku.id)}
                className={cn(
                  "group relative flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all w-61",
                  activeSkuId === sku.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:bg-accent/50"
                )}
              >
                {/* Preview Thumbnail */}
                <div className="relative w-16 h-16 bg-[url('/grid-pattern.svg')] bg-repeat rounded-md overflow-hidden border border-border shrink-0">
                   {/* Using img tag for blob url preview, strictly contained */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={sku.url} 
                    alt={sku.name} 
                    className="w-full h-full object-contain p-1" 
                  />
                  {activeSkuId === sku.id && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{sku.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] h-5 px-1">
                       {(sku.file.size / 1024 / 1024).toFixed(1)} MB
                    </Badge>
                    <span className="text-[10px] text-muted-foreground uppercase">
                        {sku.file.type.split('/')[1]}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSku(sku.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
