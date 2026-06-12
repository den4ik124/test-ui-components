import { useState } from "react";
import { BillStatusEnum } from "../../BillStatusEnum";
import { dummyBills } from "../../data/billDummyData";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import {
  formatPeriod, formatDate, calcUsage, calcAmount,
  STATUS_LABELS, STATUS_BADGE_CLASS, STATUS_DOT_CLASS,
} from "./shared";

const sortedBills = [...dummyBills].sort((a, b) =>
  b.billingPeriod.localeCompare(a.billingPeriod)
);

export function Design9Stepper() {
  const [index, setIndex] = useState(0);
  const bill = sortedBills[index];

  return (
    <div className="h-[calc(100vh-48px)] bg-background flex flex-col overflow-hidden">
      {/* Progress dots */}
      <div className="border-b border-border px-6 py-2 flex items-center gap-1.5 justify-center overflow-x-auto shrink-0">
        {sortedBills.map((b, i) => (
          <button
            key={b.id}
            onClick={() => setIndex(i)}
            className={`rounded-full transition-all shrink-0 ${
              i === index
                ? `w-5 h-2 ${STATUS_DOT_CLASS[b.state]}`
                : `w-2 h-2 ${STATUS_DOT_CLASS[b.state]} opacity-25 hover:opacity-50`
            }`}
          />
        ))}
      </div>

      {/* Bill content */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="outline" className={STATUS_BADGE_CLASS[bill.state]}>
                {STATUS_LABELS[bill.state]}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {bill.publicId}
              </span>
              <span className="text-xs text-muted-foreground">
                Apt {bill.apartmentId}
              </span>
            </div>
            <h2 className="text-5xl font-thin text-foreground tracking-tight mb-3">
              {formatPeriod(bill.billingPeriod)}
            </h2>
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-light tabular-nums">
                ${bill.total.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">
                issued {formatDate(bill.dateCreated)}
              </span>
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Parameters */}
          <div className="flex flex-col">
            {bill.parameters.map((p, i) => (
              <div key={p.index}>
                <div className="flex items-start gap-4 py-4">
                  <div
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${STATUS_DOT_CLASS[bill.state]} opacity-50`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-medium text-foreground">{p.title}</span>
                      {p.isUncertain && (
                        <span className="text-[10px] bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 px-1.5 py-0.5 rounded">
                          estimated
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.previousValue.toLocaleString()} →{" "}
                      {p.value.toLocaleString()} &middot;{" "}
                      {calcUsage(p).toLocaleString()} units @{" "}
                      ${p.price.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-right font-semibold tabular-nums shrink-0">
                    ${calcAmount(p).toFixed(2)}
                  </span>
                </div>
                {i < bill.parameters.length - 1 && <Separator />}
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="flex items-baseline justify-between mb-10">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-3xl font-light tabular-nums">
              ${bill.total.toFixed(2)}
            </span>
          </div>

          {bill.state === BillStatusEnum.Created && (
            <div className="flex gap-3 mb-10">
              <Button variant="outline" className="flex-1">
                Download PDF
              </Button>
              <Button className="flex-1">Pay ${bill.total.toFixed(2)}</Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom navigation */}
      <div className="border-t border-border bg-background px-6 py-3 flex items-center justify-between shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIndex(index - 1)}
          disabled={index === 0}
        >
          ← Newer
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium tabular-nums">
            {index + 1}{" "}
            <span className="text-muted-foreground text-xs">of</span>{" "}
            {sortedBills.length}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {formatPeriod(bill.billingPeriod)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIndex(index + 1)}
          disabled={index >= sortedBills.length - 1}
        >
          Older →
        </Button>
      </div>
    </div>
  );
}
