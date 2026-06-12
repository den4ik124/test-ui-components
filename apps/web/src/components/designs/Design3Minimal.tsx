import { useState, useMemo } from "react";
import type { BillData } from "../../BillData";
import { BillStatusEnum } from "../../BillStatusEnum";
import { dummyBills } from "../../data/billDummyData";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  formatPeriod, formatShortPeriod, formatDate,
  calcUsage, calcAmount, STATUS_LABELS, STATUS_BADGE_CLASS,
} from "./shared";

const BILLS_PER_PAGE = 7;

const sortedBills = [...dummyBills].sort((a, b) =>
  b.billingPeriod.localeCompare(a.billingPeriod)
);

const totalPages = Math.ceil(sortedBills.length / BILLS_PER_PAGE);

function BillDetail({ bill }: { bill: BillData }) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Invoice {bill.publicId}
          </p>
          <h2 className="text-4xl font-light text-foreground tracking-tight">
            {formatPeriod(bill.billingPeriod)}
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Issued {formatDate(bill.dateCreated)} &middot; Apt{" "}
            {bill.apartmentId}
          </p>
        </div>
        <div className="text-right">
          <Badge
            variant="outline"
            className={`${STATUS_BADGE_CLASS[bill.state]} mb-2`}
          >
            {STATUS_LABELS[bill.state]}
          </Badge>
          <p className="text-5xl font-extralight text-foreground tabular-nums">
            ${bill.total.toFixed(2)}
          </p>
        </div>
      </div>

      <Separator className="mb-6" />

      <div className="flex flex-col">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-8 items-start text-sm mb-1">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Service
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground text-right">
            Usage
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground text-right">
            Rate
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground text-right">
            Amount
          </span>
        </div>
        <Separator className="my-2" />

        {bill.parameters.map((p, i) => (
          <div key={p.index}>
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-8 items-start py-3.5 text-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{p.title}</span>
                  {p.isUncertain && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                      estimated
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.previousValue.toLocaleString()} →{" "}
                  {p.value.toLocaleString()}
                </p>
              </div>
              <span className="text-right tabular-nums text-muted-foreground">
                {calcUsage(p).toLocaleString()}
              </span>
              <span className="text-right tabular-nums text-muted-foreground">
                ${p.price.toFixed(2)}
              </span>
              <span className="text-right tabular-nums font-medium text-foreground">
                ${calcAmount(p).toFixed(2)}
              </span>
            </div>
            {i < bill.parameters.length - 1 && <Separator />}
          </div>
        ))}

        <Separator className="my-2" />

        <div className="flex items-center justify-between py-4">
          <span className="text-sm font-medium text-foreground">Total</span>
          <span className="text-2xl font-light tabular-nums text-foreground">
            ${bill.total.toFixed(2)}
          </span>
        </div>
      </div>

      {bill.state === BillStatusEnum.Created && (
        <>
          <Separator className="mb-6" />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              Download PDF
            </Button>
            <Button className="flex-1">Pay Now</Button>
          </div>
        </>
      )}
    </div>
  );
}

export function Design3Minimal() {
  const [selectedId, setSelectedId] = useState(sortedBills[0].id);
  const [page, setPage] = useState(0);

  const pageBills = useMemo(
    () => sortedBills.slice(page * BILLS_PER_PAGE, (page + 1) * BILLS_PER_PAGE),
    [page]
  );

  const selected = sortedBills.find((b) => b.id === selectedId)!;

  function goToPage(next: number) {
    setPage(next);
    setSelectedId(sortedBills[next * BILLS_PER_PAGE].id);
  }

  return (
    <div className="min-h-[calc(100vh-48px)] bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8 flex gap-12">
        {/* Left nav */}
        <nav className="w-40 shrink-0 flex flex-col gap-0 pt-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 px-1">
            Billing History
          </p>

          <div className="flex flex-col gap-0.5">
            {pageBills.map((bill) => (
              <button
                key={bill.id}
                onClick={() => setSelectedId(bill.id)}
                className={`text-left px-1 py-1.5 text-sm rounded transition-colors ${
                  bill.id === selectedId
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="block">
                  {formatShortPeriod(bill.billingPeriod)}
                </span>
                <span
                  className={`block text-xs mt-0.5 ${
                    bill.id === selectedId
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                  }`}
                >
                  ${bill.total.toFixed(2)}
                </span>
                {bill.id === selectedId && (
                  <div className="mt-1.5 h-px w-full bg-foreground" />
                )}
              </button>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between px-1">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
                className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5 px-1">
              {sortedBills.length} invoices total
            </p>
          </div>
        </nav>

        <main className="flex-1 overflow-auto">
          <BillDetail bill={selected} />
        </main>
      </div>
    </div>
  );
}
