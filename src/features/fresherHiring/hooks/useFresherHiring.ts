import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Candidate,
  Drive,
  Job,
  Program,
  JuniorRole,
  Interview,
  Kpi,
} from "../types";
import {
  fresherHiringService,
  OVERVIEW_KPIS,
  INITIAL_CANDIDATES,
  INITIAL_DRIVES,
  INITIAL_JOBS,
  INITIAL_PROGRAMS,
  INITIAL_JUNIOR_ROLES,
  INITIAL_INTERVIEWS,
} from "../services/fresherHiringService";
import { toast } from "sonner";

export function useFresherHiring() {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [drives, setDrives] = useState<Drive[]>(INITIAL_DRIVES);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [juniorRoles, setJuniorRoles] = useState<JuniorRole[]>(INITIAL_JUNIOR_ROLES);
  const [interviews, setInterviews] = useState<Interview[]>(INITIAL_INTERVIEWS);

  // Filters for Candidates Tab
  const [searchCandidate, setSearchCandidate] = useState("");
  const [filterQualification, setFilterQualification] = useState("All Qualifications");
  const [filterStage, setFilterStage] = useState("All Stages");
  const [filterLocation, setFilterLocation] = useState("All Locations");

  // Filters for Drives Tab
  const [searchDrive, setSearchDrive] = useState("");
  const [filterDriveStatus, setFilterDriveStatus] = useState("All Drive Status");
  const [filterCollegeType, setFilterCollegeType] = useState("All College Types");

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const q = searchCandidate.toLowerCase();
      const matchesSearch =
        !searchCandidate ||
        c.name.toLowerCase().includes(q) ||
        c.skills.toLowerCase().includes(q) ||
        c.college.toLowerCase().includes(q) ||
        c.target.toLowerCase().includes(q);

      const matchesQual =
        filterQualification === "All Qualifications" ||
        c.education.toLowerCase().includes(filterQualification.toLowerCase());

      const matchesStage =
        filterStage === "All Stages" || c.stage === filterStage;

      const matchesLoc =
        filterLocation === "All Locations" ||
        (c.location && c.location.toLowerCase().includes(filterLocation.split(",")[0].toLowerCase()));

      return matchesSearch && matchesQual && matchesStage && matchesLoc;
    });
  }, [candidates, searchCandidate, filterQualification, filterStage, filterLocation]);

  // Filtered Drives
  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      const q = searchDrive.toLowerCase();
      const matchesSearch =
        !searchDrive ||
        d.title.toLowerCase().includes(q) ||
        d.college.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q);

      const matchesStatus =
        filterDriveStatus === "All Drive Status" ||
        d.status.label.toLowerCase() === filterDriveStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [drives, searchDrive, filterDriveStatus]);

  const handleExportCandidates = useCallback(() => {
    toast.success(`Exported ${filteredCandidates.length} fresher candidates shortlist as CSV`);
  }, [filteredCandidates.length]);

  return {
    loading,
    candidates: filteredCandidates,
    rawCandidates: candidates,
    drives: filteredDrives,
    jobs,
    programs,
    juniorRoles,
    interviews,
    // Candidate filters
    searchCandidate,
    setSearchCandidate,
    filterQualification,
    setFilterQualification,
    filterStage,
    setFilterStage,
    filterLocation,
    setFilterLocation,
    // Drive filters
    searchDrive,
    setSearchDrive,
    filterDriveStatus,
    setFilterDriveStatus,
    filterCollegeType,
    setFilterCollegeType,
    // Actions
    handleExportCandidates,
  };
}
