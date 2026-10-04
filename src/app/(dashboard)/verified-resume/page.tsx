"use client";

import React, { Suspense } from "react";
import { VerifiedResumeWorkspace } from "@/features/resume/components/verified/VerifiedResumeWorkspace";

export default function VerifiedResumePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Suspense fallback={<div className="h-[600px] bg-surface/50 rounded-3xl animate-pulse" />}>
          <VerifiedResumeWorkspace />
        </Suspense>
      </main>
    </div>
  );
}
