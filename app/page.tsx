import { StudioProvider } from "@/components/providers/studio-context";
import { SkuLocker } from "@/components/dashboard/sku-locker";
import { CampaignInput } from "@/components/dashboard/campaign-input";
import { StagingInspector } from "@/components/dashboard/staging-inspector";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import Link from "next/link";

export default function VirtualStudioPage() {
  return (
    <StudioProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
        
        {/* Global Header */}
        <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-card z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-foreground">IS</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">RaySKU Locker</span>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline-block">
              v1.0 • Bria FIBO • 16-bit
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/about">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                <Info className="w-3 h-3" /> About / How it Works
              </Button>
            </Link>
          </div>
        </header>

        {/* Studio Grid Layout */}
        <main className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Assets (Resizable logic implied, fixed for MVP) */}
          <aside className="w-70 hidden md:flex flex-col z-10">
            <SkuLocker />
          </aside>

          {/* Center Stage: Canvas */}
          <section className="flex-1 flex flex-col min-w-0 z-0">
            <CampaignInput />
          </section>

          {/* Right Panel: Inspector */}
          <aside className="w-87.5 hidden lg:flex flex-col border-l border-border bg-card/50 z-10">
            <StagingInspector />
          </aside>
        </main>

        {/* Mobile Warning (Optional Polish) */}
        <div className="md:hidden p-4 text-center text-xs text-muted-foreground bg-secondary/50">
          <p>For the best Pro-Tool experience, please use a desktop device.</p>
        </div>
      </div>
    </StudioProvider>
  );
}
