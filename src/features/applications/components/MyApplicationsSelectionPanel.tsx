'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  Loader2,
  Sparkles,
  MapPin,
  DollarSign,
  Zap,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  ChevronDown,
  X,
} from 'lucide-react';
import { ApplicationItem, ApplicationStatus } from '../types';
import { resolveCandidateStatus } from '../utils/candidateStatusResolver';

interface MyApplicationsSelectionPanelProps {
  applications: ApplicationItem[];
  selectedApp: ApplicationItem | null;
  onSelectApp: (app: ApplicationItem) => void;
  loading?: boolean;
  maxCards?: number;
}

type SortOption = 'date_desc' | 'date_asc' | 'title_az' | 'title_za' | 'match_score';

const STATUS_FILTER_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Stages' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'reviewing', label: 'Under Review' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offered', label: 'Offered' },
  { id: 'rejected', label: 'Not Selected' },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'date_desc', label: 'Date: Newest' },
  { id: 'date_asc', label: 'Date: Oldest' },
  { id: 'title_az', label: 'Title: A → Z' },
  { id: 'title_za', label: 'Title: Z → A' },
  { id: 'match_score', label: 'Highest Match' },
];

export function MyApplicationsSelectionPanel({
  applications,
  selectedApp,
  onSelectApp,
  loading = false,
  maxCards = 5,
}: MyApplicationsSelectionPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // Filter & Sort
  const processedApps = useMemo(() => {
    let list = applications.filter((app) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        app.job?.title?.toLowerCase().includes(q) ||
        app.job?.company?.name?.toLowerCase().includes(q) ||
        app.job?.location?.city?.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'rejected'
          ? app.status === 'rejected' || app.status === 'failed'
          : app.status === statusFilter;

      return matchSearch && matchStatus;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'date_desc') {
        const timeA = new Date(a.appliedAt || a.createdAt).getTime();
        const timeB = new Date(b.appliedAt || b.createdAt).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'date_asc') {
        const timeA = new Date(a.appliedAt || a.createdAt).getTime();
        const timeB = new Date(b.appliedAt || b.createdAt).getTime();
        return timeA - timeB;
      }
      if (sortBy === 'title_az') {
        return (a.job?.title || '').localeCompare(b.job?.title || '');
      }
      if (sortBy === 'title_za') {
        return (b.job?.title || '').localeCompare(a.job?.title || '');
      }
      if (sortBy === 'match_score') {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      return 0;
    });

    return list;
  }, [applications, searchQuery, statusFilter, sortBy]);

  // Display top cards (up to maxCards = 5)
  const displayedCards = useMemo(() => {
    return processedApps.slice(0, maxCards);
  }, [processedApps, maxCards]);

  const activeFilterLabel =
    STATUS_FILTER_OPTIONS.find((s) => s.id === statusFilter)?.label || 'All';
  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Date';

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-border space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-ink tracking-tight">My Applications</h3>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          {displayedCards.length}
        </span>
      </div>

      {/* Filter & Sort Bar (Matching Sketch: Filter = | Sort by = A->Z / Date) */}
      <div className="flex items-center gap-2">
        {/* Filter Dropdown */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => {
              setIsFilterMenuOpen((prev) => !prev);
              setIsSortMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              statusFilter !== 'all'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface-alt/60 text-ink-soft hover:text-ink hover:bg-surface-alt'
            }`}
          >
            <span className="flex items-center gap-1.5 truncate">
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span className="truncate">Filter: {activeFilterLabel}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
          </button>

          {isFilterMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-48 bg-surface border border-border rounded-2xl shadow-xl p-1.5 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-ink-soft tracking-wider">
                Filter by Stage
              </div>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(opt.id);
                    setIsFilterMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                    statusFilter === opt.id
                      ? 'bg-primary text-white font-bold'
                      : 'text-ink-soft hover:text-ink hover:bg-surface-alt'
                  }`}
                >
                  <span>{opt.label}</span>
                  {statusFilter === opt.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => {
              setIsSortMenuOpen((prev) => !prev);
              setIsFilterMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              sortBy !== 'date_desc'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface-alt/60 text-ink-soft hover:text-ink hover:bg-surface-alt'
            }`}
          >
            <span className="flex items-center gap-1.5 truncate">
              <ArrowUpDown className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span className="truncate">Sort: {activeSortLabel}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
          </button>

          {isSortMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-surface border border-border rounded-2xl shadow-xl p-1.5 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-ink-soft tracking-wider">
                Sort Options
              </div>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.id);
                    setIsSortMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                    sortBy === opt.id
                      ? 'bg-primary text-white font-bold'
                      : 'text-ink-soft hover:text-ink hover:bg-surface-alt'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-border bg-surface-alt/40 text-xs font-medium text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-ink-soft hover:text-ink transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 5 Stacked Application Cards */}
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
            <h4 className="text-xs font-bold text-ink">No applications found</h4>
            <p className="text-[11px] text-ink-soft leading-relaxed">
              {searchQuery || statusFilter !== 'all'
                ? 'No applications match your active filter.'
                : 'Apply to jobs and your active applications will appear here.'}
            </p>
          </div>
          <Link
            href="/ai-apply"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-brand text-white font-bold text-[11px] shadow-xs hover:shadow-glow transition cursor-pointer"
          >
            <Zap className="w-3 h-3 fill-white" />
            <span>Apply to Jobs</span>
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
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 text-left relative ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md'
                    : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-alt/40 shadow-2xs'
                }`}
              >
                {/* Title & Status Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 transition ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-surface-alt border-border text-ink'
                      }`}
                    >
                      {app.job?.company?.name?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-bold truncate transition ${
                          isSelected ? 'text-primary font-black' : 'text-ink'
                        }`}
                      >
                        {app.job?.title || 'Job Position'}
                      </h4>
                      <p className="text-[11px] text-ink-soft truncate font-medium">
                        {app.job?.company?.name || 'Company'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${candStatus.badgeClass}`}
                  >
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
                      <span>
                        {app.job.salary.currency || '$'}
                        {app.job.salary.max.toLocaleString()}
                      </span>
                    </span>
                  ) : null}
                </div>

                {/* Footer Metadata: Applied Date & Match Score */}
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
