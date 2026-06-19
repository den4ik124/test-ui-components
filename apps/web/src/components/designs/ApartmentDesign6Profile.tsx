import { useState, useMemo } from "react"
import { dummyApartments } from "../../data/apartmentDummyData"
import { dummyBills } from "../../data/billDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Trash2, UserPlus } from "lucide-react"
import type { ApartmentResponse } from "../../models/apartment"
import type { BillData } from "../../models/BillData"
import { BillStatusEnum } from "../../models/BillStatusEnum"
import { formatPeriod, formatShortPeriod, STATUS_LABELS } from "./shared"
import { BillsMasterDetail } from "./billDisplay"

const CURRENCY_SYM: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" }
function sym(apt: ApartmentResponse) {
  return (
    CURRENCY_SYM[apt.currency.shortName ?? ""] ?? apt.currency.shortName ?? ""
  )
}

// ── Tenant & Report data ──────────────────────────────────────────────────────

type Tenant = {
  id: string
  name: string
  email: string
  phone: string
  moveIn: string
  moveOut: string | null
  apartmentId: string
}
type Report = {
  id: string
  name: string
  generatedAt: string
  type: "PDF" | "XLSX" | "CSV"
  sizeKb: number
  url: string
  apartmentId: string
}

const DUMMY_TENANTS: Tenant[] = [
  {
    id: "t1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 555-0101",
    moveIn: "2023-01-15",
    moveOut: null,
    apartmentId: "APT-42A",
  },
  {
    id: "t2",
    name: "Maria Garcia",
    email: "m.garcia@email.com",
    phone: "+1 555-0102",
    moveIn: "2021-03-01",
    moveOut: "2022-12-31",
    apartmentId: "APT-42A",
  },
  {
    id: "t3",
    name: "David Chen",
    email: "d.chen@email.com",
    phone: "+1 555-0103",
    moveIn: "2022-03-15",
    moveOut: null,
    apartmentId: "APT-07B",
  },
  {
    id: "t4",
    name: "Sophie Mueller",
    email: "sophie.m@email.com",
    phone: "+49 555-0104",
    moveIn: "2023-11-01",
    moveOut: null,
    apartmentId: "APT-15C",
  },
  {
    id: "t5",
    name: "Thomas Becker",
    email: "t.becker@email.com",
    phone: "+49 555-0105",
    moveIn: "2020-06-01",
    moveOut: "2023-10-31",
    apartmentId: "APT-15C",
  },
  {
    id: "t6",
    name: "Andrés Rodríguez",
    email: "a.rodriguez@email.com",
    phone: "+34 555-0106",
    moveIn: "2023-06-15",
    moveOut: null,
    apartmentId: "APT-23D",
  },
  {
    id: "t7",
    name: "Victoria Wright",
    email: "v.wright@email.com",
    phone: "+1 555-0107",
    moveIn: "2022-08-01",
    moveOut: null,
    apartmentId: "APT-88E",
  },
  {
    id: "t8",
    name: "James Brown",
    email: "j.brown@email.com",
    phone: "+1 555-0108",
    moveIn: "2019-04-01",
    moveOut: "2022-07-31",
    apartmentId: "APT-88E",
  },
  {
    id: "t9",
    name: "Klára Novák",
    email: "k.novak@email.com",
    phone: "+420 555-0109",
    moveIn: "2024-02-01",
    moveOut: null,
    apartmentId: "APT-31F",
  },
]

const DUMMY_REPORTS: Report[] = [
  {
    id: "r1",
    name: "Monthly Report – Jun 2025",
    generatedAt: "2025-07-01T08:00:00Z",
    type: "PDF",
    sizeKb: 248,
    url: "https://blob.example.com/reports/APT-42A/monthly-2025-06.pdf",
    apartmentId: "APT-42A",
  },
  {
    id: "r2",
    name: "Monthly Report – May 2025",
    generatedAt: "2025-06-01T08:00:00Z",
    type: "PDF",
    sizeKb: 231,
    url: "https://blob.example.com/reports/APT-42A/monthly-2025-05.pdf",
    apartmentId: "APT-42A",
  },
  {
    id: "r3",
    name: "Annual Report 2024",
    generatedAt: "2025-01-15T10:00:00Z",
    type: "XLSX",
    sizeKb: 892,
    url: "https://blob.example.com/reports/APT-42A/annual-2024.xlsx",
    apartmentId: "APT-42A",
  },
  {
    id: "r4",
    name: "Tenant Ledger Export",
    generatedAt: "2025-04-20T14:30:00Z",
    type: "CSV",
    sizeKb: 64,
    url: "https://blob.example.com/reports/APT-42A/ledger-2025.csv",
    apartmentId: "APT-42A",
  },
  {
    id: "r5",
    name: "Monthly Report – Jun 2025",
    generatedAt: "2025-07-01T08:00:00Z",
    type: "PDF",
    sizeKb: 210,
    url: "https://blob.example.com/reports/APT-07B/monthly-2025-06.pdf",
    apartmentId: "APT-07B",
  },
  {
    id: "r6",
    name: "Annual Report 2024",
    generatedAt: "2025-01-15T10:00:00Z",
    type: "XLSX",
    sizeKb: 744,
    url: "https://blob.example.com/reports/APT-07B/annual-2024.xlsx",
    apartmentId: "APT-07B",
  },
  {
    id: "r7",
    name: "Monthly Report – Jun 2025",
    generatedAt: "2025-07-01T08:00:00Z",
    type: "PDF",
    sizeKb: 285,
    url: "https://blob.example.com/reports/APT-15C/monthly-2025-06.pdf",
    apartmentId: "APT-15C",
  },
  {
    id: "r8",
    name: "Utility Usage Export",
    generatedAt: "2025-05-10T09:00:00Z",
    type: "CSV",
    sizeKb: 48,
    url: "https://blob.example.com/reports/APT-15C/utility-2025.csv",
    apartmentId: "APT-15C",
  },
  {
    id: "r9",
    name: "Monthly Report – Jun 2025",
    generatedAt: "2025-07-01T08:00:00Z",
    type: "PDF",
    sizeKb: 198,
    url: "https://blob.example.com/reports/APT-23D/monthly-2025-06.pdf",
    apartmentId: "APT-23D",
  },
  {
    id: "r10",
    name: "Monthly Report – Jun 2025",
    generatedAt: "2025-07-01T08:00:00Z",
    type: "PDF",
    sizeKb: 312,
    url: "https://blob.example.com/reports/APT-88E/monthly-2025-06.pdf",
    apartmentId: "APT-88E",
  },
  {
    id: "r11",
    name: "Annual Report 2024",
    generatedAt: "2025-01-15T10:00:00Z",
    type: "XLSX",
    sizeKb: 1240,
    url: "https://blob.example.com/reports/APT-88E/annual-2024.xlsx",
    apartmentId: "APT-88E",
  },
  {
    id: "r12",
    name: "Expense Summary Q1 2025",
    generatedAt: "2025-04-05T11:00:00Z",
    type: "PDF",
    sizeKb: 156,
    url: "https://blob.example.com/reports/APT-88E/expenses-q1-2025.pdf",
    apartmentId: "APT-88E",
  },
  {
    id: "r13",
    name: "Monthly Report – Jun 2025",
    generatedAt: "2025-07-01T08:00:00Z",
    type: "PDF",
    sizeKb: 187,
    url: "https://blob.example.com/reports/APT-31F/monthly-2025-06.pdf",
    apartmentId: "APT-31F",
  },
]

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
function fmtSize(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
}
function nameInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const AVATAR_BG = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
]

// ── Tab components ─────────────────────────────────────────────────────────────

const ACCENTS = [
  {
    gradient: "from-blue-500 to-indigo-600",
    dot: "bg-blue-500",
    text: "text-blue-500 dark:text-blue-400",
    subtle:
      "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    label: "text-blue-700 dark:text-blue-300",
  },
  {
    gradient: "from-emerald-500 to-teal-600",
    dot: "bg-emerald-500",
    text: "text-emerald-500 dark:text-emerald-400",
    subtle:
      "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    label: "text-emerald-700 dark:text-emerald-300",
  },
  {
    gradient: "from-violet-500 to-purple-600",
    dot: "bg-violet-500",
    text: "text-violet-500 dark:text-violet-400",
    subtle:
      "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800",
    label: "text-violet-700 dark:text-violet-300",
  },
  {
    gradient: "from-amber-500 to-orange-600",
    dot: "bg-amber-500",
    text: "text-amber-500 dark:text-amber-400",
    subtle:
      "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    label: "text-amber-700 dark:text-amber-300",
  },
  {
    gradient: "from-rose-500 to-pink-600",
    dot: "bg-rose-500",
    text: "text-rose-500 dark:text-rose-400",
    subtle:
      "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
    label: "text-rose-700 dark:text-rose-300",
  },
  {
    gradient: "from-cyan-500 to-sky-600",
    dot: "bg-cyan-500",
    text: "text-cyan-500 dark:text-cyan-400",
    subtle:
      "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800",
    label: "text-cyan-700 dark:text-cyan-300",
  },
]

type Tab = "details" | "bills" | "chart" | "tenants" | "reports"

// ── Chart helpers ──────────────────────────────────────────────────────────────

function catmullRom(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return ""
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(i + 2, pts.length - 1)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

function BillingChart({
  bills,
  currencySym,
}: {
  bills: BillData[]
  currencySym: string
}) {
  const sorted = useMemo(
    () =>
      [...bills].sort((a, b) => a.billingPeriod.localeCompare(b.billingPeriod)),
    [bills]
  )

  if (sorted.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground/50">
          No billing data available
        </p>
      </div>
    )
  }

  const W = 900
  const H = 300
  const pad = { top: 20, right: 40, bottom: 44, left: 92 }
  const cW = W - pad.left - pad.right
  const cH = H - pad.top - pad.bottom

  const totals = sorted.map((b) => b.total)
  const rawMin = Math.min(...totals)
  const rawMax = Math.max(...totals)
  const spread = rawMax - rawMin || rawMax * 0.2 || 1
  const yMin = Math.max(0, rawMin - spread * 0.2)
  const yMax = rawMax + spread * 0.1

  const sx = (i: number) =>
    pad.left + (sorted.length > 1 ? (i / (sorted.length - 1)) * cW : cW / 2)
  const sy = (v: number) => pad.top + ((yMax - v) / (yMax - yMin)) * cH

  const pts = sorted.map((b, i) => ({ x: sx(i), y: sy(b.total) }))
  const linePath = catmullRom(pts)
  const last = pts[pts.length - 1]
  const areaPath =
    `${linePath} L ${last.x.toFixed(1)} ${(pad.top + cH).toFixed(1)}` +
    ` L ${pts[0].x.toFixed(1)} ${(pad.top + cH).toFixed(1)} Z`

  const gridVals = [0, 1, 2, 3, 4].map((i) => yMin + (i / 4) * (yMax - yMin))
  const xStep = Math.max(1, Math.ceil(sorted.length / 8))

  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * W
    let best = 0
    let bestDist = Infinity
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - svgX)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    setHoverIdx(best)
  }

  const hpt = hoverIdx !== null ? pts[hoverIdx] : null
  const hbill = hoverIdx !== null ? sorted[hoverIdx] : null
  const tooltipW = 160
  const tooltipH = 54
  const tooltipX = hpt
    ? hpt.x + 14 + tooltipW > W - pad.right
      ? hpt.x - 14 - tooltipW
      : hpt.x + 14
    : 0
  const tooltipY = hpt
    ? Math.max(
        pad.top + 4,
        Math.min(hpt.y - tooltipH / 2, pad.top + cH - tooltipH - 4)
      )
    : 0

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 px-8 pt-8 pb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Monthly Billings Overview
          </h3>
          <p className="text-sm text-muted-foreground">
            Showing total expenditures
          </p>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mt-4 w-full cursor-crosshair"
          style={{ minWidth: 360 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="billAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="rgb(59,130,246)"
                stopOpacity="0.28"
              />
              <stop
                offset="90%"
                stopColor="rgb(59,130,246)"
                stopOpacity="0.02"
              />
            </linearGradient>
          </defs>

          {gridVals.map((v, i) => (
            <g key={i}>
              <line
                x1={pad.left}
                y1={sy(v).toFixed(1)}
                x2={W - pad.right}
                y2={sy(v).toFixed(1)}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeDasharray="5 4"
                strokeWidth="1"
              />
              <text
                x={pad.left - 10}
                y={(sy(v) + 4).toFixed(1)}
                textAnchor="end"
                fontSize="10.5"
                fill="currentColor"
                fillOpacity="0.45"
              >
                {currencySym}
                {Math.round(v).toLocaleString()}
              </text>
            </g>
          ))}

          <path d={areaPath} fill="url(#billAreaGrad)" />
          <path
            d={linePath}
            fill="none"
            stroke="rgb(59,130,246)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {sorted.map((b, i) => {
            if (i % xStep !== 0 && i !== sorted.length - 1) return null
            return (
              <text
                key={i}
                x={sx(i).toFixed(1)}
                y={(pad.top + cH + 18).toFixed(1)}
                textAnchor="middle"
                fontSize="10.5"
                fill="currentColor"
                fillOpacity="0.45"
              >
                {formatShortPeriod(b.billingPeriod)}
              </text>
            )
          })}

          {hpt && hbill && (
            <g>
              {/* Vertical cursor line */}
              <line
                x1={hpt.x.toFixed(1)}
                y1={pad.top}
                x2={hpt.x.toFixed(1)}
                y2={(pad.top + cH).toFixed(1)}
                stroke="white"
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              {/* Dot — outer ring then inner */}
              <circle
                cx={hpt.x.toFixed(1)}
                cy={hpt.y.toFixed(1)}
                r="6"
                fill="rgb(59,130,246)"
                fillOpacity="0.3"
              />
              <circle
                cx={hpt.x.toFixed(1)}
                cy={hpt.y.toFixed(1)}
                r="4"
                fill="rgb(59,130,246)"
              />
              <circle
                cx={hpt.x.toFixed(1)}
                cy={hpt.y.toFixed(1)}
                r="2"
                fill="white"
              />
              {/* Tooltip */}
              <rect
                x={tooltipX.toFixed(1)}
                y={tooltipY.toFixed(1)}
                width={tooltipW}
                height={tooltipH}
                rx="7"
                fill="hsl(222,47%,11%)"
                fillOpacity="0.96"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <text
                x={(tooltipX + 12).toFixed(1)}
                y={(tooltipY + 20).toFixed(1)}
                fontSize="12.5"
                fontWeight="700"
                fill="white"
              >
                {formatPeriod(hbill.billingPeriod)}
              </text>
              <text
                x={(tooltipX + 12).toFixed(1)}
                y={(tooltipY + 38).toFixed(1)}
                fontSize="11.5"
                fill="rgb(59,130,246)"
              >
                {`total : ${currencySym}${Math.round(hbill.total).toLocaleString()}`}
              </text>
            </g>
          )}
        </svg>

        <p className="text-[11px] text-muted-foreground/40">
          {formatShortPeriod(sorted[sorted.length - 1].billingPeriod)} –{" "}
          {formatShortPeriod(sorted[0].billingPeriod)}
        </p>
      </div>
    </ScrollArea>
  )
}

function TenantsTab({ aptId }: { aptId: string }) {
  const tenants = DUMMY_TENANTS.filter((t) => t.apartmentId === aptId)
  const active = tenants.filter((t) => !t.moveOut)
  const past = tenants.filter((t) => !!t.moveOut)

  function TenantCard({
    tenant,
    colorIdx,
  }: {
    tenant: Tenant
    colorIdx: number
  }) {
    const isActive = !tenant.moveOut
    return (
      <div className="group flex items-start gap-4 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/20">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${AVATAR_BG[colorIdx % AVATAR_BG.length]}`}
        >
          {nameInitials(tenant.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              {tenant.name}
            </p>
            <Badge
              variant="outline"
              className={`text-[10px] ${
                isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                  : "border-gray-200 bg-gray-50 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400"
              }`}
            >
              {isActive ? "Active" : "Past"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{tenant.email}</p>
          <p className="text-xs text-muted-foreground">{tenant.phone}</p>
          <p className="mt-2 text-[11px] text-muted-foreground/50">
            {isActive
              ? `Tenant since ${fmtDate(tenant.moveIn)}`
              : `${fmtDate(tenant.moveIn)} – ${fmtDate(tenant.moveOut!)}`}
          </p>
        </div>
        <button
          title="Remove tenant"
          className="shrink-0 rounded-md p-1.5 text-muted-foreground/30 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header strip */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-8 py-3">
        <p className="text-xs text-muted-foreground">
          {tenants.length === 0
            ? "No tenants assigned"
            : `${active.length} active${past.length > 0 ? `, ${past.length} past` : ""}`}
        </p>
        <Button size="sm" className="h-7 gap-1.5 text-xs">
          <UserPlus className="h-3.5 w-3.5" />
          Invite Tenant
        </Button>
      </div>

      {tenants.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="mb-3 text-4xl">👤</p>
            <p className="text-sm font-medium text-muted-foreground">
              No tenants yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/50">
              Use "Invite Tenant" to get started
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="h-full">
          <div className="flex max-w-2xl flex-col gap-6 px-8 py-6">
            {active.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  Active Tenants
                </p>
                <div className="flex flex-col gap-3">
                  {active.map((t, i) => (
                    <TenantCard key={t.id} tenant={t} colorIdx={i} />
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  Past Tenants
                </p>
                <div className="flex flex-col gap-3">
                  {past.map((t, i) => (
                    <TenantCard
                      key={t.id}
                      tenant={t}
                      colorIdx={active.length + i}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

const REPORT_TYPE_STYLE: Record<
  Report["type"],
  { badge: string; icon: string }
> = {
  PDF: {
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    icon: "📄",
  },
  XLSX: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    icon: "📊",
  },
  CSV: {
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    icon: "📋",
  },
}

function ReportsTab({ aptId }: { aptId: string }) {
  const reports = DUMMY_REPORTS.filter((r) => r.apartmentId === aptId)

  if (reports.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mb-3 text-4xl">📁</p>
          <p className="text-sm font-medium text-muted-foreground">
            No reports available
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="max-w-2xl px-8 py-8">
        <div className="flex flex-col gap-2">
          {reports.map((r) => {
            const ts = REPORT_TYPE_STYLE[r.type]
            return (
              <div
                key={r.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-3 transition-colors hover:bg-muted/20"
              >
                <span className="shrink-0 text-2xl">{ts.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] ${ts.badge}`}
                    >
                      {r.type}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Generated {fmtDate(r.generatedAt)} · {fmtSize(r.sizeKb)}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground/40">
                    {r.url}
                  </p>
                </div>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    ↓ Download
                  </Button>
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </ScrollArea>
  )
}

export function ApartmentDesign6Profile() {
  const [selectedId, setSelectedId] = useState(dummyApartments[0].id)
  const [activeTab, setActiveTab] = useState<Tab>("details")
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null)
  const [filterStates, setFilterStates] = useState<Set<BillStatusEnum>>(new Set())
  const [filterYear, setFilterYear] = useState<string>("all")

  const billData = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>()
    for (const b of dummyBills) {
      const e = map.get(b.apartmentId) ?? { count: 0, total: 0 }
      map.set(b.apartmentId, { count: e.count + 1, total: e.total + b.total })
    }
    return map
  }, [])

  const aptBills = useMemo(
    () =>
      dummyBills
        .filter((b) => b.apartmentId === selectedId)
        .sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod)),
    [selectedId]
  )

  const billYears = useMemo(
    () =>
      [...new Set(aptBills.map((b) => b.billingPeriod.slice(0, 4)))].sort(
        (a, b) => b.localeCompare(a)
      ),
    [aptBills]
  )

  const stateCounts = useMemo(() => {
    const map = new Map<BillStatusEnum, number>()
    for (const b of aptBills) map.set(b.state, (map.get(b.state) ?? 0) + 1)
    return map
  }, [aptBills])

  const filteredBills = useMemo(() => {
    let result = aptBills
    if (filterStates.size > 0)
      result = result.filter((b) => filterStates.has(b.state))
    if (filterYear !== "all")
      result = result.filter((b) => b.billingPeriod.startsWith(filterYear))
    return result
  }, [aptBills, filterStates, filterYear])

  function selectApt(id: string) {
    setSelectedId(id)
    setSelectedBillId(null)
    setFilterStates(new Set())
    setFilterYear("all")
  }

  const selectedIndex = dummyApartments.findIndex((a) => a.id === selectedId)
  const selected = dummyApartments[selectedIndex]!
  const accent = ACCENTS[selectedIndex % ACCENTS.length]
  const bd = billData.get(selected.id) ?? { count: 0, total: 0 }
  const activeTenantCount = DUMMY_TENANTS.filter(
    (t) => t.apartmentId === selectedId && !t.moveOut
  ).length
  const reportCount = DUMMY_REPORTS.filter(
    (r) => r.apartmentId === selectedId
  ).length

  return (
    <div className="flex h-[calc(100svh-49px)] overflow-hidden">
      {/* ── Slim left nav ── */}
      <nav className="flex w-52 shrink-0 flex-col overflow-hidden border-r border-border">
        <div className="shrink-0 border-b border-border px-3 py-3">
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            Properties
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-1">
          {dummyApartments.map((apt, i) => {
            const ac = ACCENTS[i % ACCENTS.length]
            const isSelected = apt.id === selectedId
            const bd2 = billData.get(apt.id) ?? { count: 0, total: 0 }
            return (
              <button
                key={apt.id}
                onClick={() => selectApt(apt.id)}
                className={`flex w-full items-center gap-3 border-b border-border px-3 py-3 text-left transition-colors last:border-0 ${
                  isSelected ? "bg-accent" : "hover:bg-muted/50"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${ac.dot}`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {apt.title ?? apt.id}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground/60">
                    {apt.id}
                  </p>
                </div>
                {bd2.count > 0 && (
                  <span className="shrink-0 rounded bg-muted px-1 text-[10px] text-muted-foreground">
                    {bd2.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── Detail area ── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex shrink-0 items-center gap-1 border-b border-border px-4 py-1.5">
          {(["details", "bills", "chart", "tenants", "reports"] as Tab[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab}
                {tab === "bills" && bd.count > 0 && (
                  <span className="ml-1.5 opacity-60">{bd.count}</span>
                )}
                {tab === "tenants" && activeTenantCount > 0 && (
                  <span className="ml-1.5 opacity-60">{activeTenantCount}</span>
                )}
                {tab === "reports" && reportCount > 0 && (
                  <span className="ml-1.5 opacity-60">{reportCount}</span>
                )}
              </button>
            )
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Create Report
            </Button>
            <Button size="sm" className="h-7 text-xs">
              + New Bill
            </Button>
          </div>
        </div>

        {/* Details tab */}
        {activeTab === "details" && (
          <ScrollArea className="h-full">
            <div className="max-w-2xl p-8">
              <div className="flex flex-col gap-7">
                {/* Hero card */}
                <div
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${accent.gradient} p-6 text-white shadow-lg`}
                >
                  <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/5" />
                  <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-8 translate-y-8 rounded-full bg-white/5" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="mb-1.5 text-sm font-medium opacity-70">
                        {selected.isSelfManaged
                          ? "Self-managed property"
                          : "Managed property"}
                      </p>
                      <h1 className="text-3xl leading-tight font-bold">
                        {selected.title ?? selected.id}
                      </h1>
                      <p className="mt-2 font-mono text-sm opacity-60">
                        {selected.id} · {selected.currency.shortName}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-4xl font-extralight tabular-nums">
                        {sym(selected)}
                        {selected.rentPrice.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm opacity-60">per month</p>
                    </div>
                  </div>
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    {
                      label: "Lease",
                      value: `${selected.rentalPeriodMonths} mo`,
                    },
                    { label: "Deposit", value: `${selected.depositMonths} mo` },
                    { label: "Currency", value: selected.currency.shortName },
                    {
                      label: "Parameters",
                      value: String(selected.template?.length ?? 0),
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-border bg-muted/30 p-3 text-center"
                    >
                      <p className="text-xl font-bold text-foreground">
                        {s.value}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bill summary callout */}
                {bd.count > 0 && (
                  <button
                    onClick={() => setActiveTab("bills")}
                    className={`rounded-xl border p-5 text-left transition-colors hover:opacity-90 ${accent.subtle}`}
                  >
                    <p
                      className={`mb-3 text-[10px] font-semibold tracking-widest uppercase ${accent.label}`}
                    >
                      Billing History · click to view bills →
                    </p>
                    <div className="flex gap-8">
                      <div>
                        <p className="text-3xl font-light text-foreground">
                          {bd.count}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          bills on record
                        </p>
                      </div>
                      <div>
                        <p className="text-3xl font-light text-foreground">
                          {sym(selected)}
                          {Math.round(bd.total).toLocaleString()}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          total billed
                        </p>
                      </div>
                      <div>
                        <p className="text-3xl font-light text-foreground">
                          {sym(selected)}
                          {(bd.total / bd.count).toFixed(0)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          avg per bill
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {/* IBAN */}
                {selected.bankAccountNumber && (
                  <div className="rounded-xl border border-border p-4">
                    <p className="mb-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                      Bank Account (IBAN)
                    </p>
                    <p className="font-mono text-sm break-all text-foreground">
                      {selected.bankAccountNumber}
                    </p>
                  </div>
                )}

                {/* Template */}
                {selected.template && selected.template.length > 0 ? (
                  <div>
                    <p className="mb-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                      Bill Parameter Template
                    </p>
                    <div className="flex flex-col gap-2">
                      {selected.template.map((t, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-2.5 transition-colors hover:bg-muted/30"
                        >
                          <span className="text-sm text-foreground">
                            {t.title}
                          </span>
                          <div className="text-right">
                            <span
                              className={`font-mono text-sm font-semibold ${accent.text}`}
                            >
                              {t.valuePerUnit}
                            </span>
                            <span className="ml-1.5 text-xs text-muted-foreground">
                              /{t.unitName}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground/60">
                      No bill parameter template defined
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Bills tab */}
        {activeTab === "bills" && (
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Filter strip */}
            <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border px-4 py-2">
              {/* Status filters */}
              <div className="flex items-center gap-1">
                <span className="mr-0.5 text-[10px] text-muted-foreground">
                  Status:
                </span>
                <button
                  onClick={() => setFilterStates(new Set())}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                    filterStates.size === 0
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {(
                  [
                    BillStatusEnum.Created,
                    BillStatusEnum.Paid,
                    BillStatusEnum.Confirmed,
                    BillStatusEnum.Outdated,
                  ] as BillStatusEnum[]
                ).map((s) => {
                  const count = stateCounts.get(s) ?? 0
                  if (count === 0) return null
                  const isActive = filterStates.has(s)
                  return (
                    <button
                      key={s}
                      onClick={() =>
                        setFilterStates((prev) => {
                          const next = new Set(prev)
                          if (next.has(s)) next.delete(s)
                          else next.add(s)
                          return next
                        })
                      }
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                        isActive
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                      <span className="ml-1 opacity-50">{count}</span>
                    </button>
                  )
                })}
              </div>

              {/* Year filters */}
              {billYears.length > 1 && (
                <>
                  <div className="h-3.5 w-px bg-border" />
                  <div className="flex items-center gap-1">
                    <span className="mr-0.5 text-[10px] text-muted-foreground">
                      Year:
                    </span>
                    <button
                      onClick={() => setFilterYear("all")}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                        filterYear === "all"
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      All
                    </button>
                    {billYears.map((y) => (
                      <button
                        key={y}
                        onClick={() =>
                          setFilterYear((prev) => (prev === y ? "all" : y))
                        }
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                          filterYear === y
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {(filterStates.size > 0 || filterYear !== "all") && (
                <button
                  onClick={() => {
                    setFilterStates(new Set())
                    setFilterYear("all")
                  }}
                  className="ml-auto text-[11px] text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            <BillsMasterDetail
              bills={filteredBills}
              selectedBillId={selectedBillId}
              onSelectBill={setSelectedBillId}
            />
          </div>
        )}

        {/* Chart tab */}
        {activeTab === "chart" && (
          <BillingChart bills={aptBills} currencySym={sym(selected)} />
        )}

        {/* Tenants tab */}
        {activeTab === "tenants" && <TenantsTab aptId={selectedId} />}

        {/* Reports tab */}
        {activeTab === "reports" && <ReportsTab aptId={selectedId} />}
      </main>
    </div>
  )
}
