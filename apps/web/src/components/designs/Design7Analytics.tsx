import { useState } from "react";
import type { BillData } from "../../BillData";
import { BillStatusEnum } from "../../BillStatusEnum";
import { dummyBills } from "../../data/billDummyData";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Table, TableBody, TableCell, TableFooter,
  TableHead, TableHeader, TableRow,
} from "@workspace/ui/components/table";
import {
  formatPeriod, formatShortPeriod, formatDate,
  calcUsage, calcAmount, STATUS_LABELS, STATUS_BADGE_CLASS, STATUS_DOT_CLASS,
} from "./shared";

const sortedBills = [...dummyBills].sort((a, b) =>
  b.billingPeriod.localeCompare(a.billingPeriod)
);

const totalBilled = sortedBills.reduce((s, b) => s + b.total, 0);
const totalOutstanding = sortedBills
  .filter((b) => b.state === BillStatusEnum.Created)
  .reduce((s, b) => s + b.total, 0);
const avgMonthly = totalBilled / sortedBills.length;

function BillDetail({ bill }: { bill: BillData }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold">{formatPeriod(bill.billingPeriod)}</h3>
            <Badge variant="outline" className={STATUS_BADGE_CLASS[bill.state]}>
              {STATUS_LABELS[bill.state]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {bill.publicId} · Apt {bill.apartmentId}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Issued {formatDate(bill.dateCreated)}
          </p>
        </div>
        <p className="text-3xl font-bold tabular-nums">${bill.total.toFixed(2)}</p>
      </div>

      <Separator />

      <div className="rounded-md border border-border overflow-hidden">
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
                      <span className="text-[10px] bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 px-1 rounded">
                        est.
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.previousValue.toLocaleString()} →{" "}
                    {p.value.toLocaleString()}
                  </p>
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground text-sm">
                  {calcUsage(p).toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground text-sm">
                  ${p.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium text-sm">
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
  );
}

export function Design7Analytics() {
  const [selectedId, setSelectedId] = useState(sortedBills[0].id);
  const selected = sortedBills.find((b) => b.id === selectedId)!;

  return (
    <div className="min-h-[calc(100vh-48px)] bg-muted/30 flex flex-col">
      {/* KPI Row */}
      <div className="border-b border-border bg-background px-6 py-4 shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Total Billed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">
                ${totalBilled.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sortedBills.length} invoices
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
                ${totalOutstanding.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sortedBills.filter((b) => b.state === BillStatusEnum.Created).length}{" "}
                unpaid
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Monthly Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">
                ${avgMonthly.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                per billing period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
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
      <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 py-4 gap-4">
        {/* Bill list */}
        <div className="w-48 shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-1">
            Invoices
          </p>
          <div className="flex flex-col gap-0.5">
            {sortedBills.map((bill) => (
              <button
                key={bill.id}
                onClick={() => setSelectedId(bill.id)}
                className={`w-full text-left px-2.5 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  bill.id === selectedId
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/60"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    STATUS_DOT_CLASS[bill.state]
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">
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
        <div className="flex-1 bg-background rounded-lg border border-border p-5">
          <BillDetail bill={selected} />
        </div>
      </div>
    </div>
  );
}
