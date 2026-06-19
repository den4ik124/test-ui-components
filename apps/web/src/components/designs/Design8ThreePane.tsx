import { useState } from "react"
import type { BillData } from "../../models/BillData"
import { BillStatusEnum } from "../../models/BillStatusEnum"
import { dummyBills } from "../../data/billDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
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

const sortedBills = [...dummyBills].sort((a, b) =>
  b.billingPeriod.localeCompare(a.billingPeriod)
)

function BillDetail({ bill }: { bill: BillData }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-xl font-bold">
              {formatPeriod(bill.billingPeriod)}
            </h2>
            <Badge variant="outline" className={STATUS_BADGE_CLASS[bill.state]}>
              {STATUS_LABELS[bill.state]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {bill.publicId} · Apt {bill.apartmentId}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Issued {formatDate(bill.dateCreated)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Total Due
          </p>
          <p className="text-3xl font-bold tabular-nums">
            ${bill.total.toFixed(2)}
          </p>
        </div>
      </div>

      <Separator />

      <div className="overflow-hidden rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Prev</TableHead>
              <TableHead className="text-right">Curr</TableHead>
              <TableHead className="text-right">Usage</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bill.parameters.map((p) => (
              <TableRow key={p.index}>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{p.title}</span>
                    {p.isUncertain && (
                      <span className="rounded bg-amber-100 px-1 text-[10px] text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        est.
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                  {p.previousValue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">
                  {p.value.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums">
                  {calcUsage(p).toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                  ${p.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-sm font-semibold tabular-nums">
                  ${calcAmount(p).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="font-semibold">
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
        <div className="flex justify-end gap-2">
          <Button variant="outline">Download PDF</Button>
          <Button>Pay ${bill.total.toFixed(2)}</Button>
        </div>
      )}
    </div>
  )
}

export function Design8ThreePane() {
  const [selectedId, setSelectedId] = useState(sortedBills[0].id)
  const selected = sortedBills.find((b) => b.id === selectedId)!

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden bg-background">
      {/* Pane 1: Status rail */}
      <div className="flex w-11 shrink-0 flex-col items-center gap-1.5 overflow-y-auto border-r border-border py-3">
        {sortedBills.map((bill) => (
          <button
            key={bill.id}
            onClick={() => setSelectedId(bill.id)}
            title={`${formatShortPeriod(bill.billingPeriod)} — ${STATUS_LABELS[bill.state]}`}
            className={`h-6 w-6 flex-shrink-0 rounded-full transition-all ${
              bill.id === selectedId
                ? `${STATUS_DOT_CLASS[bill.state]} scale-110 ring-2 ring-foreground/25 ring-offset-1 ring-offset-background`
                : `${STATUS_DOT_CLASS[bill.state]} opacity-30 hover:opacity-60`
            }`}
          />
        ))}
      </div>

      {/* Pane 2: Bill metadata list */}
      <div className="flex w-52 shrink-0 flex-col border-r border-border">
        <div className="shrink-0 border-b border-border px-3 py-2.5">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            Invoices
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-0.5 p-1.5">
            {sortedBills.map((bill) => (
              <button
                key={bill.id}
                onClick={() => setSelectedId(bill.id)}
                className={`w-full rounded-md px-2.5 py-2.5 text-left transition-colors ${
                  bill.id === selectedId ? "bg-accent" : "hover:bg-accent/50"
                }`}
              >
                <p className="text-xs font-semibold text-foreground">
                  {formatShortPeriod(bill.billingPeriod)}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {bill.publicId}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <div
                    className={`mr-2 h-0.5 flex-1 rounded-full ${STATUS_DOT_CLASS[bill.state]} opacity-40`}
                  />
                  <span className="text-xs font-bold tabular-nums">
                    ${bill.total.toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Pane 3: Detail */}
      <main className="flex-1 overflow-auto p-6">
        <BillDetail bill={selected} />
      </main>
    </div>
  )
}
