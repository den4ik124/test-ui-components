import { useState } from "react"
import { dummyNotifications } from "../../data/notificationDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"
import type { NotificationDto } from "../../models/notification"
import type { NotificationSeverity } from "../../models/enums"

const SEVERITY_CONFIG: Record<
  NotificationSeverity,
  { label: string; color: string; icon: string; dot: string }
> = {
  Info: {
    label: "Info",
    icon: "ℹ️",
    dot: "bg-blue-500",
    color:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
  },
  Warning: {
    label: "Warning",
    icon: "⚠️",
    dot: "bg-amber-500",
    color:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
  },
  Error: {
    label: "Error",
    icon: "🚨",
    dot: "bg-red-500",
    color:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
  },
}

const LANG_OPTIONS = [
  { key: "en", label: "EN" },
  { key: "uk", label: "UA" },
]

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("default", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("default", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function NotificationCard({
  notif,
  lang,
}: {
  notif: NotificationDto
  lang: string
}) {
  const cfg = SEVERITY_CONFIG[notif.severity]
  const title = notif.title?.[lang] ?? notif.title?.["en"] ?? "Untitled"
  const message = notif.message?.[lang] ?? notif.message?.["en"] ?? ""

  return (
    <div
      className={`flex gap-3 rounded-lg border p-4 ${notif.isActive ? "" : "opacity-60"}`}
    >
      <div className="mt-0.5 shrink-0">
        <span className="text-xl leading-none">{cfg.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-start gap-2">
          <h3 className="flex-1 text-sm font-semibold text-foreground">
            {title}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant="outline" className={cfg.color}>
              {cfg.label}
            </Badge>
            {notif.isActive ? (
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                Active
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-gray-200 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              >
                Inactive
              </Badge>
            )}
          </div>
        </div>
        <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>
            From {formatDate(notif.startAt)} {formatTime(notif.startAt)}
          </span>
          {notif.endAt && <span>· Until {formatDate(notif.endAt)}</span>}
          <span className="ml-auto">
            Created {formatDate(notif.dateCreated)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function NotificationDesign1Feed() {
  const [lang, setLang] = useState("en")
  const [severityFilter, setSeverityFilter] = useState<
    "all" | NotificationSeverity
  >("all")
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all")

  const filtered = dummyNotifications.filter((n) => {
    const matchSeverity =
      severityFilter === "all" || n.severity === severityFilter
    const matchActive =
      activeFilter === "all" ||
      (activeFilter === "active" ? n.isActive : !n.isActive)
    return matchSeverity && matchActive
  })

  return (
    <div className="flex h-[calc(100svh-49px)] flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-4 border-b border-border px-6 py-3">
        <div>
          <h1 className="text-base font-bold text-foreground">
            System Notifications
          </h1>
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {dummyNotifications.length}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {/* Severity filter */}
          {(["all", "Info", "Warning", "Error"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                severityFilter === s
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
          <Separator orientation="vertical" className="mx-1 h-5" />
          {/* Active filter */}
          {(["all", "active", "inactive"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setActiveFilter(a)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                activeFilter === a
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {a === "all" ? "Any status" : a}
            </button>
          ))}
          <Separator orientation="vertical" className="mx-1 h-5" />
          {/* Language */}
          {LANG_OPTIONS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLang(l.key)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                lang === l.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <ScrollArea className="flex-1">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 p-6">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No notifications match your filters.
            </p>
          ) : (
            filtered.map((n) => (
              <NotificationCard key={n.id} notif={n} lang={lang} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
