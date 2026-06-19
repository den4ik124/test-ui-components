import { useState, useMemo } from "react"
import { dummyApartments } from "../../data/apartmentDummyData"
import { dummyBills } from "../../data/billDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"
import type { ApartmentResponse } from "../../models/apartment"
import { BillsMasterDetail } from "./billDisplay"

const CURRENCY_SYM: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" }
function sym(apt: ApartmentResponse) {
  return (
    CURRENCY_SYM[apt.currency.shortName ?? ""] ?? apt.currency.shortName ?? ""
  )
}

function AptCard({
  apt,
  billCount,
  totalBilled,
  selected,
  onClick,
}: {
  apt: ApartmentResponse
  billCount: number
  totalBilled: number
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full flex-col gap-3 rounded-xl border p-4 text-left shadow-sm transition-all hover:shadow-md ${
        selected
          ? "border-foreground/30 bg-accent ring-1 ring-foreground/10"
          : "border-border bg-background hover:border-border/80"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="mb-0.5 flex items-center gap-2">
            <span className="text-base">🏠</span>
            <h3 className="truncate text-sm leading-tight font-semibold text-foreground">
              {apt.title ?? apt.id}
            </h3>
          </div>
          <p className="ml-7 font-mono text-[10px] text-muted-foreground">
            {apt.id}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-foreground tabular-nums">
            {sym(apt)}
            {apt.rentPrice.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">/ mo</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className="rounded-md bg-muted/40 px-1.5 py-1.5">
          <p className="text-xs font-bold text-foreground">
            {apt.rentalPeriodMonths}
          </p>
          <p className="text-[9px] text-muted-foreground">mo lease</p>
        </div>
        <div className="rounded-md bg-muted/40 px-1.5 py-1.5">
          <p className="text-xs font-bold text-foreground">
            {apt.depositMonths}
          </p>
          <p className="text-[9px] text-muted-foreground">deposit</p>
        </div>
        <div className="rounded-md bg-muted/40 px-1.5 py-1.5">
          <p className="text-xs font-bold text-foreground">{billCount}</p>
          <p className="text-[9px] text-muted-foreground">bills</p>
        </div>
      </div>

      {totalBilled > 0 && (
        <p className="text-[10px] text-muted-foreground">
          {sym(apt)}
          {Math.round(totalBilled).toLocaleString()} billed total
        </p>
      )}
    </button>
  )
}

export function ApartmentDesign4Board() {
  const [selectedAptId, setSelectedAptId] = useState<string>(
    dummyApartments[0].id
  )
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null)

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
        .filter((b) => b.apartmentId === selectedAptId)
        .sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod)),
    [selectedAptId]
  )

  function selectApt(id: string) {
    setSelectedAptId(id)
    setSelectedBillId(null)
  }

  const managed = dummyApartments.filter((a) => !a.isSelfManaged)
  const selfManaged = dummyApartments.filter((a) => a.isSelfManaged)

  const totalUSD = dummyApartments
    .filter((a) => a.currency.shortName === "USD")
    .reduce((s, a) => s + a.rentPrice, 0)
  const totalEUR = dummyApartments
    .filter((a) => a.currency.shortName === "EUR")
    .reduce((s, a) => s + a.rentPrice, 0)

  const selectedApt = dummyApartments.find((a) => a.id === selectedAptId)!

  const columns = [
    { label: "Managed", apts: managed, dot: "bg-blue-500" },
    { label: "Self-managed", apts: selfManaged, dot: "bg-orange-500" },
  ]

  return (
    <div className="flex h-[calc(100svh-49px)] flex-col overflow-hidden">
      {/* Stats header */}
      <div className="flex shrink-0 flex-wrap items-center gap-4 border-b border-border bg-muted/20 px-6 py-2.5">
        <span className="text-sm font-semibold text-foreground">
          {dummyApartments.length} properties
        </span>
        <Separator orientation="vertical" className="h-4" />
        {totalUSD > 0 && (
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              ${totalUSD.toLocaleString()}
            </span>{" "}
            USD/mo
          </span>
        )}
        {totalEUR > 0 && (
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              €{totalEUR.toLocaleString()}
            </span>{" "}
            EUR/mo
          </span>
        )}
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {dummyBills.length}
          </span>{" "}
          total bills
        </span>
        <div className="ml-auto flex gap-2">
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-[10px] text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
          >
            {managed.length} Managed
          </Badge>
          <Badge
            variant="outline"
            className="border-orange-200 bg-orange-50 text-[10px] text-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
          >
            {selfManaged.length} Self
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 overflow-hidden">
        {/* Board columns */}
        <div className="flex w-[400px] shrink-0 overflow-hidden border-r border-border">
          {columns.map((col, ci) => (
            <div
              key={col.label}
              className={`flex flex-1 flex-col overflow-hidden ${ci < columns.length - 1 ? "border-r border-border" : ""}`}
            >
              <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2.5">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <span className="text-xs font-semibold text-foreground">
                  {col.label}
                </span>
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  {col.apts.length}
                </span>
              </div>
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-2.5 p-3">
                  {col.apts.map((apt) => {
                    const bd = billData.get(apt.id) ?? { count: 0, total: 0 }
                    return (
                      <AptCard
                        key={apt.id}
                        apt={apt}
                        billCount={bd.count}
                        totalBilled={bd.total}
                        selected={apt.id === selectedAptId}
                        onClick={() => selectApt(apt.id)}
                      />
                    )
                  })}
                  {col.apts.length === 0 && (
                    <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border py-12">
                      <p className="text-xs text-muted-foreground/50">Empty</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>

        {/* Bills section */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Selected apt strip */}
          <div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted/10 px-4 py-2">
            <span className="text-sm">🏠</span>
            <span className="text-sm font-semibold text-foreground">
              {selectedApt.title ?? selectedApt.id}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {selectedApt.id}
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {selectedApt.currency.shortName} · {aptBills.length} bills
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
