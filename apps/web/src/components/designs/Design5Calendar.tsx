import { useState } from "react";
import type { BillData } from "../../BillData";
import { BillStatusEnum } from "../../BillStatusEnum";
import { dummyBills } from "../../data/billDummyData";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  formatPeriod, formatDate, calcUsage, calcAmount,
  STATUS_LABELS, STATUS_BADGE_CLASS, STATUS_DOT_CLASS,
} from "./shared";

const sortedBills = [...dummyBills].sort((a, b) =>
  b.billingPeriod.localeCompare(a.billingPeriod)
);

const billsByPeriod = new Map(dummyBills.map((b) => [b.billingPeriod, b]));

const years = [
  ...new Set(dummyBills.map((b) => b.billingPeriod.split("-")[0])),
].sort((a, b) => b.localeCompare(a));

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CELL_BG: Record<BillStatusEnum, string> = {
  [BillStatusEnum.Created]:
    "bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800",
  [BillStatusEnum.Paid]:
    "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800",
  [BillStatusEnum.Confirmed]:
    "bg-violet-50 border-violet-200 hover:bg-violet-100 dark:bg-violet-900/20 dark:border-violet-800",
  [BillStatusEnum.Outdated]:
    "bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-800/50 dark:border-gray-700",
};

function BillDetail({ bill }: { bill: BillData }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
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
        <p className="text-3xl font-bold tabular-nums">${bill.total.toFixed(2)}</p>
      </div>

      <Separator />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {bill.parameters.map((p) => (
          <div
            key={p.index}
            className="bg-muted/50 rounded-lg p-3 flex flex-col gap-1"
          >
            <div className="flex items-start justify-between gap-1">
              <p className="text-xs font-medium text-foreground leading-tight">
                {p.title}
              </p>
              {p.isUncertain && (
                <span className="text-[10px] text-amber-500 shrink-0">*</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {calcUsage(p).toLocaleString()} units
            </p>
            <p className="text-sm font-semibold tabular-nums mt-auto">
              ${calcAmount(p).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {bill.state === BillStatusEnum.Created && (
        <>
          <Separator />
          <div className="flex gap-2 justify-end">
            <Button variant="outline">Download PDF</Button>
            <Button>Pay ${bill.total.toFixed(2)}</Button>
          </div>
        </>
      )}
    </div>
  );
}

export function Design5Calendar() {
  const [selectedPeriod, setSelectedPeriod] = useState(
    sortedBills[0].billingPeriod
  );

  const selected = billsByPeriod.get(selectedPeriod) ?? null;

  return (
    <div className="min-h-[calc(100vh-48px)] bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Billing Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Click a month to view its invoice
          </p>
        </div>

        {/* Year grids */}
        <div className="flex flex-col gap-6 mb-6">
          {years.map((year) => (
            <div key={year}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                {year}
              </h2>
              <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                {MONTHS.map((month, idx) => {
                  const monthNum = String(idx + 1).padStart(2, "0");
                  const period = `${year}-${monthNum}`;
                  const bill = billsByPeriod.get(period);
                  const isSelected = selectedPeriod === period;

                  if (!bill) {
                    return (
                      <div
                        key={month}
                        className="rounded-lg border border-dashed border-border p-2 flex flex-col items-center opacity-25 select-none"
                      >
                        <span className="text-xs text-muted-foreground">
                          {month}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={month}
                      onClick={() => setSelectedPeriod(period)}
                      className={`rounded-lg border p-2 flex flex-col items-center transition-all ${
                        CELL_BG[bill.state]
                      } ${
                        isSelected
                          ? "ring-2 ring-foreground ring-offset-1 ring-offset-background"
                          : ""
                      }`}
                    >
                      <span className="text-xs font-medium">{month}</span>
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-1 ${
                          STATUS_DOT_CLASS[bill.state]
                        }`}
                      />
                      <span className="text-[10px] tabular-nums text-muted-foreground mt-0.5">
                        ${Math.round(bill.total)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          {(
            [
              BillStatusEnum.Created,
              BillStatusEnum.Confirmed,
              BillStatusEnum.Paid,
              BillStatusEnum.Outdated,
            ] as BillStatusEnum[]
          ).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${STATUS_DOT_CLASS[s]}`} />
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
  );
}
