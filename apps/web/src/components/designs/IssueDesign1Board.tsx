import { dummyIssues } from "../../data/issueDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import type { IssueResponse } from "../../models/issue"
import type { IssueStatus, IssueType } from "../../models/enums"

const STATUS_ORDER: IssueStatus[] = ["Created", "InProgress", "Resolved"]

const STATUS_CONFIG: Record<
  IssueStatus,
  { label: string; color: string; dot: string }
> = {
  Created: {
    label: "Open",
    color:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  InProgress: {
    label: "In Progress",
    color:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  Resolved: {
    label: "Resolved",
    color:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
}

const TYPE_CONFIG: Record<IssueType, { label: string; icon: string }> = {
  IssueOrBug: { label: "Issue", icon: "🐛" },
  Request: { label: "Request", icon: "📋" },
  Other: { label: "Other", icon: "💬" },
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("default", {
    month: "short",
    day: "numeric",
  })
}

function IssueCard({ issue }: { issue: IssueResponse }) {
  const type = TYPE_CONFIG[issue.type]
  return (
    <Card className="mb-2 last:mb-0">
      <CardContent className="p-3">
        <div className="mb-2 flex items-start gap-2">
          <span className="mt-0.5 text-base leading-none">{type.icon}</span>
          <p className="flex-1 text-sm leading-snug font-medium text-foreground">
            {issue.title}
          </p>
        </div>
        {issue.description && (
          <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
            {issue.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{issue.id}</span>
          <span className="text-[10px] text-muted-foreground">
            {formatRelative(issue.dateCreated)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function IssueDesign1Board() {
  const grouped = STATUS_ORDER.reduce<Record<IssueStatus, IssueResponse[]>>(
    (acc, s) => ({ ...acc, [s]: dummyIssues.filter((i) => i.status === s) }),
    {} as Record<IssueStatus, IssueResponse[]>
  )

  return (
    <div className="flex h-[calc(100svh-49px)] flex-col">
      <div className="shrink-0 border-b border-border px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">Issue Board</h1>
        <p className="text-sm text-muted-foreground">
          {dummyIssues.length} total issues
        </p>
      </div>
      <div className="flex-1 overflow-x-auto">
        <div className="flex h-full min-w-[640px] gap-4 p-6">
          {STATUS_ORDER.map((status) => {
            const cfg = STATUS_CONFIG[status]
            const issues = grouped[status]
            return (
              <div key={status} className="flex w-72 shrink-0 flex-col">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                  <span className="text-sm font-semibold text-foreground">
                    {cfg.label}
                  </span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {issues.length}
                  </Badge>
                </div>
                <ScrollArea className="flex-1">
                  <div className="pr-1">
                    {issues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                    {issues.length === 0 && (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        No issues
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
