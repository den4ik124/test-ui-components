import { useState } from "react";
import { dummyIssues } from "../../data/issueDummyData";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import type { IssueResponse } from "../../models/issue";
import type { IssueStatus, IssueType } from "../../models/enums";

const STATUS_CONFIG: Record<IssueStatus, { label: string; color: string }> = {
  Created:    { label: "Open",        color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300" },
  InProgress: { label: "In Progress", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300" },
  Resolved:   { label: "Resolved",    color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300" },
};

const TYPE_CONFIG: Record<IssueType, { label: string; icon: string }> = {
  IssueOrBug: { label: "Issue",   icon: "🐛" },
  Request:    { label: "Request", icon: "📋" },
  Other:      { label: "Other",   icon: "💬" },
};

const ALL_FILTERS: { key: string; label: string }[] = [
  { key: "all",        label: "All" },
  { key: "Created",    label: "Open" },
  { key: "InProgress", label: "In Progress" },
  { key: "Resolved",   label: "Resolved" },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("default", { year: "numeric", month: "short", day: "numeric" });
}

function IssueRow({ issue, selected, onClick }: { issue: IssueResponse; selected: boolean; onClick: () => void }) {
  const status = STATUS_CONFIG[issue.status];
  const type = TYPE_CONFIG[issue.type];
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-accent border-b border-border last:border-0 ${
        selected ? "bg-accent" : ""
      }`}
    >
      <span className="text-base mt-0.5 shrink-0">{type.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{issue.title}</p>
        <p className="text-xs text-muted-foreground">{issue.id} &middot; {formatDate(issue.dateCreated)}</p>
      </div>
      <Badge variant="outline" className={`${status.color} shrink-0 text-[10px]`}>
        {status.label}
      </Badge>
    </button>
  );
}

function IssueDetail({ issue }: { issue: IssueResponse }) {
  const status = STATUS_CONFIG[issue.status];
  const type = TYPE_CONFIG[issue.type];
  return (
    <div className="p-6 flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{type.icon}</span>
          <h2 className="text-xl font-bold text-foreground">{issue.title}</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={status.color}>{status.label}</Badge>
          <Badge variant="outline">{type.label}</Badge>
          <span className="text-xs text-muted-foreground">{issue.id}</span>
        </div>
      </div>

      <Separator />

      {issue.description && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</p>
          <p className="text-sm text-foreground leading-relaxed">{issue.description}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Reported by</p>
          <p className="font-medium text-foreground">{issue.createdBy}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Created</p>
          <p className="font-medium text-foreground">{formatDate(issue.dateCreated)}</p>
        </div>
        {issue.dateUpdated && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Last updated</p>
            <p className="font-medium text-foreground">{formatDate(issue.dateUpdated)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function IssueDesign2List() {
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(dummyIssues[0].id);

  const filtered = filter === "all"
    ? dummyIssues
    : dummyIssues.filter((i) => i.status === filter);
  const selected = dummyIssues.find((i) => i.id === selectedId) ?? dummyIssues[0];

  return (
    <div className="flex flex-col h-[calc(100svh-49px)]">
      {/* Filter bar */}
      <div className="flex gap-1 px-4 py-2 border-b border-border shrink-0">
        {ALL_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground self-center">
          {filtered.length} issue{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* List */}
        <aside className="w-72 shrink-0 border-r border-border overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            {filtered.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                selected={issue.id === selectedId}
                onClick={() => setSelectedId(issue.id)}
              />
            ))}
          </ScrollArea>
        </aside>

        {/* Detail */}
        <main className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <IssueDetail issue={selected} />
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
