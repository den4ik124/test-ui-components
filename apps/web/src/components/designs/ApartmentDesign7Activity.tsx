import { useState, useMemo } from "react"
import { dummyApartments } from "../../data/apartmentDummyData"
import { dummyBills } from "../../data/billDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"
import type { ApartmentResponse } from "../../models/apartment"
import type { BillData } from "../../models/BillData"
import { BillStatusEnum } from "../../models/BillStatusEnum"
import { formatShortPeriod, STATUS_DOT_CLASS, STATUS_LABELS } from "./shared"
import { BillDetail } from "./billDisplay"

const CURRENCY_SYM: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" }
function sym(apt: ApartmentResponse) {
  return (
    CURRENCY_SYM[apt.currency.shortName ?? ""] ?? apt.currency.shortName ?? ""
  )
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function ApartmentDesign7Activity() {
  const [selectedBill, setSelectedBill] = useState<BillData | null>(null)

  const aptBillsMap = useMemo(() => {
    const map = new Map<string, BillData[]>()
    for (const apt of dummyApartments) map.set(apt.id, [])
    for (const b of dummyBills) {
      const list = map.get(b.apartmentId)
      if (list) list.push(b)
    }
    for (const list of map.values()) {
      list.sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod))
    }
    return map
  }, [])

  // const allBillsMap = useMemo(() => {
  //   const map = new Map<string, BillData>()
  //   for (const b of dummyBills) map.set(b.id, b)
  //   return map
  // }, [])

  const aptBillsByApt = useMemo(() => {
    const map = new Map<string, BillData[]>()
    for (const [aptId, bills] of aptBillsMap) {
      map.set(
        aptId,
        [...bills].sort((a, b) =>
          b.billingPeriod.localeCompare(a.billingPeriod)
        )
      )
    }
    return map
  }, [aptBillsMap])

  const stats = useMemo(() => {
    const unpaid = dummyBills.filter((b) => b.state === BillStatusEnum.Created)
    const paid = dummyBills.filter(
      (b) =>
        b.state === BillStatusEnum.Paid || b.state === BillStatusEnum.Confirmed
    )
    return { unpaidCount: unpaid.length, paidCount: paid.length }
  }, [])

  const maxRent = Math.max(...dummyApartments.map((a) => a.rentPrice))

  // prevBill for selected bill (for usage delta in BillDetail)
  const prevBill = useMemo(() => {
    if (!selectedBill) return undefined
    const bills = aptBillsByApt.get(selectedBill.apartmentId) ?? []
    const idx = bills.findIndex((b) => b.id === selectedBill.id)
    return bills[idx + 1]
  }, [selectedBill, aptBillsByApt])

  function openBill(bill: BillData) {
    setSelectedBill((prev) => (prev?.id === bill.id ? null : bill))
  }

  const panelOpen = selectedBill !== null

  return (
    <div className="flex h-[calc(100svh-49px)] overflow-hidden">
      {/* ── Activity feed ── */}
      <div
        className={`flex flex-col overflow-hidden transition-all duration-200 ${panelOpen ? "w-[45%]" : "w-full"} border-r border-border`}
      >
        {/* Portfolio summary */}
        <div className="flex shrink-0 items-center gap-0 border-b border-border bg-muted/20">
          {[
            {
              label: "Properties",
              value: String(dummyApartments.length),
              sub: `${dummyApartments.filter((a) => !a.isSelfManaged).length} managed`,
            },
            {
              label: "Total Bills",
              value: String(dummyBills.length),
              sub: `${stats.paidCount} paid`,
            },
            {
              label: "Unpaid",
              value: String(stats.unpaidCount),
              sub: stats.unpaidCount > 0 ? "action needed" : "all clear",
            },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`flex-1 px-4 py-3 text-center ${i < 2 ? "border-r border-border" : ""}`}
            >
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="text-[10px] text-muted-foreground/50">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Apartment cards */}
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 p-4">
            {dummyApartments.map((apt) => {
              const bills = aptBillsByApt.get(apt.id) ?? []
              const recent = bills.slice(0, panelOpen ? 3 : 5)
              const unpaid = bills.filter(
                (b) => b.state === BillStatusEnum.Created
              )
              const totalBilled = bills.reduce((s, b) => s + b.total, 0)

              return (
                <div
                  key={apt.id}
                  className="overflow-hidden rounded-xl border border-border bg-background shadow-sm"
                >
                  {/* Card header */}
                  <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-lg">
                      🏠
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-sm font-bold text-foreground">
                          {apt.title ?? apt.id}
                        </h3>
                        <span className="rounded bg-muted px-1 font-mono text-[10px] text-muted-foreground">
                          {apt.id}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${apt.isSelfManaged ? "border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300" : "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"}`}
                        >
                          {apt.isSelfManaged ? "Self" : "Managed"}
                        </Badge>
                        {unpaid.length > 0 && (
                          <Badge
                            variant="outline"
                            className="border-amber-200 bg-amber-50 text-[10px] text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                          >
                            {unpaid.length} unpaid
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold text-foreground tabular-nums">
                        {sym(apt)}
                        {apt.rentPrice.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {apt.currency.shortName}/mo
                      </p>
                    </div>
                  </div>

                  {bills.length === 0 ? (
                    <div className="px-4 py-5 text-center text-xs text-muted-foreground/50">
                      No billing history
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto]">
                      {/* Recent bills (clickable) */}
                      <div className="p-4">
                        <p className="mb-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                          Recent Bills
                        </p>
                        <div className="flex flex-col gap-1">
                          {recent.map((b) => {
                            const isActive = selectedBill?.id === b.id
                            return (
                              <button
                                key={b.id}
                                onClick={() => openBill(b)}
                                className={`flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors ${isActive ? "bg-accent" : "hover:bg-muted/50"}`}
                              >
                                <span
                                  className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT_CLASS[b.state]}`}
                                />
                                <span className="w-16 shrink-0 text-sm font-medium text-foreground">
                                  {formatShortPeriod(b.billingPeriod)}
                                </span>
                                <span className="flex-1 text-xs text-muted-foreground">
                                  {STATUS_LABELS[b.state]}
                                </span>
                                <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                                  {sym(apt)}
                                  {b.total.toFixed(2)}
                                </span>
                                <span className="text-[10px] text-muted-foreground/50">
                                  →
                                </span>
                              </button>
                            )
                          })}
                          {bills.length > recent.length && (
                            <p className="mt-0.5 pl-2 text-[10px] text-muted-foreground/40">
                              +{bills.length - recent.length} more bills
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right stats */}
                      {!panelOpen && (
                        <>
                          <Separator
                            orientation="vertical"
                            className="hidden sm:block"
                          />
                          <div className="border-t border-border p-4 sm:w-40 sm:border-t-0">
                            <p className="mb-2.5 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                              Summary
                            </p>
                            <div className="flex flex-col gap-2">
                              {[
                                { label: "Total bills", value: bills.length },
                                {
                                  label: "Total billed",
                                  value: `${sym(apt)}${Math.round(totalBilled).toLocaleString()}`,
                                },
                                {
                                  label: "Avg bill",
                                  value: `${sym(apt)}${(totalBilled / bills.length).toFixed(0)}`,
                                },
                              ].map((s) => (
                                <div
                                  key={s.label}
                                  className="flex items-center justify-between gap-2"
                                >
                                  <span className="text-[10px] text-muted-foreground">
                                    {s.label}
                                  </span>
                                  <span className="text-xs font-semibold text-foreground tabular-nums">
                                    {s.value}
                                  </span>
                                </div>
                              ))}
                              <div className="pt-1">
                                <p className="mb-1 text-[10px] text-muted-foreground">
                                  Rent rank
                                </p>
                                <MiniBar value={apt.rentPrice} max={maxRent} />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* ── Bill detail panel ── */}
      {panelOpen && selectedBill && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Invoice {selectedBill.publicId}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {formatShortPeriod(selectedBill.billingPeriod)} · Apt{" "}
                {selectedBill.apartmentId}
              </p>
            </div>
            <button
              onClick={() => setSelectedBill(null)}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <ScrollArea className="h-full">
            <div className="px-8 py-8">
              <BillDetail bill={selectedBill} prevBill={prevBill} />
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
