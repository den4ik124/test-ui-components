import { useState } from "react"
import { dummyAuditLogs } from "../../data/auditDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import type { AuditLogDto } from "../../models/audit"

const ACTION_CONFIG: Record<string, { label: string; color: string }> = {
  Create: {
    label: "Create",
    color:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  Update: {
    label: "Update",
    color:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
  },
  Delete: {
    label: "Delete",
    color:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
  },
}

const ENTITY_ICONS: Record<string, string> = {
  Apartment: "🏠",
  Bill: "🧾",
  TenantApartment: "👤",
  Issue: "🐛",
}

const ENTITY_TYPES: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Bill", label: "Bills" },
  { key: "Apartment", label: "Apartments" },
  { key: "TenantApartment", label: "Tenants" },
  { key: "Issue", label: "Issues" },
]

function formatTs(ts: string) {
  return new Date(ts).toLocaleString("default", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function prettyChanges(raw: string | null): string {
  if (!raw) return "—"
  try {
    const obj = JSON.parse(raw)
    return JSON.stringify(obj, null, 2)
  } catch {
    return raw
  }
}

function LogRow({
  log,
  selected,
  onClick,
}: {
  log: AuditLogDto
  selected: boolean
  onClick: () => void
}) {
  const action = ACTION_CONFIG[log.action ?? ""] ?? {
    label: log.action ?? "?",
    color: "",
  }
  const icon = ENTITY_ICONS[log.entityType ?? ""] ?? "📋"
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-all last:border-0 hover:bg-accent ${
        selected ? "bg-accent" : ""
      }`}
    >
      <span className="mt-0.5 shrink-0 text-base">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="truncate text-xs font-semibold text-foreground">
            {log.entityType}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {log.entityId}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {log.userEmail}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatTs(log.timestamp)}
        </p>
      </div>
      <Badge
        variant="outline"
        className={`${action.color} shrink-0 text-[10px]`}
      >
        {action.label}
      </Badge>
    </button>
  )
}

function LogDetail({ log }: { log: AuditLogDto }) {
  const action = ACTION_CONFIG[log.action ?? ""] ?? {
    label: log.action ?? "?",
    color: "",
  }
  const icon = ENTITY_ICONS[log.entityType ?? ""] ?? "📋"
  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                {log.entityType}
              </h2>
              <Badge variant="outline" className={action.color}>
                {action.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{log.entityId}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm">
        <div className="rounded-lg border border-border p-3">
          <p className="mb-1 text-xs text-muted-foreground">Timestamp</p>
          <p className="font-medium text-foreground">
            {formatTs(log.timestamp)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3">
            <p className="mb-1 text-xs text-muted-foreground">User</p>
            <p className="text-xs font-medium break-all text-foreground">
              {log.userEmail}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="mb-1 text-xs text-muted-foreground">IP Address</p>
            <p className="font-mono font-medium text-foreground">
              {log.ipAddress}
            </p>
          </div>
        </div>
        {log.changes && (
          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 text-xs text-muted-foreground">Changes</p>
            <pre className="max-h-40 overflow-auto rounded bg-muted/50 p-2 font-mono text-xs whitespace-pre-wrap text-foreground">
              {prettyChanges(log.changes)}
            </pre>
          </div>
        )}
        {log.userAgent && (
          <div className="rounded-lg border border-border p-3">
            <p className="mb-1 text-xs text-muted-foreground">User Agent</p>
            <p className="text-xs break-all text-foreground">{log.userAgent}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function AuditDesign1Log() {
  const [entityFilter, setEntityFilter] = useState("all")
  const [selectedId, setSelectedId] = useState(dummyAuditLogs[0].id)

  const filtered =
    entityFilter === "all"
      ? dummyAuditLogs
      : dummyAuditLogs.filter((l) => l.entityType === entityFilter)

  const selected =
    dummyAuditLogs.find((l) => l.id === selectedId) ?? dummyAuditLogs[0]

  return (
    <div className="flex h-[calc(100svh-49px)] flex-col">
      {/* Filter bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border px-4 py-2">
        <span className="mr-1 text-xs font-semibold text-muted-foreground">
          Entity:
        </span>
        {ENTITY_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setEntityFilter(t.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              entityFilter === t.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} entries
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Log list */}
        <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-border">
          <ScrollArea className="flex-1">
            {filtered.map((log) => (
              <LogRow
                key={log.id}
                log={log}
                selected={log.id === selectedId}
                onClick={() => setSelectedId(log.id)}
              />
            ))}
          </ScrollArea>
        </aside>

        {/* Detail */}
        <main className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <LogDetail log={selected} />
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}
