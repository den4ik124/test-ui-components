# ApartmentsBillsDesign — AI Agent Implementation Guide

This document is an exhaustive reference for implementing (or re-implementing from scratch) the design exported from `apps/web/src/components/designs/ApartmentsBillsDesign.tsx`. It covers every file that must be touched, every data contract from the API schema, all edge cases, and the exact code required at each step.

---

## 1. File Map

| File | Role |
|---|---|
| `apps/web/src/components/designs/ApartmentsBillsDesign.tsx` | Top-level page component |
| `apps/web/src/components/designs/billDisplay.tsx` | Bill list nav + detail pane + donut chart |
| `apps/web/src/components/designs/shared.tsx` | Pure helpers shared by all designs |
| `apps/web/src/models/BillData.ts` | Primary bill runtime model |
| `apps/web/src/models/BillParameter.ts` | Individual line-item model |
| `apps/web/src/models/BillStatusEnum.ts` | Status enum (const object + type) |
| `apps/web/src/models/apartment.ts` | `ApartmentResponse`, `ApartmentShortResponse` |
| `apps/web/src/models/bill.ts` | API response shapes, create/update request shapes |
| `apps/web/src/models/currency.ts` | `CurrencyDto` |
| `apps/web/src/data/billDummyData.ts` | Static demo bills (`dummyBills: BillData[]`) |
| `apps/web/src/data/apartmentDummyData.ts` | Static demo apartments (`dummyApartments`) |
| `packages/ui/src/components/chart.tsx` | shadcn chart wrapper (must be installed via CLI) |
| `shema.json` | OpenAPI 3.0.1 spec for the backend API |

---

## 2. Data Models

### 2.1 `BillStatusEnum` (`models/BillStatusEnum.ts`)

```ts
export const BillStatusEnum = {
  Created:   "Created",
  Paid:      "Paid",
  Confirmed: "Confirmed",
  Outdated:  "Outdated",
} as const

export type BillStatusEnum = (typeof BillStatusEnum)[keyof typeof BillStatusEnum]
```

**Pattern:** a const-object-plus-type pattern (not a real TS `enum`) so the values are plain strings that survive JSON serialisation.

API field: `state` on `BillResponse` (schema path `#/components/schemas/Apartments.Domain.Enums.BillState` in `shema.json`, line `1964`). The values `Created | Paid | Confirmed | Outdated` map 1:1.

### 2.2 `BillParameter` (`models/BillParameter.ts`)

```ts
export interface BillParameter {
  title: string | null   // display name; null-safe everywhere
  index: number          // 1-based sort order
  previousValue: number  // meter reading at start of period
  value: number          // meter reading at end of period
  price: number          // cost per unit
  date: string           // ISO date of reading
  description?: string
  isUncertain?: boolean  // renders "est." badge in UI
}
```

**Key derived values** (from `shared.tsx`):
- `calcUsage(p)` = `p.value - p.previousValue`  — physical units consumed
- `calcAmount(p)` = `calcUsage(p) * p.price`    — line-item cost in currency

Edge cases:
- `title` can be `null`. Always fall back to `Item ${index}` when rendering.
- `calcUsage(p)` can be zero (a parameter was included but nothing was consumed). Items with `calcAmount === 0` are excluded from the donut chart.
- `isUncertain` is `undefined` by default; treat falsy as `false`.

### 2.3 `BillData` (`models/BillData.ts`)

```ts
export interface BillData {
  id: string             // UUID
  publicId: string       // Human-readable e.g. "INV-2025-0157"
  apartmentId: string    // e.g. "APT-42A"
  total: number          // Pre-computed sum (do NOT re-derive from parameters)
  billingPeriod: string  // "YYYY-MM" format — NEVER a full date
  dateCreated: string    // ISO date string
  state: BillStatusEnum
  parameters: BillParameter[]
}
```

**`billingPeriod` format is `"YYYY-MM"`, not a timestamp.** Use `billingPeriod.slice(0, 4)` to extract the year. Use `billingPeriod.split("-")` to get year + month for `new Date(year, month-1)`.

### 2.4 `ApartmentResponse` (`models/apartment.ts`)

```ts
export interface ApartmentResponse {
  id: string
  title: string | null
  photoUrl: string | null
  bankAccountNumber: string | null
  rentPrice: number
  rentalPeriodMonths: number
  depositMonths: number
  currency: CurrencyDto         // { code, shortName, rates }
  isSelfManaged: boolean
  template: BillParameterTemplate[] | null
  bills: BillResponse[] | null
}
```

`template` can be `null` — always guard with `selected.template && selected.template.length > 0`.

### 2.5 `CurrencyDto` (`models/currency.ts`)

```ts
export interface CurrencyDto {
  code: number
  shortName: string | null  // "USD", "EUR", "GBP", etc.
  rates: Record<string, number> | null
}
```

Currency symbol resolution (defined in `ApartmentsBillsDesign.tsx`):

```ts
const CURRENCY_SYM: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" }
function sym(apt: ApartmentResponse) {
  return CURRENCY_SYM[apt.currency.shortName ?? ""] ?? apt.currency.shortName ?? ""
}
```

Edge case: if `shortName` is not in the map AND not null, fall back to the raw `shortName`. If `shortName` is null, render empty string.

### 2.6 API Schema Reference (`shema.json`)

Key endpoints the UI dummy data is modelled after:

| Endpoint | Method | Schema ref |
|---|---|---|
| `/apartment` | GET | `Apartments.Application.Responses.ApartmentResponse[]` |
| `/apartment/{apartmentId}` | GET | `Apartments.Application.Responses.ApartmentShortResponse` |
| `/bill/{billId}` | GET | `Apartments.Application.Responses.BillResponse[]` |
| `/bill` | POST | `CreateBillRequest` body |
| `/bill/{id}` | PUT | `UpdateBillApiRequest` body |
| `/bill/{id}/state/{state}` | PATCH | `BillState` enum path param |
| `/bill/{id}/copy` | POST | Duplicates a bill |
| `/apartment/{apartmentId}/tenants` | GET | `GetApartmentTenantsResponse` |
| `/apartment/report` | POST | `GenerateApartmentReportRequest` |
| `/apartment/{apartmentId}/recent-reports` | GET | `RecentReportDto[]` |

`BillResponse.state` type: `Apartments.Domain.Enums.BillState` at `shema.json` line `1964`. Values are the same strings as `BillStatusEnum`.

---

## 3. Shared Utilities (`shared.tsx`)

Import these in both `ApartmentsBillsDesign.tsx` and `billDisplay.tsx`.

```ts
import {
  formatPeriod,       // "2025-01" → "January 2025"
  formatShortPeriod,  // "2025-01" → "Jan '25"
  formatDate,         // ISO → "January 1, 2025"
  calcUsage,          // p => p.value - p.previousValue
  calcAmount,         // p => calcUsage(p) * p.price
  STATUS_LABELS,      // Record<BillStatusEnum, string>
  STATUS_BADGE_CLASS, // Record<BillStatusEnum, tailwind string>
  STATUS_DOT_CLASS,   // Record<BillStatusEnum, tailwind string>
} from "./shared"
```

`STATUS_LABELS` maps enum values to human-readable strings:
```ts
{ Created: "Created", Paid: "Paid", Confirmed: "Confirmed", Outdated: "Outdated" }
```

`STATUS_BADGE_CLASS` maps to coloured badge Tailwind classes (blue/emerald/violet/gray).
`STATUS_DOT_CLASS` maps to coloured dot Tailwind classes.
`STATUS_RING_CLASS` (also exported but not used in this design) maps to ring classes.

**`PARAM_ICONS`** is also exported — a `Record<string, string>` mapping well-known parameter titles to emoji (Electricity → ⚡, etc.). Not used in `ApartmentsBillsDesign` but available for richer designs.

---

## 4. Package Installation

The chart component requires `recharts` and the shadcn chart wrapper. Install via:

```sh
npx shadcn@latest add chart -c packages/ui --yes
```

This creates `packages/ui/src/components/chart.tsx` and adds `recharts@^3.8.0` to `packages/ui/package.json`. **Do not install recharts directly in `apps/web`** — always go through the UI package to respect the monorepo boundary.

Imports after installation:

```ts
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"

import { PieChart, Pie, Cell, Label } from "recharts"
```

`ChartContainer` wraps Recharts' `ResponsiveContainer` and injects CSS variables for colours. It requires a `config: ChartConfig` prop and a `className` for sizing.

---

## 5. `billDisplay.tsx` — Complete Implementation

This file exports three public symbols:
- `BillDetail` — renders a single bill (header, donut chart, parameters table, action buttons)
- `BillListNav` — scrollable sidebar list of bills
- `BillsMasterDetail` — composes the two into a master-detail layout

### 5.1 Imports (complete, in order)

```ts
import { useState, useMemo } from "react"
import { PieChart, Pie, Cell, Label } from "recharts"
import type { BillData } from "../../models/BillData"
import { BillStatusEnum } from "../../models/BillStatusEnum"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@workspace/ui/components/context-menu"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { Separator } from "@workspace/ui/components/separator"
import {
  Table, TableBody, TableCell, TableFooter,
  TableHead, TableHeader, TableRow,
} from "@workspace/ui/components/table"
import {
  formatPeriod, formatShortPeriod, formatDate,
  calcUsage, calcAmount,
  STATUS_LABELS, STATUS_BADGE_CLASS, STATUS_DOT_CLASS,
} from "./shared"
```

### 5.2 Module-level Constants

```ts
// Colour palette for selected bill row in the nav sidebar
const STATUS_SELECTED_CLASS: Record<BillStatusEnum, string> = {
  [BillStatusEnum.Created]:
    "bg-blue-50 border-l-2 border-blue-500 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100 dark:border-blue-400",
  [BillStatusEnum.Paid]:
    "bg-emerald-50 border-l-2 border-emerald-500 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100 dark:border-emerald-400",
  [BillStatusEnum.Confirmed]:
    "bg-violet-50 border-l-2 border-violet-500 text-violet-900 dark:bg-violet-950/30 dark:text-violet-100 dark:border-violet-400",
  [BillStatusEnum.Outdated]:
    "bg-gray-100 border-l-2 border-gray-400 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-500",
}

// 10 distinct colours cycling for donut segments
const DONUT_COLORS = [
  "#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ef4444", "#84cc16", "#f97316", "#6366f1",
]
```

### 5.3 `DonutBreakdown` Component

Private to this file (no export). Renders a Recharts donut + a legend with a `%`/`$` toggle.

```tsx
function DonutBreakdown({ bill }: { bill: BillData }) {
  const [mode, setMode] = useState<"pct" | "currency">("pct")

  // Build chart data; filter out zero-amount parameters
  const items = useMemo(
    () =>
      bill.parameters
        .map((p, i) => ({
          name: p.title ?? `Item ${i + 1}`,
          value: calcAmount(p),
          fill: DONUT_COLORS[i % DONUT_COLORS.length],
        }))
        .filter((item) => item.value > 0),
    [bill]
  )

  // Guard against division by zero: || 1 keeps percentage math safe
  const total = items.reduce((s, x) => s + x.value, 0) || 1

  // ChartConfig is required by ChartContainer; keys must match item names
  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        items.map((item) => [item.name, { label: item.name, color: item.fill }])
      ) as ChartConfig,
    [items]
  )

  // If every parameter has zero amount (e.g. all flat fees zeroed), render nothing
  if (items.length === 0) return null

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      {/* ── Donut chart ── */}
      <ChartContainer config={chartConfig} className="h-44 w-44 shrink-0">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent nameKey="name" hideLabel />}
          />
          <Pie
            data={items}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={2}
            startAngle={90}      // start at 12 o'clock
            endAngle={-270}      // full 360° clockwise
          >
            {items.map((_, i) => (
              <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
            ))}
            {/* Centre label: total amount + "Total" caption */}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox)) return null
                const { cx, cy } = viewBox as { cx: number; cy: number }
                return (
                  <text textAnchor="middle">
                    <tspan
                      x={cx} y={(cy ?? 0) - 5}
                      fill="currentColor"
                      style={{ fontSize: "14px", fontWeight: 700 }}
                    >
                      ${Math.round(total).toLocaleString()}
                    </tspan>
                    <tspan
                      x={cx} y={(cy ?? 0) + 13}
                      fill="currentColor"
                      style={{ fontSize: "10px", opacity: 0.45 }}
                    >
                      Total
                    </tspan>
                  </text>
                )
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* ── Legend with % / $ toggle ── */}
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            Billing Breakdown
          </p>
          {/* Mode switcher */}
          <div className="flex overflow-hidden rounded-md border border-border">
            {(["pct", "currency"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  mode === m
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {m === "pct" ? "%" : "$"}
              </button>
            ))}
          </div>
        </div>
        {/* Two-column grid of legend rows */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: item.fill }}
              />
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {item.name}
              </span>
              <span className="shrink-0 text-[11px] font-medium text-foreground tabular-nums">
                {mode === "pct"
                  ? `${((item.value / total) * 100).toFixed(1)}%`
                  : `$${item.value.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Edge cases for `DonutBreakdown`:**
- A bill with ALL parameters at zero usage (e.g. every meter reading unchanged) produces `items.length === 0` → component returns `null`.
- `total` is guarded with `|| 1` to prevent `NaN` in percentage calculation when all amounts are zero but items somehow leaked through.
- `viewBox` type narrowing: Recharts' `Label` passes a polymorphic `viewBox`. Must check `"cx" in viewBox` before destructuring as a polar-coordinate object.
- `Cell` elements must be direct children of `Pie`; the `fill` prop on `Pie` itself is overridden per-cell.
- When `mode === "currency"`, the value is formatted as `$${item.value.toFixed(2)}` — the dollar sign is hardcoded. If the design needs multi-currency support, pass `currencySym` as a prop.

### 5.4 `BillDetail` Component

```tsx
export function BillDetail({
  bill,
  prevBill,
  showBreakdownChart,
}: {
  bill: BillData
  prevBill?: BillData       // the bill immediately before this one in sorted order
  showBreakdownChart?: boolean
}) {
  // Build a map of prevBill's usage values for delta indicators
  const prevUsageMap = useMemo(() => {
    const map = new Map<string, number>()
    if (prevBill) {
      for (const p of prevBill.parameters) map.set(p.title ?? "", calcUsage(p))
    }
    return map
  }, [prevBill])

  return (
    <div className="max-w-3xl">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs tracking-widest text-muted-foreground uppercase">
            Invoice {bill.publicId}
          </p>
          <h2 className="text-4xl font-light tracking-tight text-foreground">
            {formatPeriod(bill.billingPeriod)}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Issued {formatDate(bill.dateCreated)} · Apt {bill.apartmentId}
          </p>
        </div>
        <div className="text-right">
          <Badge
            variant="outline"
            className={`${STATUS_BADGE_CLASS[bill.state]} mb-2`}
          >
            {STATUS_LABELS[bill.state]}
          </Badge>
          <p className="text-5xl font-extralight text-foreground tabular-nums">
            ${bill.total.toFixed(2)}
          </p>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* ── Donut (opt-in) ── */}
      {showBreakdownChart && (
        <>
          <DonutBreakdown bill={bill} />
          <Separator className="my-6" />
        </>
      )}

      {/* ── Parameters table ── */}
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="text-center">Value</TableHead>
              <TableHead className="text-right">Usage</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bill.parameters.map((p) => (
              <TableRow key={p.index}>
                {/* Service name + "est." badge */}
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{p.title}</span>
                    {p.isUncertain && (
                      <span className="rounded bg-amber-100 px-1 text-[10px] text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                        est.
                      </span>
                    )}
                  </div>
                </TableCell>
                {/* Previous → Current meter reading */}
                <TableCell className="text-sm whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-14 shrink-0 text-right text-muted-foreground tabular-nums">
                      {p.previousValue.toLocaleString()}
                    </span>
                    <span className="shrink-0 text-muted-foreground/40">→</span>
                    <span className="w-14 shrink-0 tabular-nums">
                      {p.value.toLocaleString()}
                    </span>
                  </div>
                </TableCell>
                {/* Usage with delta indicator vs previous bill */}
                <TableCell className="text-right font-medium tabular-nums">
                  <span>{calcUsage(p).toLocaleString()}</span>
                  {(() => {
                    const prev = prevUsageMap.get(p.title ?? "")
                    if (prev === undefined) return null
                    const delta = calcUsage(p) - prev
                    if (delta === 0) return null
                    return (
                      <span
                        className={`ml-1.5 text-xs font-normal ${
                          delta > 0 ? "text-red-500" : "text-emerald-500"
                        }`}
                      >
                        {delta > 0 ? "↑" : "↓"}
                        {Math.abs(delta).toLocaleString()}
                      </span>
                    )
                  })()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  ${p.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  ${calcAmount(p).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="font-semibold">Total</TableCell>
              <TableCell className="text-right font-bold tabular-nums">
                ${bill.total.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* ── Action buttons — Created bills only ── */}
      {bill.state === BillStatusEnum.Created && (
        <>
          <Separator className="my-6" />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">Download PDF</Button>
            <Button className="flex-1">Pay Now</Button>
          </div>
        </>
      )}
    </div>
  )
}
```

**Edge cases for `BillDetail`:**
- `prevBill` is `undefined` for the oldest bill in the list (no comparison). `prevUsageMap` will be empty; delta column renders nothing.
- Delta lookup uses `p.title ?? ""` as the key. A null-titled parameter from two different bills will both map to `""` — they will be compared as if they are the same service. This is intentional (null-title parameters are unusual and the comparison degrades gracefully).
- `bill.total` is the server-authoritative sum. Never compute it from `parameters` in the UI — parameter amounts may be marked uncertain and the server may apply rounding.
- Action buttons only appear for `Created` state. `Paid`, `Confirmed`, and `Outdated` bills are read-only in the UI.

### 5.5 `BillListNav` Component

```tsx
export function BillListNav({
  bills,
  selectedId,
  onSelect,
  onCopy,
  emptyLabel = "No bills yet",
}: {
  bills: BillData[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCopy?: (bill: BillData) => void
  emptyLabel?: string
}) {
  if (bills.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-3 py-8">
        <p className="text-center text-xs text-muted-foreground/50">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="flex flex-col gap-0.5 px-2 py-2">
        {bills.map((bill, i) => {
          // Year separator: show when year changes between adjacent bills
          const year = bill.billingPeriod.slice(0, 4)
          const prevYear = i > 0 ? bills[i - 1].billingPeriod.slice(0, 4) : null
          const showYearSep = prevYear !== null && year !== prevYear
          const isSelected = bill.id === selectedId
          return (
            <div key={bill.id}>
              {showYearSep && (
                <div className="flex items-center gap-1.5 px-1 py-1.5">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] text-muted-foreground/50 tabular-nums">{year}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
              <ContextMenu>
                <ContextMenuTrigger>
                  <button
                    onClick={() => onSelect(bill.id)}
                    className={`w-full rounded py-1.5 text-left text-sm transition-all ${
                      isSelected
                        ? `pr-1 pl-2 font-medium ${STATUS_SELECTED_CLASS[bill.state]}`
                        : "px-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[bill.state]}`} />
                      {formatShortPeriod(bill.billingPeriod)}
                    </span>
                    <span className="mt-0.5 block pl-3 text-xs opacity-60">
                      ${bill.total.toFixed(2)}
                    </span>
                  </button>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-44">
                  <ContextMenuItem onClick={() => onSelect(bill.id)}>View details</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => onCopy?.(bill)}>Copy</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Edge cases:**
- `showYearSep` depends on bills being sorted newest-first (`billingPeriod` descending). If the sort order changes, year separators will appear in wrong places.
- `scrollbarWidth: "none"` hides the scrollbar visually but keeps scrollability. This is intentional — the sidebar is narrow (144px / `w-44`).
- `onCopy` is optional; the `onCopy?.(bill)` call is a no-op if not provided.
- Year separator only appears between adjacent items; the FIRST item in a new year gets the separator ABOVE it. The separator shows the OLDER year (the bills below it).

### 5.6 `BillsMasterDetail` Component

```tsx
export function BillsMasterDetail({
  bills,
  selectedBillId,
  onSelectBill,
  onCopyBill,
  navLabel = "Billing History",
  showBreakdownChart,
}: {
  bills: BillData[]
  selectedBillId: string | null
  onSelectBill: (id: string) => void
  onCopyBill?: (bill: BillData) => void
  navLabel?: string
  showBreakdownChart?: boolean
}) {
  // If the stored selectedBillId is no longer in the filtered list, fall back to first
  const effectiveId =
    selectedBillId && bills.some((b) => b.id === selectedBillId)
      ? selectedBillId
      : (bills[0]?.id ?? null)

  const selectedBill = bills.find((b) => b.id === effectiveId)
  const selectedIdx = bills.findIndex((b) => b.id === effectiveId)
  // bills[selectedIdx + 1] is the OLDER bill (list is newest-first)
  const prevBill = bills[selectedIdx + 1]

  return (
    <div className="flex min-w-0 flex-1 overflow-hidden">
      {/* ── Left nav ── */}
      <nav className="flex w-44 shrink-0 flex-col overflow-hidden border-r border-border">
        <div className="shrink-0 border-b border-border px-3 py-2.5">
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
            {navLabel}
          </p>
        </div>
        <BillListNav
          bills={bills}
          selectedId={effectiveId}
          onSelect={onSelectBill}
          onCopy={onCopyBill}
        />
        {bills.length > 0 && (
          <div className="shrink-0 border-t border-border px-3 py-2">
            <p className="text-center text-[10px] text-muted-foreground/40">
              {bills.length} {bills.length === 1 ? "bill" : "bills"}
            </p>
          </div>
        )}
      </nav>

      {/* ── Detail pane ── */}
      <main className="min-w-0 flex-1 overflow-hidden">
        {selectedBill ? (
          <ScrollArea className="h-full">
            <div className="px-8 py-8">
              <BillDetail
                bill={selectedBill}
                prevBill={prevBill}
                showBreakdownChart={showBreakdownChart}
              />
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {bills.length === 0 ? (
              <div className="text-center">
                <p className="mb-2 text-4xl">🧾</p>
                <p className="text-sm font-medium">No bills yet</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  This property has no billing history
                </p>
              </div>
            ) : (
              "Select a bill to view details"
            )}
          </div>
        )}
      </main>
    </div>
  )
}
```

**Edge cases:**
- `effectiveId` fall-back: when the user applies a filter that removes the currently-selected bill, the component auto-selects the first remaining bill instead of showing an empty detail pane.
- When `bills` is empty and `effectiveId` is `null`, `selectedBill` is `undefined` and the empty state with the 🧾 emoji is shown.
- `prevBill = bills[selectedIdx + 1]`: because the list is newest-first, the item at `selectedIdx + 1` is one month older. If the selected bill is the oldest, `selectedIdx + 1` is out of bounds → `prevBill` is `undefined` → delta indicators in `BillDetail` are suppressed.
- `showBreakdownChart` is `undefined` by default (falsy) so other callers of `BillsMasterDetail` don't get the donut chart unless they explicitly pass `showBreakdownChart`.

---

## 6. `ApartmentsBillsDesign.tsx` — Complete Implementation

### 6.1 Layout Structure

```
┌─ div.flex.h-[calc(100svh-49px)].overflow-hidden ────────────────────────┐
│  ┌─ nav.w-52 ─────────────────┐  ┌─ main.flex-1 ─────────────────────┐ │
│  │  Properties header         │  │  Tab bar                           │ │
│  │  ─────────────────────     │  │  ────────────────────              │ │
│  │  [APT-42A] • dot • count   │  │  activeTab === "details"  → ...    │ │
│  │  [APT-07B] • dot • count   │  │  activeTab === "bills"    → ...    │ │
│  │  ...                       │  │  activeTab === "chart"    → ...    │ │
│  └────────────────────────────┘  │  activeTab === "tenants"  → ...    │ │
│                                   │  activeTab === "reports"  → ...    │ │
│                                   └───────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6.2 State Variables

```ts
const [selectedId, setSelectedId] = useState(dummyApartments[0].id)
const [activeTab, setActiveTab] = useState<Tab>("details")
const [selectedBillId, setSelectedBillId] = useState<string | null>(null)
const [filterStates, setFilterStates] = useState<Set<BillStatusEnum>>(new Set())
const [filterYear, setFilterYear] = useState<string>("all")
```

`filterStates` is a `Set` (not an array) so toggle operations are O(1). When `filterStates.size === 0` it means "show all states".

`filterYear === "all"` means no year filter. Any 4-digit string (e.g. `"2025"`) restricts to that year.

### 6.3 Derived Data (memos)

```ts
// Total bill count and total amount per apartment — for sidebar badges and details callout
const billData = useMemo(() => {
  const map = new Map<string, { count: number; total: number }>()
  for (const b of dummyBills) {
    const e = map.get(b.apartmentId) ?? { count: 0, total: 0 }
    map.set(b.apartmentId, { count: e.count + 1, total: e.total + b.total })
  }
  return map
}, [])  // no deps — dummyBills is static

// Bills for the selected apartment, newest-first
const aptBills = useMemo(
  () =>
    dummyBills
      .filter((b) => b.apartmentId === selectedId)
      .sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod)),
  [selectedId]
)

// Available years extracted from aptBills — for year filter chips
const billYears = useMemo(
  () =>
    [...new Set(aptBills.map((b) => b.billingPeriod.slice(0, 4)))]
      .sort((a, b) => b.localeCompare(a)),  // newest year first
  [aptBills]
)

// Per-status bill count — to show counts on status chips and hide chips with 0
const stateCounts = useMemo(() => {
  const map = new Map<BillStatusEnum, number>()
  for (const b of aptBills) map.set(b.state, (map.get(b.state) ?? 0) + 1)
  return map
}, [aptBills])

// Bills after applying both filters
const filteredBills = useMemo(() => {
  let result = aptBills
  if (filterStates.size > 0)
    result = result.filter((b) => filterStates.has(b.state))
  if (filterYear !== "all")
    result = result.filter((b) => b.billingPeriod.startsWith(filterYear))
  return result
}, [aptBills, filterStates, filterYear])
```

**Edge cases for memos:**
- `billYears.length <= 1`: when there's only one year (or no bills), the Year filter strip is hidden entirely (see section 6.5).
- `stateCounts.get(s) ?? 0`: a status that has no bills returns 0; status chips with count 0 are hidden (`if (count === 0) return null`).
- `filteredBills` can be empty if filters are over-constrained — the empty state in `BillsMasterDetail` handles this.

### 6.4 `selectApt` Function

```ts
function selectApt(id: string) {
  setSelectedId(id)
  setSelectedBillId(null)   // reset detail selection
  setFilterStates(new Set()) // reset status filter
  setFilterYear("all")       // reset year filter
}
```

**Critical:** must reset ALL filter state when switching apartments, otherwise filters from apartment A remain active on apartment B.

### 6.5 Bills Tab — Filter Strip

The filter strip lives inside `activeTab === "bills"` and above `BillsMasterDetail`:

```tsx
{activeTab === "bills" && (
  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    {/* Filter strip */}
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border px-4 py-2">

      {/* Status filters */}
      <div className="flex items-center gap-1">
        <span className="mr-0.5 text-[10px] text-muted-foreground">Status:</span>
        {/* "All" chip */}
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
        {/* Per-status chips — only render if count > 0 */}
        {([
          BillStatusEnum.Created,
          BillStatusEnum.Paid,
          BillStatusEnum.Confirmed,
          BillStatusEnum.Outdated,
        ] as BillStatusEnum[]).map((s) => {
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

      {/* Year filters — only when there are 2+ distinct years */}
      {billYears.length > 1 && (
        <>
          <div className="h-3.5 w-px bg-border" />  {/* vertical divider */}
          <div className="flex items-center gap-1">
            <span className="mr-0.5 text-[10px] text-muted-foreground">Year:</span>
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
                onClick={() => setFilterYear((prev) => (prev === y ? "all" : y))}
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

      {/* "Clear" link — only visible when any filter is active */}
      {(filterStates.size > 0 || filterYear !== "all") && (
        <button
          onClick={() => { setFilterStates(new Set()); setFilterYear("all") }}
          className="ml-auto text-[11px] text-muted-foreground/50 transition-colors hover:text-muted-foreground"
        >
          Clear
        </button>
      )}
    </div>

    {/* Master-detail with donut chart enabled */}
    <BillsMasterDetail
      bills={filteredBills}
      selectedBillId={selectedBillId}
      onSelectBill={setSelectedBillId}
      showBreakdownChart
    />
  </div>
)}
```

**Key details:**
- Status chip toggle: clicking an active chip removes it from the set; clicking an inactive chip adds it. Multiple statuses can be active simultaneously (OR logic).
- Year chip toggle: clicking the active year resets to "all" (`prev === y ? "all" : y`). Only one year can be active at a time.
- `showBreakdownChart` prop (no value = `true`) is passed to opt this design into the donut chart. Other designs that use `BillsMasterDetail` without this prop will not show the chart.

### 6.6 `ACCENT` Colour System

Each apartment in the sidebar gets a colour from a rotating palette:

```ts
const ACCENTS = [
  { gradient: "from-blue-500 to-indigo-600",   dot: "bg-blue-500",   text: "text-blue-500 dark:text-blue-400",     subtle: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",     label: "text-blue-700 dark:text-blue-300" },
  { gradient: "from-emerald-500 to-teal-600",   dot: "bg-emerald-500", text: "text-emerald-500 dark:text-emerald-400", subtle: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800", label: "text-emerald-700 dark:text-emerald-300" },
  { gradient: "from-violet-500 to-purple-600",  dot: "bg-violet-500", text: "text-violet-500 dark:text-violet-400",  subtle: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800",  label: "text-violet-700 dark:text-violet-300" },
  { gradient: "from-amber-500 to-orange-600",   dot: "bg-amber-500",  text: "text-amber-500 dark:text-amber-400",   subtle: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",   label: "text-amber-700 dark:text-amber-300" },
  { gradient: "from-rose-500 to-pink-600",      dot: "bg-rose-500",   text: "text-rose-500 dark:text-rose-400",     subtle: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",     label: "text-rose-700 dark:text-rose-300" },
  { gradient: "from-cyan-500 to-sky-600",       dot: "bg-cyan-500",   text: "text-cyan-500 dark:text-cyan-400",     subtle: "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800",     label: "text-cyan-700 dark:text-cyan-300" },
]
```

Index: `ACCENTS[i % ACCENTS.length]` where `i` is the apartment's index in `dummyApartments`.

Each accent has 5 tokens used in different contexts:
- `gradient` → hero card background (`bg-gradient-to-br ${accent.gradient}`)
- `dot` → coloured dot in the sidebar list
- `text` → accent-coloured text in the details tab template list
- `subtle` → billing history callout button background/border
- `label` → callout section heading colour

### 6.7 `BillingChart` SVG Component (Chart Tab)

The "chart" tab renders a hand-drawn SVG line chart (no recharts) using Catmull-Rom splines. Key points:

- `catmullRom(pts)` produces a smooth path string from an array of `{x, y}` points.
- X axis = time (oldest left, newest right), derived from `sorted` (sorted oldest-first, opposite to `aptBills`).
- Y axis = `bill.total` in currency. Grid is 5 horizontal lines at equal intervals between `yMin` and `yMax`.
- `yMin = Math.max(0, rawMin - spread * 0.2)` — never goes below zero; adds 20% padding below minimum.
- `yMax = rawMax + spread * 0.1` — adds 10% headroom above maximum.
- When there is only one data point, `spread = rawMax * 0.2 || 1` prevents division by zero.
- Hover detection: nearest point by X distance using `svgX` computed from `clientX` and `getBoundingClientRect()`.
- Tooltip auto-flips left if it would overflow right edge: `hpt.x + 14 + tooltipW > W - pad.right`.

This component is **NOT** affected by `filterStates`/`filterYear` — it always shows all `aptBills`.

### 6.8 `TenantsTab` and `ReportsTab`

Both consume local dummy data (`DUMMY_TENANTS`, `DUMMY_REPORTS`) filtered by `aptId`. They are self-contained and do not interact with bill state.

`TenantsTab` groups tenants into "Active" (no `moveOut`) and "Past" (has `moveOut`). Each renders a `TenantCard` with initials avatar, colour from `AVATAR_BG`, and a hover-reveal trash button.

`ReportsTab` renders each report with icon + badge per type (PDF → red, XLSX → emerald, CSV → blue) and a download link. URLs in `DUMMY_REPORTS` are illustrative; in production they would come from `/apartment/{apartmentId}/recent-reports` (see `shema.json`).

---

## 7. TypeScript Compile Check

After all changes, run:

```sh
npx tsc --noEmit -p apps/web/tsconfig.json
```

Expected output: empty (no errors). Common transient errors during partial edits:

| Error | Cause | Fix |
|---|---|---|
| `'X' is declared but its value is never read` | Import added before usage | Add the usage or move the import |
| `Argument of type 'string \| null' is not assignable to parameter of type 'string'` | `p.title` used without null guard | Use `p.title ?? ""` or `p.title ?? \`Item \${i+1}\`` |
| `Property 'cx' does not exist on type 'ViewBox'` | Recharts `Label` viewBox not narrowed | Check `"cx" in viewBox` before destructuring |
| `Type 'Set<BillStatusEnum>' is not assignable` | `useState<Set<...>>` initialised incorrectly | Use `useState<Set<BillStatusEnum>>(new Set())` |

---

## 8. Step-by-Step Migration From Baseline Design

If you are updating an older version of this design that is missing features, apply changes in this order:

### Step 1 — Install chart component
```sh
npx shadcn@latest add chart -c packages/ui --yes
```
Verify `packages/ui/src/components/chart.tsx` exists and `packages/ui/package.json` has `recharts`.

### Step 2 — Update `shared.tsx`
Ensure all of the following are exported: `STATUS_LABELS`, `STATUS_BADGE_CLASS`, `STATUS_DOT_CLASS`, `STATUS_RING_CLASS`, `PARAM_ICONS`, `formatPeriod`, `formatShortPeriod`, `formatDate`, `calcUsage`, `calcAmount`.

### Step 3 — Rewrite `billDisplay.tsx`
In order:
1. Add imports: `useState`, `useMemo`, Recharts primitives, `ChartContainer`/`ChartTooltip`/`ChartTooltipContent`/`ChartConfig`, `ScrollArea`, `Separator`, Table components.
2. Add `STATUS_SELECTED_CLASS` and `DONUT_COLORS` constants.
3. Add `DonutBreakdown` function component.
4. Update `BillDetail` signature to add `showBreakdownChart?: boolean` and insert the conditional `<DonutBreakdown>` block after the first `<Separator>`.
5. Update `BillsMasterDetail` signature to add `showBreakdownChart?: boolean` and thread it to `<BillDetail>`.

### Step 4 — Update `ApartmentsBillsDesign.tsx`
In order:
1. Add imports: `BillStatusEnum`, `STATUS_LABELS` (if not already imported from `./shared`).
2. Add state: `filterStates`, `filterYear`.
3. Add memos: `billYears`, `stateCounts`, `filteredBills`.
4. Update `selectApt` to reset `filterStates` and `filterYear`.
5. Replace the bills tab content div with the filter strip + `BillsMasterDetail` with `showBreakdownChart`.

### Step 5 — Verify
```sh
npx tsc --noEmit -p apps/web/tsconfig.json
```
No output = success.

---

## 9. API Integration Notes

When replacing dummy data with real API calls:

- `dummyApartments` → `GET /apartment` → `ApartmentResponse[]`
- `dummyBills` (filtered by `apartmentId`) → `GET /bill/{billId}` (note: confusingly this endpoint returns all bills for the apartment). Check `shema.json` at path `/bill/{billId}`.
- `DUMMY_TENANTS` → `GET /apartment/{apartmentId}/tenants` → `GetApartmentTenantsResponse`
- `DUMMY_REPORTS` → `GET /apartment/{apartmentId}/recent-reports` → `RecentReportDto[]`
- "Copy" button in context menu → `POST /bill/{id}/copy`
- "Pay Now" button → `PATCH /bill/{id}/state/Paid`
- "Download PDF" → `POST /apartment/report` with `format: "PDF"`

`BillResponse.state` is typed as `BillState` in `models/bill.ts` (not `BillStatusEnum`). When mapping API data to `BillData`, cast `state` as `BillStatusEnum` — the values are identical strings.

`BillResponse.parameters` can be `null` (see `models/bill.ts`). Guard with `parameters ?? []` when converting to `BillData`.

`billingPeriod` from the API is a `"YYYY-MM"` string matching the dummy data format.

---

## 10. i18n Translation Keys

Every hardcoded UI string that must be added to translation files, grouped by component. Keys are suggestions — align with your project's key convention.

### 10.1 `shared.tsx` — Status Labels

These are used throughout all designs via `STATUS_LABELS`.

| Key | Default (EN) |
|---|---|
| `bill.status.created` | `"Created"` |
| `bill.status.paid` | `"Paid"` |
| `bill.status.confirmed` | `"Confirmed"` |
| `bill.status.outdated` | `"Outdated"` |

### 10.2 `billDisplay.tsx` — DonutBreakdown

| Key | Default (EN) | Notes |
|---|---|---|
| `bill.breakdown.title` | `"Billing Breakdown"` | Section heading above legend |
| `bill.breakdown.mode.pct` | `"%"` | Toggle button label |
| `bill.breakdown.mode.currency` | `"$"` | Toggle button label — replace symbol dynamically |
| `bill.breakdown.center.total` | `"Total"` | SVG tspan below the dollar amount |
| `bill.breakdown.item.fallback` | `"Item {{index}}"` | Shown when `p.title === null`; `{{index}}` is 1-based |

### 10.3 `billDisplay.tsx` — BillDetail (header)

| Key | Default (EN) | Notes |
|---|---|---|
| `bill.detail.invoice` | `"Invoice"` | Prefix before `bill.publicId` |
| `bill.detail.issued` | `"Issued"` | Prefix before formatted `dateCreated` |
| `bill.detail.apt` | `"Apt"` | Prefix before `bill.apartmentId` |
| `bill.detail.uncertain` | `"est."` | Badge when `p.isUncertain === true` |

### 10.4 `billDisplay.tsx` — BillDetail (parameters table headers)

| Key | Default (EN) |
|---|---|
| `bill.table.header.service` | `"Service"` |
| `bill.table.header.value` | `"Value"` |
| `bill.table.header.usage` | `"Usage"` |
| `bill.table.header.rate` | `"Rate"` |
| `bill.table.header.amount` | `"Amount"` |
| `bill.table.footer.total` | `"Total"` |

### 10.5 `billDisplay.tsx` — BillDetail (action buttons)

These only render when `bill.state === BillStatusEnum.Created`.

| Key | Default (EN) |
|---|---|
| `bill.action.downloadPdf` | `"Download PDF"` |
| `bill.action.payNow` | `"Pay Now"` |

### 10.6 `billDisplay.tsx` — BillListNav

| Key | Default (EN) | Notes |
|---|---|---|
| `bill.nav.empty` | `"No bills yet"` | Default `emptyLabel` prop |

### 10.7 `billDisplay.tsx` — BillsMasterDetail

| Key | Default (EN) | Notes |
|---|---|---|
| `bill.masterDetail.navLabel` | `"Billing History"` | Default `navLabel` prop |
| `bill.masterDetail.count.one` | `"{{count}} bill"` | Footer when exactly 1 bill |
| `bill.masterDetail.count.other` | `"{{count}} bills"` | Footer for 0 or 2+ bills |
| `bill.masterDetail.selectPrompt` | `"Select a bill to view details"` | Empty detail pane when bills exist but none selected |
| `bill.masterDetail.empty.title` | `"No bills yet"` | Empty state heading |
| `bill.masterDetail.empty.description` | `"This property has no billing history"` | Empty state subtext |

### 10.8 `billDisplay.tsx` — BillListNav context menu

| Key | Default (EN) |
|---|---|
| `bill.contextMenu.viewDetails` | `"View details"` |
| `bill.contextMenu.copy` | `"Copy"` |

### 10.9 `ApartmentsBillsDesign.tsx` — Sidebar

| Key | Default (EN) |
|---|---|
| `apartments.sidebar.heading` | `"Properties"` |

### 10.10 `ApartmentsBillsDesign.tsx` — Tab bar

| Key | Default (EN) |
|---|---|
| `apartments.tab.details` | `"Details"` |
| `apartments.tab.bills` | `"Bills"` |
| `apartments.tab.chart` | `"Chart"` |
| `apartments.tab.tenants` | `"Tenants"` |
| `apartments.tab.reports` | `"Reports"` |
| `apartments.tab.action.createReport` | `"Create Report"` |
| `apartments.tab.action.newBill` | `"+ New Bill"` |

### 10.11 `ApartmentsBillsDesign.tsx` — Details tab

| Key | Default (EN) | Notes |
|---|---|---|
| `apartments.details.managed` | `"Managed property"` | When `!isSelfManaged` |
| `apartments.details.selfManaged` | `"Self-managed property"` | When `isSelfManaged` |
| `apartments.details.perMonth` | `"per month"` | Below rent price |
| `apartments.details.metric.lease` | `"Lease"` | Metric tile label |
| `apartments.details.metric.deposit` | `"Deposit"` | Metric tile label |
| `apartments.details.metric.currency` | `"Currency"` | Metric tile label |
| `apartments.details.metric.parameters` | `"Parameters"` | Metric tile label |
| `apartments.details.metric.months` | `"{{n}} mo"` | Value suffix for lease/deposit |
| `apartments.details.billing.heading` | `"Billing History · click to view bills →"` | Callout button label |
| `apartments.details.billing.count` | `"bills on record"` | Below count number |
| `apartments.details.billing.total` | `"total billed"` | Below total amount |
| `apartments.details.billing.avg` | `"avg per bill"` | Below average amount |
| `apartments.details.iban.heading` | `"Bank Account (IBAN)"` | Section label |
| `apartments.details.template.heading` | `"Bill Parameter Template"` | Section label |
| `apartments.details.template.empty` | `"No bill parameter template defined"` | Empty state |

### 10.12 `ApartmentsBillsDesign.tsx` — Bills tab filter strip

| Key | Default (EN) | Notes |
|---|---|---|
| `apartments.bills.filter.statusLabel` | `"Status:"` | Prefix before status chips |
| `apartments.bills.filter.yearLabel` | `"Year:"` | Prefix before year chips |
| `apartments.bills.filter.all` | `"All"` | Used for both status and year "All" chip |
| `apartments.bills.filter.clear` | `"Clear"` | Reset button shown when any filter active |

### 10.13 `ApartmentsBillsDesign.tsx` — Chart tab (SVG BillingChart)

| Key | Default (EN) |
|---|---|
| `apartments.chart.heading` | `"Monthly Billings Overview"` |
| `apartments.chart.subheading` | `"Showing total expenditures"` |
| `apartments.chart.tooltip.total` | `"total"` | Tooltip label prefix (rendered as `"total : $1,234"`) |
| `apartments.chart.empty` | `"No billing data available"` |

### 10.14 `ApartmentsBillsDesign.tsx` — Tenants tab

| Key | Default (EN) | Notes |
|---|---|---|
| `apartments.tenants.none` | `"No tenants assigned"` | Header strip when 0 tenants |
| `apartments.tenants.summary.active` | `"{{count}} active"` | Header strip count |
| `apartments.tenants.summary.past` | `"{{count}} past"` | Appended to active count |
| `apartments.tenants.action.invite` | `"Invite Tenant"` | Button label |
| `apartments.tenants.empty.title` | `"No tenants yet"` | Empty state heading |
| `apartments.tenants.empty.description` | `"Use \"Invite Tenant\" to get started"` | Empty state subtext |
| `apartments.tenants.section.active` | `"Active Tenants"` | Section heading |
| `apartments.tenants.section.past` | `"Past Tenants"` | Section heading |
| `apartments.tenants.badge.active` | `"Active"` | Tenant card badge |
| `apartments.tenants.badge.past` | `"Past"` | Tenant card badge |
| `apartments.tenants.since` | `"Tenant since {{date}}"` | Card footer for active tenants |
| `apartments.tenants.action.remove` | `"Remove tenant"` | Button tooltip/title |

### 10.15 `ApartmentsBillsDesign.tsx` — Reports tab

| Key | Default (EN) | Notes |
|---|---|---|
| `apartments.reports.empty.title` | `"No reports available"` | Empty state heading |
| `apartments.reports.generated` | `"Generated {{date}} · {{size}}"` | Report metadata line |
| `apartments.reports.download` | `"↓ Download"` | Download button label |

---

## 11. Known Constraints and Design Decisions

| Decision | Reason |
|---|---|
| `showBreakdownChart` prop pattern | Keeps the donut opt-in; other designs using `BillsMasterDetail` don't get the chart unless they explicitly request it |
| Currency hardcoded as `$` in donut | `DonutBreakdown` doesn't receive `currencySym`; safe to add as a prop if multi-currency display is needed |
| `bill.total` taken as-is | The server computes the total; re-deriving it from parameters may differ due to rounding or uncertain values |
| Status filter is additive (OR) | Allows viewing "Created OR Outdated" bills together without needing two separate passes |
| Year filter is exclusive (single selection) | Years are clear date boundaries; combining years would just mean "all" |
| `aptBills` sorted newest-first | The bill list nav reads most naturally newest-at-top; `BillingChart` independently re-sorts oldest-first |
| `prevBill` uses list index, not date math | Assumes the sorted list has no gaps; works correctly for monthly billing data |
