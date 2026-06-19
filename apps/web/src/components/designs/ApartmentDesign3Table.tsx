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

type SortKey = "title" | "rent" | "lease" | "deposit"

const COLS: { key: SortKey; label: string }[] = [
  { key: "title", label: "Property" },
  { key: "rent", label: "Rent / mo" },
  { key: "lease", label: "Lease" },
  { key: "deposit", label: "Deposit" },
]

export function ApartmentDesign3Table() {
  const [selectedAptId, setSelectedAptId] = useState<string>(
    dummyApartments[0].id
  )
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>("rent")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const billData = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>()
    for (const b of dummyBills) {
      const e = map.get(b.apartmentId) ?? { count: 0, total: 0 }
      map.set(b.apartmentId, { count: e.count + 1, total: e.total + b.total })
    }
    return map
  }, [])

  const sorted = useMemo(() => {
    return [...dummyApartments].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "title":
          cmp = (a.title ?? a.id).localeCompare(b.title ?? b.id)
          break
        case "rent":
          cmp = a.rentPrice - b.rentPrice
          break
        case "lease":
          cmp = a.rentalPeriodMonths - b.rentalPeriodMonths
          break
        case "deposit":
          cmp = a.depositMonths - b.depositMonths
          break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [sortKey, sortDir])

  const aptBills = useMemo(
    () =>
      dummyBills
        .filter((b) => b.apartmentId === selectedAptId)
        .sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod)),
    [selectedAptId]
  )

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  function selectApt(id: string) {
    setSelectedAptId(id)
    setSelectedBillId(null)
  }

  const totalUSD = dummyApartments
    .filter((a) => a.currency.shortName === "USD")
    .reduce((s, a) => s + a.rentPrice, 0)
  const totalEUR = dummyApartments
    .filter((a) => a.currency.shortName === "EUR")
    .reduce((s, a) => s + a.rentPrice, 0)

  const selectedApt = dummyApartments.find((a) => a.id === selectedAptId)!

  return (
    <div className="flex h-[calc(100svh-49px)] overflow-hidden">
      {/* ── Apartment table ── */}
      <div className="flex w-[36%] shrink-0 flex-col overflow-hidden border-r border-border">
        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-8 px-3 py-3" />
                  {COLS.map((col) => (
                    <th key={col.key} className="py-3 pr-3 text-left">
                      <button
                        onClick={() => toggleSort(col.key)}
                        className="flex items-center gap-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase hover:text-foreground"
                      >
                        {col.label}
                        <span
                          className={
                            sortKey === col.key
                              ? "text-foreground"
                              : "opacity-0"
                          }
                        >
                          {sortDir === "asc" ? "↑" : "↓"}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th className="py-3 pr-3 text-left text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((apt) => {
                  const bd = billData.get(apt.id) ?? { count: 0, total: 0 }
                  const isSelected = apt.id === selectedAptId
                  return (
                    <tr
                      key={apt.id}
                      onClick={() => selectApt(apt.id)}
                      className={`cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-accent ${isSelected ? "bg-accent" : ""}`}
                    >
                      <td className="py-3 pl-3">
                        <span className="text-sm">🏠</span>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {apt.title ?? apt.id}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {apt.id} · {bd.count} bills
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="text-sm font-bold text-foreground tabular-nums">
                          {sym(apt)}
                          {apt.rentPrice.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {apt.currency.shortName}
                        </p>
                      </td>
                      <td className="py-3 pr-3 text-sm text-foreground">
                        {apt.rentalPeriodMonths} mo
                      </td>
                      <td className="py-3 pr-3 text-sm text-foreground">
                        {apt.depositMonths} mo
                      </td>
                      <td className="py-3 pr-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            apt.isSelfManaged
                              ? "border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
                              : "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                          }`}
                        >
                          {apt.isSelfManaged ? "Self" : "Mgd"}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </ScrollArea>
        </div>

        {/* Table footer */}
        <div className="flex shrink-0 items-center gap-4 border-t border-border bg-muted/20 px-3 py-2 text-[10px] text-muted-foreground">
          <span>{dummyApartments.length} properties</span>
          {totalUSD > 0 && <span>${totalUSD.toLocaleString()}/mo</span>}
          {totalEUR > 0 && <span>€{totalEUR.toLocaleString()}/mo</span>}
        </div>
      </div>

      {/* ── Bills section: nav + detail ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Selected apt header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted/10 px-4 py-2">
          <span className="text-sm">🏠</span>
          <span className="text-sm font-semibold text-foreground">
            {selectedApt.title ?? selectedApt.id}
          </span>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {selectedApt.id}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {selectedApt.currency.shortName}{" "}
            {selectedApt.rentPrice.toLocaleString()}/mo
          </span>
        </div>

        <BillsMasterDetail
          bills={aptBills}
          selectedBillId={selectedBillId}
          onSelectBill={setSelectedBillId}
        />
      </div>
    </div>
  )
}
