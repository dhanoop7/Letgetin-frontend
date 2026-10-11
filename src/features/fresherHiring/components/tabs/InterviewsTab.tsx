import React from "react";
import { FresherPageHeader } from "../ui/FresherPageHeader";
import { FresherDataTable, type FresherColumn } from "../ui/FresherDataTable";
import { FresherPill } from "../ui/FresherPill";
import type { Interview } from "../../types";
import { CalendarDays, PlusCircle, Video } from "lucide-react";
import { toast } from "sonner";

interface Props {
  interviews: Interview[];
}

export function InterviewsTab({ interviews }: Props) {
  const columns: FresherColumn<Interview>[] = [
    {
      header: "Candidate Name",
      render: (i) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary-glow font-extrabold flex items-center justify-center text-xs shrink-0">
            {i.candidateInitials || i.candidate.charAt(0)}
          </div>
          <div>
            <span className="font-extrabold text-ink block">{i.candidate}</span>
            <span className="text-[11px] text-ink-soft">{i.role}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Evaluation Round",
      render: (i) => <span className="font-semibold text-ink">{i.round}</span>,
    },
    {
      header: "Assigned Interviewer",
      render: (i) => <span className="text-ink-soft">{i.interviewer}</span>,
    },
    {
      header: "Scheduled Slot",
      render: (i) => (
        <div className="space-y-0.5">
          <p className="font-bold text-ink">{i.date}</p>
          {i.time && <span className="text-[11px] text-ink-soft">{i.time}</span>}
        </div>
      ),
    },
    {
      header: "Status",
      render: (i) => <FresherPill tone={i.status.tone}>{i.status.label}</FresherPill>,
    },
    {
      header: "Action",
      className: "text-right",
      render: (i) => (
        <button
          type="button"
          onClick={() => toast.success(`Joining interview room with ${i.candidate}`)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary-glow text-xs font-bold transition cursor-pointer"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Join Room</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <FresherPageHeader
        title="Campus & Fresher Interview Center"
        description="Schedule technical panels, conduct AI-assisted video rounds, and collaborate on real-time candidate scorecards."
        icon={CalendarDays}
        action={
          <button
            type="button"
            onClick={() => toast.info("New interview panel builder opened")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Interview Panel</span>
          </button>
        }
      />

      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-extrabold text-ink">Upcoming Interview Slots</h3>
            <p className="text-xs text-ink-soft">
              Active rounds scheduled for this campus hiring sprint
            </p>
          </div>
          <span className="text-xs font-bold text-ink-soft">
            {interviews.length} Scheduled
          </span>
        </div>

        <FresherDataTable
          columns={columns}
          rows={interviews}
          getKey={(i) => i.id || `${i.candidate}-${i.date}`}
        />
      </div>
    </div>
  );
}
