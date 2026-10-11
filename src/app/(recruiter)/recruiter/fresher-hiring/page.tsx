"use client";

import React, { Suspense } from "react";
import { FresherHiringWorkspace } from "@/features/fresherHiring/components/FresherHiringWorkspace";
import { Loader2 } from "lucide-react";

export default function FresherHiringPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 text-ink-soft">
          <Loader2 className="w-8 h-8 animate-spin text-primary-glow" />
          <p className="text-xs font-semibold">Loading Fresher Hiring Suite...</p>
        </div>
      }
    >
      <FresherHiringWorkspace />
    </Suspense>
  );
}
