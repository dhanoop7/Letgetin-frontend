"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { GitCommit, KanbanSquare, FileCheck2, Award } from "lucide-react";

export const HIRING_PIPELINE_TABS = [
  {
    name: "Resume Shortlisting",
    href: "/recruiter/hiring-pipeline/resume-screening",
    icon: FileCheck2,
    badge: "Qualification",
  },
  {
    name: "Hiring Timeline",
    href: "/recruiter/hiring-pipeline/timeline",
    icon: GitCommit,
    badge: "Funnel",
  },
  {
    name: "Kanban",
    href: "/recruiter/hiring-pipeline/kanban",
    icon: KanbanSquare,
    badge: "Live",
  },
  {
    name: "Final Shortlist",
    href: "/recruiter/hiring-pipeline/final-shortlist",
    icon: Award,
    badge: "Decisions",
  },
];

interface HiringPipelineNavTabsProps {
  jobId?: string;
}

export function HiringPipelineNavTabs({ jobId }: HiringPipelineNavTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentJobId = jobId || searchParams.get("jobId");

  return (
    <div className="flex items-center gap-1.5 p-1 bg-surface-alt/80 border border-border/80 rounded-2xl w-fit max-w-full overflow-x-auto shadow-xs mb-6">
      {HIRING_PIPELINE_TABS.map((tab) => {
        const Icon = tab.icon;
        const targetHref = currentJobId ? `${tab.href}?jobId=${currentJobId}` : tab.href;

        const isActive =
          pathname === tab.href ||
          (tab.href === "/recruiter/hiring-pipeline/resume-screening" &&
            pathname?.startsWith("/recruiter/hiring-pipeline/resume-screening")) ||
          (tab.href === "/recruiter/hiring-pipeline/timeline" &&
            pathname?.startsWith("/recruiter/hiring-pipeline/timeline")) ||
          (tab.href === "/recruiter/hiring-pipeline/kanban" &&
            pathname?.startsWith("/recruiter/hiring-pipeline/kanban")) ||
          (tab.href === "/recruiter/hiring-pipeline/final-shortlist" &&
            pathname?.startsWith("/recruiter/hiring-pipeline/final-shortlist"));

        return (
          <Link
            key={tab.href}
            href={targetHref}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              isActive
                ? "bg-surface text-primary shadow-xs border border-border/60"
                : "text-ink-soft hover:text-ink hover:bg-surface/50"
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 ${
                isActive ? "text-primary-glow" : "text-ink-soft"
              }`}
            />
            <span>{tab.name}</span>
            {tab.badge && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? "bg-primary/10 text-primary-glow"
                    : "bg-surface text-ink-soft"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
