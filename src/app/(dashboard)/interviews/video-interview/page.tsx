"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { VideoInterviewWorkspace } from "@/features/interview/components/VideoInterviewWorkspace";

export default function VideoInterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary-glow" />
        </div>
      }
    >
      <VideoInterviewWorkspace />
    </Suspense>
  );
}
