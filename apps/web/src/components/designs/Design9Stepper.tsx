import { useState } from "react"
import { BillStatusEnum } from "../../models/BillStatusEnum"
import { dummyBills } from "../../data/billDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
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

export function Design9Stepper() {
  const [index, setIndex] = useState(0)
  const bill = sortedBills[index]

  return (
    <div className="flex h-[calc(100vh-48px)] flex-col overflow-hidden bg-background">
      {/* Progress dots */}
      <div className="flex shrink-0 items-center justify-center gap-1.5 overflow-x-auto border-b border-border px-6 py-2">
        {sortedBills.map((b, i) => (
          <button
            key={b.id}
            onClick={() => setIndex(i)}
            className={`shrink-0 rounded-full transition-all ${
              i === index
                ? `h-2 w-5 ${STATUS_DOT_CLASS[b.state]}`
                : `h-2 w-2 ${STATUS_DOT_CLASS[b.state]} opacity-25 hover:opacity-50`
            }`}
          />
        ))}
      </div>

      {/* Bill content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl px-8 py-10">
          {/* Header */}
          <div className="mb-10">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={STATUS_BADGE_CLASS[bill.state]}
              >
                {STATUS_LABELS[bill.state]}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {bill.publicId}
              </span>
              <span className="text-xs text-muted-foreground">
                Apt {bill.apartmentId}
              </span>
            </div>
            <h2 className="mb-3 text-5xl font-thin tracking-tight text-foreground">
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
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT_CLASS[bill.state]} opacity-50`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">
                        {p.title}
                      </span>
                      {p.isUncertain && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                          estimated
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.previousValue.toLocaleString()} →{" "}
                      {p.value.toLocaleString()} &middot;{" "}
                      {calcUsage(p).toLocaleString()} units @ $
                      {p.price.toFixed(2)}
                    </p>
                  </div>
                  <span className="shrink-0 text-right font-semibold tabular-nums">
                    ${calcAmount(p).toFixed(2)}
                  </span>
                </div>
                {i < bill.parameters.length - 1 && <Separator />}
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="mb-10 flex items-baseline justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-3xl font-light tabular-nums">
              ${bill.total.toFixed(2)}
            </span>
          </div>

          {bill.state === BillStatusEnum.Created && (
            <div className="mb-10 flex gap-3">
              <Button variant="outline" className="flex-1">
                Download PDF
              </Button>
              <Button className="flex-1">Pay ${bill.total.toFixed(2)}</Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom navigation */}
      <div className="flex shrink-0 items-center justify-between border-t border-border bg-background px-6 py-3">
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
            <span className="text-xs text-muted-foreground">of</span>{" "}
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
  )
}
