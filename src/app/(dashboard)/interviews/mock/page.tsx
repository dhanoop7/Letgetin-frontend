"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { MockupTestWorkspace } from "@/features/mockupTest/components/MockupTestWorkspace";

function MockupTestLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 text-primary-glow animate-spin" />
      <p className="text-xs font-bold text-ink-soft">Loading AI Interview Suite...</p>
    </div>
  );
}

export default function MockUpInterviewPage() {
  return (
    <Suspense fallback={<MockupTestLoading />}>
      <MockupTestWorkspace />
    </Suspense>
  );
}
