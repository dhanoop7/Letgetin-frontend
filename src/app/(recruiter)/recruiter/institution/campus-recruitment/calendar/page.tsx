"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CalendarDays, KanbanSquare, ArrowLeft, ChevronLeft, ChevronRight, Clock, MapPin, Building2, Plus } from "lucide-react";

export default function CampusRecruitmentCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState("October 2026");

  const events = [
    {
      day: "12",
      weekday: "Mon",
      events: [
        { company: "Google India", time: "09:00 AM - 01:00 PM", type: "Technical Interview Round 1", venue: "Audi-1 & CS Lab 2", tier: "Super Dream" },
        { company: "Deloitte US-India", time: "02:30 PM - 05:00 PM", type: "Pre-Placement Talk (PPT)", venue: "Seminar Hall B", tier: "Dream" },
      ],
    },
    {
      day: "14",
      weekday: "Wed",
      events: [
        { company: "Google India", time: "10:00 AM - 04:00 PM", type: "Final Leadership Interviews", venue: "Executive Boardroom", tier: "Super Dream" },
        { company: "TCS Digital", time: "01:00 PM - 03:00 PM", type: "Online Aptitude & Coding Assessment", venue: "Computer Labs 1, 3 & 4", tier: "Core / Prime" },
      ],
    },
    {
      day: "18",
      weekday: "Sun",
      events: [
        { company: "Microsoft", time: "11:00 AM - 01:00 PM", type: "Campus Keynote & Pre-Placement Talk", venue: "Grand Auditorium (All Branches)", tier: "Super Dream" },
      ],
    },
    {
      day: "22",
      weekday: "Thu",
      events: [
        { company: "Texas Instruments", time: "09:30 AM - 12:30 PM", type: "Hardware / VLSI Written Test", venue: "ECE Department Labs", tier: "Super Dream" },
        { company: "Atlassian", time: "02:00 PM - 06:00 PM", type: "System Design Round", venue: "Virtual Rooms & Audi-2", tier: "Super Dream" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 lg:p-10 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/recruiter/institution/campus-recruitment"
              className="p-1.5 rounded-xl border border-border bg-surface text-ink-soft hover:text-ink hover:bg-surface-alt transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Recruitment Calendar</h1>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Auditorium, test lab, and interview room booking schedule for visiting corporate recruiters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/recruiter/institution/campus-recruitment/kanban"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-border text-ink hover:text-primary-glow text-xs font-bold transition"
          >
            <KanbanSquare className="w-4 h-4 text-primary-glow" />
            <span>Switch to Kanban</span>
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:opacity-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book Drive Slot</span>
          </button>
        </div>
      </div>

      {/* Month Navigation Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border shadow-xs">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary-glow" />
          <span className="text-base font-extrabold text-ink">{currentMonth}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1.5 rounded-lg bg-surface-alt hover:bg-surface border border-border text-ink transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg bg-surface-alt hover:bg-surface border border-border text-ink transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Schedule Feed */}
      <div className="space-y-4">
        {events.map((evt, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-border bg-surface shadow-xs flex flex-col md:flex-row gap-5"
          >
            {/* Date Badge */}
            <div className="flex md:flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-brand text-primary-foreground font-black shrink-0 shadow-glow">
              <span className="text-2xl leading-none">{evt.day}</span>
              <span className="text-xs uppercase tracking-wider opacity-90">{evt.weekday}</span>
            </div>

            {/* Event Items on that date */}
            <div className="flex-1 space-y-3">
              {evt.events.map((e, eIdx) => (
                <div
                  key={eIdx}
                  className="p-4 rounded-xl bg-surface-alt/50 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-ink">{e.company}</span>
                      <span className="text-[10px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        {e.tier}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-primary-glow">{e.type}</p>
                    <div className="flex items-center gap-3 text-xs text-ink-soft pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary-glow" />
                        <span>{e.time}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{e.venue}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-surface border border-border text-ink hover:text-primary-glow text-xs font-bold transition cursor-pointer self-start sm:self-center"
                  >
                    Slot Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
