import { useState, useMemo, useEffect, useRef } from "react"
import { dummyApartments } from "../../data/apartmentDummyData"
import { dummyBills } from "../../data/billDummyData"
import type { BillData } from "../../models/BillData"
import type { ApartmentResponse } from "../../models/apartment"
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
import { Separator } from "@workspace/ui/components/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  formatPeriod,
  formatShortPeriod,
  formatDate,
  calcUsage,
  calcAmount,
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
} from "./shared"

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

const ALL_STATES = [
  BillStatusEnum.Created,
  BillStatusEnum.Paid,
  BillStatusEnum.Confirmed,
  BillStatusEnum.Outdated,
] as const

// ─── Bill detail ─────────────────────────────────────────────────────────────

function BillDetail({
  bill,
  prevBill,
}: {
  bill: BillData
  prevBill?: BillData
}) {
  const prevUsageMap = useMemo(() => {
    const map = new Map<string, number>()
    if (prevBill) {
      for (const p of prevBill.parameters) map.set(p.title ?? "", calcUsage(p))
    }
    return map
  }, [prevBill])

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs tracking-widest text-muted-foreground uppercase">
            Invoice {bill.publicId}
          </p>
          <h2 className="text-4xl font-light tracking-tight text-foreground">
            {formatPeriod(bill.billingPeriod)}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Issued {formatDate(bill.dateCreated)} &middot; Apt{" "}
            {bill.apartmentId}
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
                <TableCell className="text-right font-medium tabular-nums">
                  <span>{calcUsage(p).toLocaleString()}</span>
                  {(() => {
                    const prev = prevUsageMap.get(p.title ?? "")
                    if (prev === undefined) return null
                    const delta = calcUsage(p) - prev
                    if (delta === 0) return null
                    return (
                      <span
                        className={`ml-1.5 text-xs font-normal ${delta > 0 ? "text-red-500" : "text-emerald-500"}`}
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
              <TableCell colSpan={4} className="font-semibold">
                Total
              </TableCell>
              <TableCell className="text-right font-bold tabular-nums">
                ${bill.total.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {bill.state === BillStatusEnum.Created && (
        <>
          <Separator className="my-6" />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              Download PDF
            </Button>
            <Button className="flex-1">Pay Now</Button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Apartment switcher dropdown ─────────────────────────────────────────────

function ApartmentDropdown({
  apartments,
  selectedId,
  billCountByApt,
  onSelect,
  onClose,
}: {
  apartments: ApartmentResponse[]
  selectedId: string
  billCountByApt: Map<string, number>
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 z-50 mt-1 w-72 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
    >
      {apartments.map((apt) => {
        const count = billCountByApt.get(apt.id) ?? 0
        const isSelected = apt.id === selectedId
        return (
          <button
            key={apt.id}
            onClick={() => {
              onSelect(apt.id)
              onClose()
            }}
            className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0 ${
              isSelected ? "bg-accent" : "hover:bg-muted/50"
            }`}
          >
            <span className="mt-0.5 shrink-0 text-base">🏠</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {apt.title ?? apt.id}
                </span>
                {isSelected && (
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    ✓
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-1 font-mono text-[10px]">
                  {apt.id}
                </span>
                <span>{apt.currency.shortName}</span>
                <span>{apt.rentPrice.toLocaleString()}/mo</span>
                <span>{count} bills</span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Period select ────────────────────────────────────────────────────────────

function PeriodSelect({
  value,
  periods,
  placeholder,
  onChange,
}: {
  value: string
  periods: string[]
  placeholder: string
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground transition-colors outline-none hover:border-foreground/40"
    >
      <option value="">{placeholder}</option>
      {periods.map((p) => (
        <option key={p} value={p}>
          {formatShortPeriod(p)}
        </option>
      ))}
    </select>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ApartmentBillsPage() {
  const [selectedAptId, setSelectedAptId] = useState(dummyApartments[0].id)
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState<BillStatusEnum | "all">(
    "all"
  )
  const [fromPeriod, setFromPeriod] = useState("")
  const [toPeriod, setToPeriod] = useState("")

  const hasMultiple = dummyApartments.length > 1
  const hasActiveFilter =
    statusFilter !== "all" || fromPeriod !== "" || toPeriod !== ""

  const billCountByApt = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of dummyBills)
      map.set(b.apartmentId, (map.get(b.apartmentId) ?? 0) + 1)
    return map
  }, [])

  const selectedApt = dummyApartments.find((a) => a.id === selectedAptId)!

  // All bills for this apartment, newest first
  const aptBills = useMemo(
    () =>
      dummyBills
        .filter((b) => b.apartmentId === selectedAptId)
        .sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod)),
    [selectedAptId]
  )

  // Periods available in this apartment's bills (ascending, for selects)
  const availablePeriods = useMemo(
    () => [...new Set(aptBills.map((b) => b.billingPeriod))].sort(),
    [aptBills]
  )

  // Filtered subset shown in nav
  const filteredBills = useMemo(() => {
    return aptBills.filter((b) => {
      if (statusFilter !== "all" && b.state !== statusFilter) return false
      if (fromPeriod && b.billingPeriod < fromPeriod) return false
      if (toPeriod && b.billingPeriod > toPeriod) return false
      return true
    })
  }, [aptBills, statusFilter, fromPeriod, toPeriod])

  const effectiveBillId =
    selectedBillId && filteredBills.some((b) => b.id === selectedBillId)
      ? selectedBillId
      : (filteredBills[0]?.id ?? null)

  const selectedBill = filteredBills.find((b) => b.id === effectiveBillId)
  // prevBill always from the full unfiltered list to get correct usage delta
  const selectedBillIndex = aptBills.findIndex((b) => b.id === effectiveBillId)
  const prevBill = aptBills[selectedBillIndex + 1]

  function selectApartment(aptId: string) {
    setSelectedAptId(aptId)
    setSelectedBillId(null)
    setStatusFilter("all")
    setFromPeriod("")
    setToPeriod("")
  }

  function clearFilters() {
    setStatusFilter("all")
    setFromPeriod("")
    setToPeriod("")
    setSelectedBillId(null)
  }

  return (
    <div className="flex h-[calc(100svh-49px)] flex-col overflow-hidden">
      {/* ── Apartment header bar ── */}
      <div className="relative shrink-0 border-b border-border bg-background">
        <div className="flex min-h-[42px] items-center gap-3 px-4 py-2">
          {hasMultiple ? (
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="group -ml-2 flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted"
            >
              <span className="text-sm">🏠</span>
              <span className="text-sm font-semibold text-foreground">
                {selectedApt.title ?? selectedApt.id}
              </span>
              <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                ▾
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm">🏠</span>
              <span className="text-sm font-semibold text-foreground">
                {selectedApt.title ?? selectedApt.id}
              </span>
            </div>
          )}
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {selectedApt.id}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {selectedApt.currency.shortName}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {selectedApt.rentPrice.toLocaleString()}/mo
          </span>
          <div className="ml-auto flex items-center gap-2">
            {aptBills.length > 0 && (
              <span className="text-xs text-muted-foreground/60">
                {aptBills.length} {aptBills.length === 1 ? "bill" : "bills"}
              </span>
            )}
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Create Report
            </Button>
            <Button size="sm" className="h-7 text-xs">
              + New Bill
            </Button>
          </div>
        </div>

        {hasMultiple && pickerOpen && (
          <ApartmentDropdown
            apartments={dummyApartments}
            selectedId={selectedAptId}
            billCountByApt={billCountByApt}
            onSelect={selectApartment}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>

      {/* ── Filter bar (only shown when apartment has bills) ── */}
      {aptBills.length > 0 && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-background px-4 py-2">
          {/* Status pills */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              All
            </button>
            {ALL_STATES.map((state) => (
              <button
                key={state}
                onClick={() =>
                  setStatusFilter(statusFilter === state ? "all" : state)
                }
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  statusFilter === state
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[state]}`}
                />
                {STATUS_LABELS[state]}
              </button>
            ))}
          </div>

          {/* Date range */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">From</span>
            <PeriodSelect
              value={fromPeriod}
              periods={availablePeriods}
              placeholder="earliest"
              onChange={setFromPeriod}
            />
            <span className="text-xs text-muted-foreground">to</span>
            <PeriodSelect
              value={toPeriod}
              periods={availablePeriods}
              placeholder="latest"
              onChange={setToPeriod}
            />
            {hasActiveFilter && (
              <button
                onClick={clearFilters}
                className="ml-1 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>✕</span>
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Bills section ── */}
      <div className="flex min-w-0 flex-1 overflow-hidden">
        {aptBills.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="mb-3 text-4xl">🧾</p>
              <p className="text-sm font-medium">No bills yet</p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                This property has no billing history
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Bill list nav */}
            <nav className="flex w-44 shrink-0 flex-col overflow-hidden border-r border-border">
              <div className="shrink-0 border-b border-border px-3 py-2.5">
                <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
                  Billing History
                </p>
              </div>
              <div
                className="min-h-0 flex-1 overflow-y-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {filteredBills.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-1 px-3 py-8 text-center">
                    <p className="text-xs font-medium text-muted-foreground">
                      No matches
                    </p>
                    <button
                      onClick={clearFilters}
                      className="text-[11px] text-muted-foreground/60 underline underline-offset-2 transition-colors hover:text-foreground"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5 px-2 py-2">
                    {filteredBills.map((bill, i) => {
                      const year = bill.billingPeriod.slice(0, 4)
                      const prevYear =
                        i > 0
                          ? filteredBills[i - 1].billingPeriod.slice(0, 4)
                          : null
                      const showYearSep = prevYear !== null && year !== prevYear
                      const isSelected = bill.id === effectiveBillId
                      return (
                        <div key={bill.id}>
                          {showYearSep && (
                            <div className="flex items-center gap-1.5 px-1 py-1.5">
                              <div className="h-px flex-1 bg-border" />
                              <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                                {year}
                              </span>
                              <div className="h-px flex-1 bg-border" />
                            </div>
                          )}
                          <ContextMenu>
                            <ContextMenuTrigger>
                              <button
                                onClick={() => setSelectedBillId(bill.id)}
                                className={`w-full rounded py-1.5 text-left text-sm transition-all ${
                                  isSelected
                                    ? `pr-1 pl-2 font-medium ${STATUS_SELECTED_CLASS[bill.state]}`
                                    : "px-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[bill.state]}`}
                                  />
                                  {formatShortPeriod(bill.billingPeriod)}
                                </span>
                                <span className="mt-0.5 block pl-3 text-xs opacity-60">
                                  ${bill.total.toFixed(2)}
                                </span>
                              </button>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-44">
                              <ContextMenuItem
                                onClick={() => setSelectedBillId(bill.id)}
                              >
                                View details
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                              <ContextMenuItem>Copy</ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="shrink-0 border-t border-border px-3 py-2">
                <p className="text-center text-[10px] text-muted-foreground/40">
                  {hasActiveFilter
                    ? `${filteredBills.length} of ${aptBills.length} bills`
                    : `${aptBills.length} ${aptBills.length === 1 ? "bill" : "bills"}`}
                </p>
              </div>
            </nav>

            {/* Bill detail */}
            <main className="min-w-0 flex-1 overflow-hidden">
              {selectedBill ? (
                <ScrollArea className="h-full">
                  <div className="px-8 py-8">
                    <BillDetail bill={selectedBill} prevBill={prevBill} />
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Select a bill to view details
                </div>
              )}
            </main>
          </>
        )}
      </div>
    </div>
  )
}
