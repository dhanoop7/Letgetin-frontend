"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useRecruiterStore } from "@/features/recruiter/store/useRecruiterStore";
import { Loader2 } from "lucide-react";

export function RecruiterGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, isInitialized, checkAuth } = useAuthStore();
  const { orgProfile, orgProfileStatus, loadOrgProfile } = useRecruiterStore();
  const [isVerifyingOrg, setIsVerifyingOrg] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [isInitialized, checkAuth]);

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (!isAuthenticated) {
      router.replace("/auth");
      return;
    }

    if (user?.role !== "recruiter") {
      router.replace("/resume");
      return;
    }

    // Role is recruiter and authenticated.
    const isSetupPage = pathname === "/recruiter/setup";
    const isIndexRedirectPage = pathname === "/recruiter";

    if (!isSetupPage && !isIndexRedirectPage) {
      if (orgProfileStatus === "idle") {
        setIsVerifyingOrg(true);
        loadOrgProfile()
          .then((profile) => {
            if (!profile || !profile.name) {
              router.replace("/recruiter/setup");
            }
          })
          .catch(() => {
            router.replace("/recruiter/setup");
          })
          .finally(() => {
            setIsVerifyingOrg(false);
          });
      } else if (orgProfileStatus === "loaded" && (!orgProfile || !orgProfile.name)) {
        router.replace("/recruiter/setup");
      }
    }
  }, [
    isInitialized,
    isLoading,
    isAuthenticated,
    user,
    router,
    pathname,
    orgProfile,
    orgProfileStatus,
    loadOrgProfile,
  ]);

  if (isLoading || !isInitialized || isVerifyingOrg) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-ink-soft">
        <Loader2 className="w-8 h-8 animate-spin text-primary-glow mb-4" />
        <p className="text-sm font-medium">Authenticating recruiter session...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "recruiter") {
    return null;
  }

  return <>{children}</>;
}
