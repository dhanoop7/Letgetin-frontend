"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, isInitialized, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [isInitialized, checkAuth]);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!isAuthenticated) {
        router.replace("/auth");
      } else if (user?.role === "recruiter") {
        const isProfile = pathname === "/profile" || pathname?.startsWith("/profile/");
        if (isProfile) {
          // Allow all account types (Candidate, Company, Startup, Institution) to view My Profile & Identity
          return;
        }
        if (pathname === "/e-sign") {
          router.replace("/recruiter/e-sign");
        } else if (pathname === "/interviews/translator") {
          router.replace("/recruiter/resume-translator");
        } else if (pathname === "/linguistic-test") {
          router.replace("/recruiter/linguistic-test");
        } else {
          router.replace("/recruiter/dashboard");
        }
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, user, router, pathname]);

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-ink-soft">
        <Loader2 className="w-8 h-8 animate-spin text-primary-glow mb-4" />
        <p className="text-sm font-medium">Authenticating session...</p>
      </div>
    );
  }

  const isProfileRoute = pathname === "/profile" || pathname?.startsWith("/profile/");
  if (!isAuthenticated || (user?.role === "recruiter" && !isProfileRoute)) {
    return null;
  }

  return <>{children}</>;
}

export const CandidateGuard = AuthGuard;
