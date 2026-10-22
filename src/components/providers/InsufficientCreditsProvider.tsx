"use client";

import React, { useState, useEffect } from "react";
import { InsufficientCreditsModal } from "@/components/common/InsufficientCreditsModal";

export function InsufficientCreditsProvider() {
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    serviceName: string;
    requiredCredits: number;
    availableBalance: number;
  }>({
    isOpen: false,
    serviceName: "Premium Service",
    requiredCredits: 20,
    availableBalance: 0,
  });

  useEffect(() => {
    const handleInsufficientCredits = (e: Event) => {
      const customEvent = e as CustomEvent<{
        serviceName?: string;
        feature?: string;
        requiredCredits?: number;
        availableBalance?: number;
      }>;

      if (!customEvent.detail) return;

      const { serviceName, feature, requiredCredits, availableBalance } = customEvent.detail;

      setModalData({
        isOpen: true,
        serviceName: serviceName || feature || "Premium Service",
        requiredCredits: requiredCredits ?? 20,
        availableBalance: availableBalance ?? 0,
      });
    };

    window.addEventListener("letgetin:insufficient_credits", handleInsufficientCredits);
    return () => {
      window.removeEventListener("letgetin:insufficient_credits", handleInsufficientCredits);
    };
  }, []);

  return (
    <InsufficientCreditsModal
      isOpen={modalData.isOpen}
      onClose={() => setModalData((prev) => ({ ...prev, isOpen: false }))}
      serviceName={modalData.serviceName}
      requiredCredits={modalData.requiredCredits}
      availableBalance={modalData.availableBalance}
    />
  );
}
