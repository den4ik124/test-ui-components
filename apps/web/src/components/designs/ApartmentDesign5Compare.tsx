import { useState, useMemo } from "react"
import { dummyApartments } from "../../data/apartmentDummyData"
import { dummyBills } from "../../data/billDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import type { ApartmentResponse } from "../../models/apartment"
import { BillsMasterDetail } from "./billDisplay"

const CURRENCY_SYM: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" }
function sym(apt: ApartmentResponse) {
  return (
    CURRENCY_SYM[apt.currency.shortName ?? ""] ?? apt.currency.shortName ?? ""
  )
}

const METRICS: { key: string; label: string; group: string }[] = [
  { key: "rent", label: "Monthly Rent", group: "Financial" },
  { key: "currency", label: "Currency", group: "Financial" },
  { key: "lease", label: "Lease Period", group: "Terms" },
  { key: "deposit", label: "Security Deposit", group: "Terms" },
  { key: "type", label: "Management", group: "Details" },
  { key: "params", label: "Bill Parameters", group: "Details" },
  { key: "bills", label: "Bills on Record", group: "History" },
  { key: "totalBilled", label: "Total Billed", group: "History" },
]

function getMetricValue(
  apt: ApartmentResponse,
  key: string,
  billCount: number,
  totalBilled: number
): { display: string; variant?: "managed" | "self"; bold?: boolean } {
  switch (key) {
    case "rent":
      return {
        display: `${sym(apt)}${apt.rentPrice.toLocaleString()}`,
        bold: true,
      }
    case "currency":
      return { display: apt.currency.shortName ?? "" }
    case "lease":
      return { display: `${apt.rentalPeriodMonths} months` }
    case "deposit":
      return {
        display: `${apt.depositMonths} month${apt.depositMonths > 1 ? "s" : ""}`,
      }
    case "type":
      return {
        display: apt.isSelfManaged ? "Self-managed" : "Managed",
        variant: apt.isSelfManaged ? "self" : "managed",
      }
    case "params":
      return { display: String(apt.template?.length ?? 0) }
    case "bills":
      return { display: String(billCount) }
    case "totalBilled":
      return {
        display:
          totalBilled > 0
            ? `${sym(apt)}${Math.round(totalBilled).toLocaleString()}`
            : "—",
      }
    default:
      return { display: "—" }
  }
}

const groups = METRICS.reduce<{ label: string; rows: typeof METRICS }[]>(
  (acc, m) => {
    const existing = acc.find((a) => a.label === m.group)
    if (existing) existing.rows.push(m)
    else acc.push({ label: m.group, rows: [m] })
    return acc
  },
  []
)

export function ApartmentDesign5Compare() {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    new Set(
      [dummyApartments[0].id, dummyApartments[1]?.id].filter(
        Boolean
      ) as string[]
    )
  )
  const [billsAptId, setBillsAptId] = useState<string>(dummyApartments[0].id)
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null)

  const billData = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>()
    for (const b of dummyBills) {
      const e = map.get(b.apartmentId) ?? { count: 0, total: 0 }
      map.set(b.apartmentId, { count: e.count + 1, total: e.total + b.total })
    }
    return map
  }, [])

  const checkedApts = dummyApartments.filter((a) => checkedIds.has(a.id))

  const aptBills = useMemo(
    () =>
      dummyBills
        .filter((b) => b.apartmentId === billsAptId)
        .sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod)),
    [billsAptId]
  )

  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size > 1) next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function switchBillsApt(id: string) {
    setBillsAptId(id)
    setSelectedBillId(null)
  }

  return (
    <div className="flex h-[calc(100svh-49px)] overflow-hidden">
      {/* ── Left: picker sidebar ── */}
      <aside className="flex w-48 shrink-0 flex-col overflow-hidden border-r border-border">
        <div className="shrink-0 border-b border-border px-3 py-3">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Compare
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/60">
            {checkedIds.size} selected
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-1">
          {dummyApartments.map((apt) => {
            const isChecked = checkedIds.has(apt.id)
            const bd = billData.get(apt.id) ?? { count: 0, total: 0 }
            return (
              <button
                key={apt.id}
                onClick={() => toggleCheck(apt.id)}
                className={`flex w-full items-start gap-2.5 border-b border-border px-3 py-2.5 text-left transition-colors last:border-0 ${
                  isChecked ? "bg-accent" : "hover:bg-muted/40"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                    isChecked
                      ? "border-foreground bg-foreground"
                      : "border-muted-foreground/40"
                  }`}
                >
                  {isChecked && (
                    <span className="text-[7px] font-bold text-background">
                      ✓
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">
                    {apt.title ?? apt.id}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {apt.id}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {sym(apt)}
                    {apt.rentPrice.toLocaleString()} · {bd.count} bills
                  </p>
                </div>
              </button>
            )
          })}
        </div>
        <div className="shrink-0 border-t border-border px-3 py-2">
          <button
            onClick={() =>
              setCheckedIds(new Set(dummyApartments.map((a) => a.id)))
            }
            className="text-[10px] text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Select all
          </button>
        </div>
      </aside>

      {/* ── Right: compare matrix (top) + bills (bottom) ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Comparison matrix */}
        <div className="h-[42%] shrink-0 overflow-hidden border-b border-border">
          <ScrollArea className="h-full">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-32 border-r border-border px-4 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Metric
                  </th>
                  {checkedApts.map((apt) => (
                    <th key={apt.id} className="px-4 py-3 text-left">
                      <p className="truncate text-sm font-bold text-foreground">
                        {apt.title ?? apt.id}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {apt.id}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map(({ label: groupLabel, rows }) => (
                  <>
                    <tr
                      key={`g-${groupLabel}`}
                      className="border-b border-border bg-muted/50"
                    >
                      <td
                        colSpan={checkedApts.length + 1}
                        className="px-4 py-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase"
                      >
                        {groupLabel}
                      </td>
                    </tr>
                    {rows.map((metric, i) => (
                      <tr
                        key={metric.key}
                        className={`border-b border-border ${i % 2 === 0 ? "bg-background" : "bg-muted/10"}`}
                      >
                        <td className="border-r border-border px-4 py-2.5 text-xs font-medium text-muted-foreground">
                          {metric.label}
                        </td>
                        {checkedApts.map((apt) => {
                          const bd = billData.get(apt.id) ?? {
                            count: 0,
                            total: 0,
                          }
                          const cell = getMetricValue(
                            apt,
                            metric.key,
                            bd.count,
                            bd.total
                          )
                          return (
                            <td key={apt.id} className="px-4 py-2.5 text-sm">
                              {cell.variant ? (
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${
                                    cell.variant === "self"
                                      ? "border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
                                      : "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                  }`}
                                >
                                  {cell.display}
                                </Badge>
                              ) : cell.bold ? (
                                <span className="font-bold text-foreground">
                                  {cell.display}
                                </span>
                              ) : (
                                <span className="text-foreground">
                                  {cell.display}
                                </span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>

        {/* Bills section */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Apt tabs for bills */}
          <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-3 py-1.5">
            <span className="mr-1 shrink-0 text-[10px] text-muted-foreground">
              Bills for:
            </span>
            {checkedApts.map((apt) => (
              <button
                key={apt.id}
                onClick={() => switchBillsApt(apt.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  billsAptId === apt.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {apt.title ?? apt.id}
              </button>
            ))}
            <span className="ml-auto shrink-0 text-[10px] text-muted-foreground/50">
              {aptBills.length} {aptBills.length === 1 ? "bill" : "bills"}
            </span>
          </div>

          <BillsMasterDetail
            bills={aptBills}
            selectedBillId={selectedBillId}
            onSelectBill={setSelectedBillId}
          />
        </div>
      </div>
    </div>
  )
}
