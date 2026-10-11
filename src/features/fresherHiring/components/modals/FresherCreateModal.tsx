import React, { useEffect, useState } from "react";
import type { CreateType, CreateFormData } from "../../types";
import { CREATE_CONFIG, DEPARTMENTS, HIRING_TYPES } from "../../constants/forms";
import { X, Sparkles, PlusCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fresherHiringService } from "../../services/fresherHiringService";

interface Props {
  type: CreateType | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FresherCreateModal({ type, onClose, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateFormData>({
    type: type || "job",
    title: "",
    hiringType: "Fresher Job",
    department: "Technology & Engineering",
    location: "Bengaluru, Karnataka / Hybrid",
    openPositions: 5,
    startDate: new Date().toISOString().split("T")[0],
    description: "",
    skillsRequired: "",
    stipendOrSalary: "",
    qualification: "B.Tech / BE / MCA",
  });

  useEffect(() => {
    if (type) {
      const cfg = CREATE_CONFIG[type];
      setFormData((prev) => ({
        ...prev,
        type,
        hiringType: cfg.defaultType,
        title: "",
      }));
    }
  }, [type]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!type) return null;
  const cfg = CREATE_CONFIG[type];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error(`Please enter ${cfg.label}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fresherHiringService.submitCreateForm(formData);
      toast.success(res.message);
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Failed to create workflow. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fresher-modal-title"
    >
      <div className="bg-surface border border-border rounded-3xl shadow-elegant w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border sticky top-0 bg-surface/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary-glow flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="fresher-modal-title"
                className="text-base sm:text-lg font-extrabold text-ink"
              >
                {cfg.title}
              </h3>
              <p className="text-xs text-ink-soft">{cfg.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title / Name Field */}
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="fm-title" className="text-xs font-bold text-ink">
                {cfg.label} <span className="text-red-500">*</span>
              </label>
              <input
                id="fm-title"
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={cfg.placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs text-ink outline-none focus:border-primary transition"
              />
            </div>

            {/* Hiring Type */}
            <div className="space-y-1.5">
              <label htmlFor="fm-type" className="text-xs font-bold text-ink">
                Hiring Channel / Category
              </label>
              <select
                id="fm-type"
                value={formData.hiringType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, hiringType: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs font-semibold text-ink outline-none cursor-pointer focus:border-primary transition"
              >
                {HIRING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label htmlFor="fm-dept" className="text-xs font-bold text-ink">
                Functional Department
              </label>
              <select
                id="fm-dept"
                value={formData.department}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, department: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs font-semibold text-ink outline-none cursor-pointer focus:border-primary transition"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label htmlFor="fm-loc" className="text-xs font-bold text-ink">
                Target Location / Campus
              </label>
              <input
                id="fm-loc"
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="e.g. Bengaluru / Kochi / Hybrid"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs text-ink outline-none focus:border-primary transition"
              />
            </div>

            {/* Open Positions */}
            <div className="space-y-1.5">
              <label htmlFor="fm-pos" className="text-xs font-bold text-ink">
                Open Positions / Quota
              </label>
              <input
                id="fm-pos"
                type="number"
                min={1}
                value={formData.openPositions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    openPositions: Number(e.target.value) || 1,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs text-ink outline-none focus:border-primary transition"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label htmlFor="fm-date" className="text-xs font-bold text-ink">
                Target Start / Drive Date
              </label>
              <input
                id="fm-date"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs text-ink outline-none focus:border-primary transition"
              />
            </div>

            {/* Compensation / Stipend */}
            <div className="space-y-1.5">
              <label htmlFor="fm-comp" className="text-xs font-bold text-ink">
                Stipend / CTC Range
              </label>
              <input
                id="fm-comp"
                type="text"
                value={formData.stipendOrSalary}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    stipendOrSalary: e.target.value,
                  }))
                }
                placeholder="e.g. ₹4.5 - ₹7.0 LPA or ₹25,000/mo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs text-ink outline-none focus:border-primary transition"
              />
            </div>

            {/* Skills */}
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="fm-skills" className="text-xs font-bold text-ink">
                Key Skills / Eligibility Tags
              </label>
              <input
                id="fm-skills"
                type="text"
                value={formData.skillsRequired}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    skillsRequired: e.target.value,
                  }))
                }
                placeholder="e.g. React, Node.js, SQL, Problem Solving (comma separated)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs text-ink outline-none focus:border-primary transition"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="fm-desc" className="text-xs font-bold text-ink">
                Workflow Details & Job Brief
              </label>
              <textarea
                id="fm-desc"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Add eligibility criteria, selection rounds, mentorship structure and interview checkpoints..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs text-ink outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-ink hover:bg-surface-alt transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create & Launch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
