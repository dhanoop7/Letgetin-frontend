"use client";

import React from "react";
import { BordioPlanner } from "@/components/bordio/BordioPlanner";

export default function InstitutionCalendarPage() {
  return (
    <BordioPlanner
      title="Institution Academic & Placement Calendar"
      subtitle="Placement drives, written aptitude assessments, and faculty interview panel schedules"
      badgeLabel="Institution Calendar"
      defaultView="week"
      moduleContext="institution"
    />
  );
}
