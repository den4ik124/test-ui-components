import { useState } from "react"
import type { BillData } from "../../models/BillData"
import { BillStatusEnum } from "../../models/BillStatusEnum"
import { dummyBills } from "../../data/billDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
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

const totalBilled = sortedBills.reduce((s, b) => s + b.total, 0)
const totalOutstanding = sortedBills
  .filter((b) => b.state === BillStatusEnum.Created)
  .reduce((s, b) => s + b.total, 0)
const avgMonthly = totalBilled / sortedBills.length

function BillDetail({ bill }: { bill: BillData }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-xl font-bold">
              {formatPeriod(bill.billingPeriod)}
            </h3>
            <Badge variant="outline" className={STATUS_BADGE_CLASS[bill.state]}>
              {STATUS_LABELS[bill.state]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {bill.publicId} · Apt {bill.apartmentId}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Issued {formatDate(bill.dateCreated)}
          </p>
        </div>
        <p className="text-3xl font-bold tabular-nums">
          ${bill.total.toFixed(2)}
        </p>
      </div>

      <Separator />

      <div className="overflow-hidden rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Usage</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bill.parameters.map((p) => (
              <TableRow key={p.index}>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span>{p.title}</span>
                    {p.isUncertain && (
                      <span className="rounded bg-amber-100 px-1 text-[10px] text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        est.
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.previousValue.toLocaleString()} →{" "}
                    {p.value.toLocaleString()}
                  </p>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                  {calcUsage(p).toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                  ${p.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums">
                  ${calcAmount(p).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="font-semibold">
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

export function Design7Analytics() {
  const [selectedId, setSelectedId] = useState(sortedBills[0].id)
  const selected = sortedBills.find((b) => b.id === selectedId)!

  return (
    <div className="flex min-h-[calc(100vh-48px)] flex-col bg-muted/30">
      {/* KPI Row */}
      <div className="shrink-0 border-b border-border bg-background px-6 py-4">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Total Billed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">
                ${totalBilled.toFixed(2)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {sortedBills.length} invoices
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600 tabular-nums dark:text-blue-400">
                ${totalOutstanding.toFixed(2)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {
                  sortedBills.filter((b) => b.state === BillStatusEnum.Created)
                    .length
                }{" "}
                unpaid
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Monthly Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">
                ${avgMonthly.toFixed(2)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                per billing period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Latest Invoice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-bold">
                {formatPeriod(sortedBills[0].billingPeriod)}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                ${sortedBills[0].total.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Split: list + detail */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 gap-4 px-6 py-4">
        {/* Bill list */}
        <div className="w-48 shrink-0">
          <p className="mb-2 px-1 text-[10px] tracking-widest text-muted-foreground uppercase">
            Invoices
          </p>
          <div className="flex flex-col gap-0.5">
            {sortedBills.map((bill) => (
              <button
                key={bill.id}
                onClick={() => setSelectedId(bill.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors ${
                  bill.id === selectedId
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/60"
                }`}
              >
                <div
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    STATUS_DOT_CLASS[bill.state]
                  }`}
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">
                    {formatShortPeriod(bill.billingPeriod)}
                  </p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    ${bill.total.toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="flex-1 rounded-lg border border-border bg-background p-5">
          <BillDetail bill={selected} />
        </div>
      </div>
    </div>
  )
}
