import React, { ReactNode } from "react";

export interface FresherColumn<T> {
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface Props<T> {
  columns: FresherColumn<T>[];
  rows: T[];
  getKey: (row: T) => string;
  emptyText?: string;
}

export function FresherDataTable<T>({
  columns,
  rows,
  getKey,
  emptyText = "No records found matching your selection",
}: Props<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-border bg-surface-alt/70">
            {columns.map((c) => (
              <th
                key={c.header}
                className={`py-3.5 px-4 font-bold text-ink-soft uppercase tracking-wider text-[11px] ${
                  c.className || ""
                }`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 text-center text-ink-soft italic font-medium"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={getKey(row)}
                className="hover:bg-surface-alt/40 transition-colors group"
              >
                {columns.map((c) => (
                  <td
                    key={c.header}
                    className={`py-3.5 px-4 align-middle text-ink font-medium ${
                      c.className || ""
                    }`}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
