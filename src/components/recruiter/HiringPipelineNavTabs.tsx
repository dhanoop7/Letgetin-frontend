"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitCommit, KanbanSquare, Users } from "lucide-react";

export const HIRING_PIPELINE_TABS = [
  {
    name: "Hiring Timeline",
    href: "/recruiter/hiring-pipeline/timeline",
    icon: GitCommit,
    badge: "Journey",
  },
  {
    name: "Kanban Board",
    href: "/recruiter/hiring-pipeline/kanban",
    icon: KanbanSquare,
    badge: "6 Stages",
  },
  {
    name: "Candidate Listing",
    href: "/recruiter/hiring-pipeline/candidates",
    icon: Users,
    badge: "Directory",
  },
];

export function HiringPipelineNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 p-1 bg-surface-alt/80 border border-border/80 rounded-2xl w-fit max-w-full overflow-x-auto shadow-xs mb-6">
      {HIRING_PIPELINE_TABS.map((tab) => {
        const Icon = tab.icon;
        // Check active state: matches exact or sub-stage route under timeline
        const isActive =
          pathname === tab.href ||
          (tab.href === "/recruiter/hiring-pipeline/timeline" &&
            pathname?.startsWith("/recruiter/hiring-pipeline/timeline"));

        return (
          <Link
            key={tab.href}
            href={tab.href}
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
