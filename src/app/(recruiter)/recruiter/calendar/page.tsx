"use client";

import React from "react";
import { BordioPlanner } from "@/components/bordio/BordioPlanner";

export default function WorkforceCalendarPage() {
  return (
    <BordioPlanner
      title="Workforce Calendar & Day Planner"
      subtitle="Unified daily & weekly schedules, corporate events, and team capacity tracking."
      badgeLabel="Workforce Calendar"
      defaultView="week"
    />
  );
}
