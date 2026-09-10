"use client";

import React from "react";
import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";

export default function TaskmitePage() {
  return (
    <CalendarWorkspace
      title="Taskmite Workspace & Productivity"
      subtitle="Sprint task delegation, backlog waiting list, time estimation, and team capacity planning."
      badgeLabel="Taskmite Productivity"
      defaultView="week"
    />
  );
}
