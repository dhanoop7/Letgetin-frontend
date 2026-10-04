"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { VideoInterviewWorkspace } from "@/features/interview/components/VideoInterviewWorkspace";

function VideoInterviewLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 text-primary-glow animate-spin" />
      <p className="text-xs font-bold text-ink-soft">Loading Video Interview...</p>
    </div>
  );
}

export default function VideoInterviewPage() {
  return (
    <Suspense fallback={<VideoInterviewLoading />}>
      <VideoInterviewWorkspace />
    </Suspense>
  );
}
