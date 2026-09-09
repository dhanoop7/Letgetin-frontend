"use client";

import React from "react";
import { BordioPlanner } from "@/components/bordio/BordioPlanner";

export default function CampusRecruitmentCalendarPage() {
  return (
    <BordioPlanner
      title="Campus Recruitment Drive Calendar"
      subtitle="Auditorium, test lab, and interview room booking schedule for visiting corporate recruiters"
      badgeLabel="Campus Placement Drives"
      defaultView="week"
      moduleContext="institution"
    />
  );
}
