"use client";

import React from "react";
import { ClipboardCheck } from "lucide-react";
import { ComingSoon } from "@/components/common/ComingSoon";

export default function FinalListPage() {
  return (
    <ComingSoon
      title="Final List"
      description="Offer stage tracking, shortlisted talent selections, and hiring outcomes."
      icon={ClipboardCheck}
    />
  );
}
