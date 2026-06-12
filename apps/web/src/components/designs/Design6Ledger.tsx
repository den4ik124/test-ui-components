import { dummyBills } from "../../data/billDummyData";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  formatPeriod, formatDate, calcAmount,
  STATUS_LABELS, STATUS_BADGE_CLASS,
} from "./shared";

const sortedBills = [...dummyBills].sort((a, b) =>
  b.billingPeriod.localeCompare(a.billingPeriod)
);

const grandTotal = sortedBills.reduce((s, b) => s + b.total, 0);
const totalLineItems = sortedBills.reduce((s, b) => s + b.parameters.length, 0);

export function Design6Ledger() {
  return (
    <div className="h-[calc(100vh-48px)] bg-background">
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto px-8 py-10 font-mono text-sm">
          {/* Document header */}
          <div className="mb-8 pb-6 border-b-2 border-foreground">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans">
              Utility Statement
            </p>
            <h1 className="text-3xl font-bold mt-1 font-sans">
              Apartment {sortedBills[0].apartmentId}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-sans">
              {formatPeriod(sortedBills[sortedBills.length - 1].billingPeriod)} —{" "}
              {formatPeriod(sortedBills[0].billingPeriod)}
            </p>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-x-4 text-[10px] uppercase tracking-widest text-muted-foreground pb-2 border-b border-border">
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
              <div className="flex items-center justify-between py-2 px-3 bg-muted/60 rounded mb-1 gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold font-sans text-sm">
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
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-x-4 text-xs py-1.5 border-b border-border/40 last:border-0 items-baseline"
                >
                  <span className="flex items-center gap-1.5">
                    <span>{p.title}</span>
                    {p.isUncertain && (
                      <span className="text-amber-500 text-[10px]">*</span>
                    )}
                  </span>
                  <span className="text-right tabular-nums text-muted-foreground">
                    {p.previousValue.toLocaleString()}
                  </span>
                  <span className="text-right tabular-nums text-muted-foreground">
                    {p.value.toLocaleString()}
                  </span>
                  <span className="text-right tabular-nums text-muted-foreground">
                    ${p.price.toFixed(4)}
                  </span>
                  <span className="text-right tabular-nums">
                    ${calcAmount(p).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Subtotal */}
              <div className="flex justify-end items-center gap-8 text-xs py-2 border-t border-foreground/20 mt-1">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  Subtotal
                </span>
                <span className="font-bold tabular-nums min-w-[72px] text-right">
                  ${bill.total.toFixed(2)}
                </span>
              </div>
            </div>
          ))}

          {/* Grand total */}
          <div className="mt-10 pt-4 border-t-2 border-foreground">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans">
                  Grand Total
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-sans">
                  {sortedBills.length} billing periods · {totalLineItems} line items
                </p>
                <p className="text-[10px] text-amber-500 mt-1">
                  * estimated readings
                </p>
              </div>
              <p className="text-4xl font-bold tabular-nums font-sans">
                ${grandTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
