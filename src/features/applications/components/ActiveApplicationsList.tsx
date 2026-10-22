'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  Loader2,
  Sparkles,
  MapPin,
  DollarSign,
  Zap,
} from 'lucide-react';
import { ApplicationItem } from '../types';
import { resolveCandidateStatus } from '../utils/candidateStatusResolver';

interface ActiveApplicationsListProps {
  applications: ApplicationItem[];
  selectedApp: ApplicationItem | null;
  onSelectApp: (app: ApplicationItem) => void;
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (st: string) => void;
  maxCards?: number;
}

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offered', label: 'Offered' },
];

export function ActiveApplicationsList({
  applications,
  selectedApp,
  onSelectApp,
  loading,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  maxCards = 5,
}: ActiveApplicationsListProps) {
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        !searchQuery.trim() ||
        app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job?.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job?.location?.city?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || app.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // Restrict to exactly 5 application cards as specified in the UI requirements
  const displayedCards = useMemo(() => {
    return filteredApps.slice(0, maxCards);
  }, [filteredApps, maxCards]);

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-border space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-ink">Active Applications</h3>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          {displayedCards.length}
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by title, company, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-border bg-surface-alt/50 text-xs font-medium text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-xs">
        {STATUS_FILTERS.map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setStatusFilter(st.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
              statusFilter === st.id
                ? 'bg-primary text-white font-bold shadow-2xs'
                : 'bg-surface-alt/70 text-ink-soft hover:text-ink hover:bg-surface-alt'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* 5 Active Application Cards */}
      {loading ? (
        <div className="py-12 text-center space-y-2 bg-surface-alt/20 rounded-2xl border border-border/50">
          <Loader2 className="w-5 h-5 text-primary-glow animate-spin mx-auto" />
          <p className="text-xs text-ink-soft">Loading applications...</p>
        </div>
      ) : displayedCards.length === 0 ? (
        <div className="py-8 text-center space-y-3 bg-surface-alt/20 rounded-2xl border border-dashed border-border/70 p-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-ink">No active applications</h4>
            <p className="text-[11px] text-ink-soft leading-relaxed">
              {searchQuery || statusFilter !== 'all'
                ? 'No applications match your active filters.'
                : 'Apply to jobs and your applications will appear here.'}
            </p>
          </div>
          <Link
            href="/ai-apply"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-brand text-white font-bold text-[11px] shadow-xs hover:shadow-glow transition cursor-pointer"
          >
            <Zap className="w-3 h-3 fill-white" />
            <span>Explore Opportunities</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedCards.map((app) => {
            const isSelected = selectedApp?._id === app._id;
            const candStatus = resolveCandidateStatus(app);
            const appDate = new Date(app.appliedAt || app.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={app._id}
                onClick={() => onSelectApp(app)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 text-left ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md'
                    : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-alt/40 shadow-2xs'
                }`}
              >
                {/* Title & Status Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-surface-alt border border-border flex items-center justify-center text-ink font-bold text-xs shrink-0">
                      {app.job?.company?.name?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-primary' : 'text-ink'}`}>
                        {app.job?.title || 'Job Position'}
                      </h4>
                      <p className="text-[11px] text-ink-soft truncate font-medium">
                        {app.job?.company?.name || 'Company'}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${candStatus.badgeClass}`}>
                    {candStatus.label}
                  </span>
                </div>

                {/* Location & Salary Info */}
                <div className="flex items-center gap-3 text-[11px] text-ink-soft truncate">
                  {app.job?.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-ink-soft shrink-0" />
                      <span className="truncate">
                        {app.job.location.city || app.job.location.country || 'Remote'}
                      </span>
                    </span>
                  )}
                  {app.job?.salary?.max ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold shrink-0">
                      <DollarSign className="w-3 h-3 shrink-0" />
                      <span>{app.job.salary.currency || '$'}{app.job.salary.max.toLocaleString()}</span>
                    </span>
                  ) : null}
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-[11px] text-ink-soft pt-1.5 border-t border-border/50">
                  <span>Applied {appDate}</span>
                  {app.matchScore > 0 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {app.matchScore}% Match
                    </span>
                  ) : (
                    app.job?.location?.city && <span>{app.job.location.city}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
