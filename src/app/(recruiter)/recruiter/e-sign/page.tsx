"use client";

import React, { Suspense } from "react";
import { ESignPageContainer } from "@/features/esign/components/ESignPageContainer";

export default function RecruiterESignPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <Suspense
        fallback={
          <div className="h-[600px] bg-surface/50 rounded-3xl animate-pulse" />
        }
      >
        <ESignPageContainer />
      </Suspense>
    </div>
  );
}
