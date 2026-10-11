'use client';

import React, { useState } from 'react';
import {
  Calendar,
  MessageSquare,
  ExternalLink,
  UserCheck,
  CheckCircle2,
  Users,
  Clock,
  Mail,
  X,
  Plus,
} from 'lucide-react';
import { StepId, TeamMember } from '../types';
import { useCandidateOnboardingStore } from '../store/useCandidateOnboardingStore';
import { mockTeamMembers } from '../mocks/team';
import { PageHeader } from './PageHeader';
import { StepFooter } from './StepFooter';
import { StatusBadge } from './StatusBadge';

interface TeamViewProps {
  onSelectStep: (stepId: StepId | 'dashboard') => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ onSelectStep }) => {
  const stepStatus = useCandidateOnboardingStore((state) => state.stepStatus);
  const setStepStatus = useCandidateOnboardingStore((state) => state.setStepStatus);
  const candidate = useCandidateOnboardingStore((state) => state.candidate);

  const [teamList, setTeamList] = useState<TeamMember[]>(mockTeamMembers);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [meetingDate, setMeetingDate] = useState('2026-10-16');
  const [meetingTime, setMeetingTime] = useState('03:00 PM');
  const [meetingTopic, setMeetingTopic] = useState('Introductory Sync & Onboarding Questions');
  const [scheduledSuccess, setScheduledSuccess] = useState<string | null>(null);

  const rawManager = teamList.find((m) => m.isManager) || teamList[0]!;
  const manager: TeamMember = {
    ...rawManager,
    name: candidate.manager?.name || rawManager.name,
    role: candidate.manager?.role || rawManager.role,
    email: candidate.manager?.email || rawManager.email,
  };

  const peers = teamList.filter((m) => !m.isManager);

  const handleOpenScheduleModal = (member: TeamMember) => {
    setSelectedMember(member);
    setMeetingTopic(`Introductory 1:1 with ${member.name}`);
    setScheduledSuccess(null);
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setTeamList((prev) =>
      prev.map((m) =>
        m.id === selectedMember.id
          ? {
              ...m,
              scheduledMeeting: {
                date: meetingDate,
                time: meetingTime,
                topic: meetingTopic,
              },
            }
          : m,
      ),
    );

    setScheduledSuccess(`Meeting successfully scheduled with ${selectedMember.name}!`);
    setTimeout(() => {
      setSelectedMember(null);
      setScheduledSuccess(null);
    }, 1200);
  };

  const handleContinue = () => {
    setStepStatus('team', 'completed');
    onSelectStep('checklist');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left">
      <PageHeader
        stepId="team"
        title="Meet Your Team & Peers"
        description="Connect with your leadership, buddy, and cross-functional partners. Schedule 1:1 check-ins ahead of your first week."
        badge={<StatusBadge status={stepStatus.team} size="md" />}
        onBackToDashboard={() => onSelectStep('dashboard')}
      />

      {/* 1. Manager Highlight Card */}
      <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-xs bg-gradient-to-r from-primary/5 via-purple-500/5 to-transparent space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-brand text-white font-black text-xl flex items-center justify-center shadow-elegant">
                {manager.avatarInitials}
              </div>
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white ring-2 ring-surface">
                <UserCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  Reporting Manager
                </span>
                <span className="text-xs text-ink-soft">{manager.department}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-ink">{manager.name}</h3>
              <p className="text-xs font-bold text-primary">{manager.role}</p>
              <p className="text-xs text-ink-soft max-w-xl leading-relaxed pt-0.5">
                {manager.bio}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto shrink-0">
            <a
              href={`mailto:${manager.email}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-alt text-xs font-bold text-ink transition cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>Email Manager</span>
            </a>
            <button
              type="button"
              onClick={() => handleOpenScheduleModal(manager)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-elegant hover:shadow-glow transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{manager.scheduledMeeting ? 'Update 1:1 Sync' : 'Schedule 1:1'}</span>
            </button>
          </div>
        </div>

        {manager.scheduledMeeting && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Day-1 Welcome Sync Confirmed:</strong> {manager.scheduledMeeting.date} at{' '}
                {manager.scheduledMeeting.time} ({manager.scheduledMeeting.topic})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Teammates & Onboarding Peer Buddies */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-ink uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>Teammates & Peer Buddies</span>
          </h3>
          <span className="text-xs text-ink-soft">{peers.length} Members</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {peers.map((member) => (
            <div
              key={member.id}
              className="bg-surface border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 text-left hover:border-primary/40 transition"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs ${member.avatarColor}`}
                >
                  {member.avatarInitials}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-ink truncate">{member.name}</h4>
                    {member.role.includes('Buddy') && (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Peer Buddy
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-primary font-medium truncate">{member.role}</p>
                  <p className="text-[11px] text-ink-soft">{member.department}</p>
                  <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed pt-1">
                    {member.bio}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                <span className="text-[11px] text-ink-soft truncate">{member.email}</span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`mailto:${member.email}`}
                    className="p-1.5 rounded-lg hover:bg-surface-alt text-ink-soft hover:text-primary transition"
                    title="Send Email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleOpenScheduleModal(member)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-alt/80 border border-border text-xs font-bold text-ink transition cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{member.scheduledMeeting ? 'Scheduled' : '1:1 Sync'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Footer */}
      <StepFooter
        onBack={() => onSelectStep('training')}
        backText="Training"
        canContinue={true}
        onContinue={handleContinue}
        continueText="Continue to Day-1 Checklist"
      />

      {/* 1:1 Meeting Schedule Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-ink">Schedule 1:1 Intro</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-xl hover:bg-surface-alt text-ink-soft transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {scheduledSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-ink">{scheduledSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmSchedule} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-ink">Team Member</label>
                  <p className="p-2.5 rounded-xl bg-surface-alt/60 text-ink font-semibold">
                    {selectedMember.name} ({selectedMember.role})
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink">Meeting Date</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-alt/50 border border-border text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink">Time Slot</label>
                  <select
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-alt/50 border border-border text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                    <option value="11:30 AM">11:30 AM - 12:00 PM</option>
                    <option value="02:00 PM">02:00 PM - 02:30 PM</option>
                    <option value="03:00 PM">03:00 PM - 03:30 PM</option>
                    <option value="04:30 PM">04:30 PM - 05:00 PM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink">Meeting Agenda / Topic</label>
                  <input
                    type="text"
                    value={meetingTopic}
                    onChange={(e) => setMeetingTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-alt/50 border border-border text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-alt text-ink font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold transition cursor-pointer"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
