import React, { Suspense } from "react";
import { Metadata } from "next";
import { VerifiedResumeWorkspace } from "@/features/resume/components/verified/VerifiedResumeWorkspace";
import { AIChat } from "@/features/aiAssistant/components/AIChat";

export const metadata: Metadata = {
  title: "Verified Resume | LetGetIn AI",
  description:
    "Preview verified resumes and complete verification for your professional resumes with AI credential validation.",
};

export default function VerifiedResumePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Suspense
          fallback={
            <div className="space-y-6 animate-pulse">
              <div className="h-36 bg-surface/50 border border-border rounded-3xl" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 h-[600px] bg-surface/50 border border-border rounded-3xl" />
                <div className="lg:col-span-4 h-[600px] bg-surface/50 border border-border rounded-3xl" />
              </div>
            </div>
          }
        >
          <VerifiedResumeWorkspace />
        </Suspense>
      </main>

      <AIChat context="resume" />
    </div>
  );
}
