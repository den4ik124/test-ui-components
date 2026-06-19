import { useState } from "react"
import type { BillData } from "../../models/BillData"
import { BillStatusEnum } from "../../models/BillStatusEnum"
import { dummyBills } from "../../data/billDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import {
  formatPeriod,
  formatDate,
  calcUsage,
  calcAmount,
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
} from "./shared"

const sortedBills = [...dummyBills].sort((a, b) =>
  b.billingPeriod.localeCompare(a.billingPeriod)
)

const billsByPeriod = new Map(dummyBills.map((b) => [b.billingPeriod, b]))

const years = [
  ...new Set(dummyBills.map((b) => b.billingPeriod.split("-")[0])),
].sort((a, b) => b.localeCompare(a))

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const CELL_BG: Record<BillStatusEnum, string> = {
  [BillStatusEnum.Created]:
    "bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800",
  [BillStatusEnum.Paid]:
    "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800",
  [BillStatusEnum.Confirmed]:
    "bg-violet-50 border-violet-200 hover:bg-violet-100 dark:bg-violet-900/20 dark:border-violet-800",
  [BillStatusEnum.Outdated]:
    "bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-800/50 dark:border-gray-700",
}

function BillDetail({ bill }: { bill: BillData }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground">
              {formatPeriod(bill.billingPeriod)}
            </h3>
            <Badge variant="outline" className={STATUS_BADGE_CLASS[bill.state]}>
              {STATUS_LABELS[bill.state]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {bill.publicId} · Apt {bill.apartmentId} · Issued{" "}
            {formatDate(bill.dateCreated)}
          </p>
        </div>
        <p className="text-3xl font-bold tabular-nums">
          ${bill.total.toFixed(2)}
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {bill.parameters.map((p) => (
          <div
            key={p.index}
            className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3"
          >
            <div className="flex items-start justify-between gap-1">
              <p className="text-xs leading-tight font-medium text-foreground">
                {p.title}
              </p>
              {p.isUncertain && (
                <span className="shrink-0 text-[10px] text-amber-500">*</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {calcUsage(p).toLocaleString()} units
            </p>
            <p className="mt-auto text-sm font-semibold tabular-nums">
              ${calcAmount(p).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {bill.state === BillStatusEnum.Created && (
        <>
          <Separator />
          <div className="flex justify-end gap-2">
            <Button variant="outline">Download PDF</Button>
            <Button>Pay ${bill.total.toFixed(2)}</Button>
          </div>
        </>
      )}
    </div>
  )
}

export function Design5Calendar() {
  const [selectedPeriod, setSelectedPeriod] = useState(
    sortedBills[0].billingPeriod
  )

  const selected = billsByPeriod.get(selectedPeriod) ?? null

  return (
    <div className="min-h-[calc(100vh-48px)] bg-background">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Billing Calendar
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Click a month to view its invoice
          </p>
        </div>

        {/* Year grids */}
        <div className="mb-6 flex flex-col gap-6">
          {years.map((year) => (
            <div key={year}>
              <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {year}
              </h2>
              <div className="grid grid-cols-6 gap-2 md:grid-cols-12">
                {MONTHS.map((month, idx) => {
                  const monthNum = String(idx + 1).padStart(2, "0")
                  const period = `${year}-${monthNum}`
                  const bill = billsByPeriod.get(period)
                  const isSelected = selectedPeriod === period

                  if (!bill) {
                    return (
                      <div
                        key={month}
                        className="flex flex-col items-center rounded-lg border border-dashed border-border p-2 opacity-25 select-none"
                      >
                        <span className="text-xs text-muted-foreground">
                          {month}
                        </span>
                      </div>
                    )
                  }

                  return (
                    <button
                      key={month}
                      onClick={() => setSelectedPeriod(period)}
                      className={`flex flex-col items-center rounded-lg border p-2 transition-all ${
                        CELL_BG[bill.state]
                      } ${
                        isSelected
                          ? "ring-2 ring-foreground ring-offset-1 ring-offset-background"
                          : ""
                      }`}
                    >
                      <span className="text-xs font-medium">{month}</span>
                      <div
                        className={`mt-1 h-1.5 w-1.5 rounded-full ${
                          STATUS_DOT_CLASS[bill.state]
                        }`}
                      />
                      <span className="mt-0.5 text-[10px] text-muted-foreground tabular-nums">
                        ${Math.round(bill.total)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {(
            [
              BillStatusEnum.Created,
              BillStatusEnum.Confirmed,
              BillStatusEnum.Paid,
              BillStatusEnum.Outdated,
            ] as BillStatusEnum[]
          ).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${STATUS_DOT_CLASS[s]}`} />
              <span className="text-xs text-muted-foreground">
                {STATUS_LABELS[s]}
              </span>
            </div>
          ))}
        </div>

        <Separator className="mb-6" />

        {selected && <BillDetail bill={selected} />}
      </div>
    </div>
  )
}
