import React from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  onClick?: () => void;
}

export function FresherQuickCard({ icon: Icon, title, description, badge, onClick }: Props) {
  const isClickable = Boolean(onClick);

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs transition-all flex flex-col justify-between ${
        isClickable
          ? "cursor-pointer hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 group"
          : ""
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {Icon && (
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary-glow flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          {badge && (
            <span className="text-[10px] font-extrabold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-ink group-hover:text-primary-glow transition-colors">
            {title}
          </h4>
          <p className="text-xs text-ink-soft mt-1 leading-relaxed">{description}</p>
        </div>
      </div>

      {isClickable && (
        <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs font-bold text-primary-glow">
          <span>Explore Section</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </div>
  );
}
