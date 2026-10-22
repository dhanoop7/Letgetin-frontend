import React from "react";

interface Props {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  className?: string;
}

export function FresherFilterSelect({
  label,
  value,
  options,
  onChange,
  className = "",
}: Props) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-ink outline-none cursor-pointer focus:border-primary/60 transition ${className}`}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
