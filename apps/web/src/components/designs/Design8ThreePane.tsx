import { useState } from "react";
import type { BillData } from "../../models/BillData";
import { BillStatusEnum } from "../../models/BillStatusEnum";
import { dummyBills } from "../../data/billDummyData";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
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

function BillDetail({ bill }: { bill: BillData }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold">{formatPeriod(bill.billingPeriod)}</h2>
            <Badge variant="outline" className={STATUS_BADGE_CLASS[bill.state]}>
              {STATUS_LABELS[bill.state]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {bill.publicId} · Apt {bill.apartmentId}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Issued {formatDate(bill.dateCreated)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Total Due
          </p>
          <p className="text-3xl font-bold tabular-nums">${bill.total.toFixed(2)}</p>
        </div>
      </div>

      <Separator />

      <div className="rounded-md border border-border overflow-hidden">
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
                      <span className="text-[10px] bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 px-1 rounded">
                        est.
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground text-sm">
                  {p.previousValue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {p.value.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium text-sm">
                  {calcUsage(p).toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground text-sm">
                  ${p.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold text-sm">
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
  );
}

export function Design8ThreePane() {
  const [selectedId, setSelectedId] = useState(sortedBills[0].id);
  const selected = sortedBills.find((b) => b.id === selectedId)!;

  return (
    <div className="flex h-[calc(100vh-48px)] bg-background overflow-hidden">
      {/* Pane 1: Status rail */}
      <div className="w-11 border-r border-border flex flex-col py-3 items-center gap-1.5 shrink-0 overflow-y-auto">
        {sortedBills.map((bill) => (
          <button
            key={bill.id}
            onClick={() => setSelectedId(bill.id)}
            title={`${formatShortPeriod(bill.billingPeriod)} — ${STATUS_LABELS[bill.state]}`}
            className={`w-6 h-6 rounded-full transition-all flex-shrink-0 ${
              bill.id === selectedId
                ? `${STATUS_DOT_CLASS[bill.state]} ring-2 ring-offset-1 ring-offset-background ring-foreground/25 scale-110`
                : `${STATUS_DOT_CLASS[bill.state]} opacity-30 hover:opacity-60`
            }`}
          />
        ))}
      </div>

      {/* Pane 2: Bill metadata list */}
      <div className="w-52 border-r border-border flex flex-col shrink-0">
        <div className="px-3 py-2.5 border-b border-border shrink-0">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            Invoices
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-1.5 flex flex-col gap-0.5">
            {sortedBills.map((bill) => (
              <button
                key={bill.id}
                onClick={() => setSelectedId(bill.id)}
                className={`w-full text-left px-2.5 py-2.5 rounded-md transition-colors ${
                  bill.id === selectedId ? "bg-accent" : "hover:bg-accent/50"
                }`}
              >
                <p className="text-xs font-semibold text-foreground">
                  {formatShortPeriod(bill.billingPeriod)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {bill.publicId}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <div
                    className={`h-0.5 rounded-full flex-1 mr-2 ${STATUS_DOT_CLASS[bill.state]} opacity-40`}
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
  );
}
