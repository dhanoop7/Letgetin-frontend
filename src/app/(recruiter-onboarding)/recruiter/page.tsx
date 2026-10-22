"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useRecruiterStore } from "@/features/recruiter/store/useRecruiterStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export default function RecruiterIndexPage() {
  const router = useRouter();
  const { loadOrgProfile } = useRecruiterStore();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/auth?mode=signin");
      return;
    }

    loadOrgProfile()
      .then((profile) => {
        if (profile && profile.name) {
          router.replace("/recruiter/dashboard");
        } else {
          router.replace("/recruiter/setup");
        }
      })
      .catch(() => {
        router.replace("/recruiter/setup");
      });
  }, [router, isAuthenticated, isLoading, loadOrgProfile]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-ink-soft">
      <Loader2 className="w-8 h-8 animate-spin text-primary-glow mb-4" />
      <p className="text-sm font-medium">Loading your recruiter workspace...</p>
    </div>
  );
}
