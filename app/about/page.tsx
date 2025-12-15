import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">

    </div>
  );
}

function Card({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 border border-border rounded-lg bg-card">
      <h3 className="font-semibold mb-2 text-primary">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}