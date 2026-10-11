"use client";

import React, { Suspense } from "react";
import { ApplicationsPage } from "@/features/applications/components/ApplicationsPage";

export default function AppliedJobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ApplicationsPage />
    </Suspense>
  );
}
