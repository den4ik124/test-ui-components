import { dummyBills } from "../../data/billDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  formatPeriod,
  formatDate,
  calcAmount,
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
} from "./shared"

const sortedBills = [...dummyBills].sort((a, b) =>
  b.billingPeriod.localeCompare(a.billingPeriod)
)

const grandTotal = sortedBills.reduce((s, b) => s + b.total, 0)
const totalLineItems = sortedBills.reduce((s, b) => s + b.parameters.length, 0)

export function Design6Ledger() {
  return (
    <div className="h-[calc(100vh-48px)] bg-background">
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-4xl px-8 py-10 font-mono text-sm">
          {/* Document header */}
          <div className="mb-8 border-b-2 border-foreground pb-6">
            <p className="font-sans text-[10px] tracking-widest text-muted-foreground uppercase">
              Utility Statement
            </p>
            <h1 className="mt-1 font-sans text-3xl font-bold">
              Apartment {sortedBills[0].apartmentId}
            </h1>
            <p className="mt-1 font-sans text-sm text-muted-foreground">
              {formatPeriod(sortedBills[sortedBills.length - 1].billingPeriod)}{" "}
              — {formatPeriod(sortedBills[0].billingPeriod)}
            </p>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-x-4 border-b border-border pb-2 text-[10px] tracking-widest text-muted-foreground uppercase">
            <span>Description</span>
            <span className="text-right">Previous</span>
            <span className="text-right">Current</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Amount</span>
          </div>

          {/* Bills */}
          {sortedBills.map((bill) => (
            <div key={bill.id} className="mt-6">
              {/* Bill header */}
              <div className="mb-1 flex flex-wrap items-center justify-between gap-3 rounded bg-muted/60 px-3 py-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-sans text-sm font-bold">
                    {formatPeriod(bill.billingPeriod)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {bill.publicId}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(bill.dateCreated)}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`${STATUS_BADGE_CLASS[bill.state]} font-sans text-[10px]`}
                >
                  {STATUS_LABELS[bill.state]}
                </Badge>
              </div>

              {/* Parameters */}
              {bill.parameters.map((p) => (
                <div
                  key={p.index}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-baseline gap-x-4 border-b border-border/40 py-1.5 text-xs last:border-0"
                >
                  <span className="flex items-center gap-1.5">
                    <span>{p.title}</span>
                    {p.isUncertain && (
                      <span className="text-[10px] text-amber-500">*</span>
                    )}
                  </span>
                  <span className="text-right text-muted-foreground tabular-nums">
                    {p.previousValue.toLocaleString()}
                  </span>
                  <span className="text-right text-muted-foreground tabular-nums">
                    {p.value.toLocaleString()}
                  </span>
                  <span className="text-right text-muted-foreground tabular-nums">
                    ${p.price.toFixed(4)}
                  </span>
                  <span className="text-right tabular-nums">
                    ${calcAmount(p).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Subtotal */}
              <div className="mt-1 flex items-center justify-end gap-8 border-t border-foreground/20 py-2 text-xs">
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  Subtotal
                </span>
                <span className="min-w-[72px] text-right font-bold tabular-nums">
                  ${bill.total.toFixed(2)}
                </span>
              </div>
            </div>
          ))}

          {/* Grand total */}
          <div className="mt-10 border-t-2 border-foreground pt-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-sans text-[10px] tracking-widest text-muted-foreground uppercase">
                  Grand Total
                </p>
                <p className="mt-1 font-sans text-xs text-muted-foreground">
                  {sortedBills.length} billing periods · {totalLineItems} line
                  items
                </p>
                <p className="mt-1 text-[10px] text-amber-500">
                  * estimated readings
                </p>
              </div>
              <p className="font-sans text-4xl font-bold tabular-nums">
                ${grandTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
