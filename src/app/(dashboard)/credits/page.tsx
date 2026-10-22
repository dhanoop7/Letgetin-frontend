"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function CreditsRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "payments");
    router.replace(`/profile/identity?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Loader2 className="w-8 h-8 text-primary-glow animate-spin" />
      <p className="text-sm font-medium text-ink-soft">Redirecting to Payments & Subscription...</p>
    </div>
  );
}

export default function CreditsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-primary-glow animate-spin" />
          <p className="text-sm font-medium text-ink-soft">Loading Payments & Subscription...</p>
        </div>
      }
    >
      <CreditsRedirectInner />
    </Suspense>
  );
}
