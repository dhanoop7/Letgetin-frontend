"use client";

import React from "react";
import { BordioPlanner } from "@/components/bordio/BordioPlanner";

export default function TaskmitePage() {
  return (
    <BordioPlanner
      title="Taskmite Workspace & Productivity"
      subtitle="Sprint task delegation, backlog waiting list, time estimation, and team capacity planning."
      badgeLabel="Taskmite Productivity"
      defaultView="week"
    />
  );
}
