import { useState } from "react";
import type { BillData } from "../../models/BillData";
import { BillStatusEnum } from "../../models/BillStatusEnum";
import { dummyBills } from "../../data/billDummyData";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@workspace/ui/components/sheet";
import {
  formatPeriod, formatDate, calcUsage, calcAmount,
  STATUS_LABELS, STATUS_BADGE_CLASS, STATUS_DOT_CLASS,
} from "./shared";

const sortedBills = [...dummyBills].sort((a, b) =>
  b.billingPeriod.localeCompare(a.billingPeriod)
);

const ACCENT_CLASS: Record<BillStatusEnum, string> = {
  [BillStatusEnum.Created]: "border-t-blue-400",
  [BillStatusEnum.Paid]: "border-t-emerald-400",
  [BillStatusEnum.Confirmed]: "border-t-violet-400",
  [BillStatusEnum.Outdated]: "border-t-gray-300 dark:border-t-gray-600",
};

type FilterTab = BillStatusEnum | "all";

function BillCard({ bill, onClick }: { bill: BillData; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border border-border border-t-2 ${
        ACCENT_CLASS[bill.state]
      } bg-card p-4 hover:shadow-md transition-all flex flex-col gap-3`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5 font-mono">
            {bill.publicId}
          </p>
          <h3 className="font-semibold text-sm text-foreground leading-tight">
            {formatPeriod(bill.billingPeriod)}
          </h3>
        </div>
        <Badge
          variant="outline"
          className={`${STATUS_BADGE_CLASS[bill.state]} shrink-0 text-[10px]`}
        >
          {STATUS_LABELS[bill.state]}
        </Badge>
      </div>
      <div className="flex items-end justify-between mt-auto pt-2 border-t border-border/50">
        <div>
          <p className="text-[10px] text-muted-foreground">
            {formatDate(bill.dateCreated)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {bill.parameters.length} services
          </p>
        </div>
        <p className="text-xl font-bold tabular-nums text-foreground">
          ${bill.total.toFixed(2)}
        </p>
      </div>
    </button>
  );
}

export function Design4Cards() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<FilterTab>("all");

  const displayed =
    tab === "all"
      ? sortedBills
      : sortedBills.filter((b) => b.state === tab);

  const selected = selectedId
    ? (sortedBills.find((b) => b.id === selectedId) ?? null)
    : null;

  const tabs: { label: string; value: FilterTab }[] = [
    { label: `All (${sortedBills.length})`, value: "all" },
    {
      label: `Created (${sortedBills.filter((b) => b.state === BillStatusEnum.Created).length})`,
      value: BillStatusEnum.Created,
    },
    {
      label: `Confirmed (${sortedBills.filter((b) => b.state === BillStatusEnum.Confirmed).length})`,
      value: BillStatusEnum.Confirmed,
    },
    {
      label: `Paid (${sortedBills.filter((b) => b.state === BillStatusEnum.Paid).length})`,
      value: BillStatusEnum.Paid,
    },
    {
      label: `Outdated (${sortedBills.filter((b) => b.state === BillStatusEnum.Outdated).length})`,
      value: BillStatusEnum.Outdated,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-48px)] bg-background">
      {/* Tab bar */}
      <div className="border-b border-border px-6 py-2 flex items-center gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={String(t.value)}
            onClick={() => setTab(t.value)}
            className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === t.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onClick={() => setSelectedId(bill.id)}
            />
          ))}
        </div>
        {displayed.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-16">
            No invoices in this category.
          </p>
        )}
      </div>

      {/* Slide-out detail */}
      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <SheetContent className="w-[min(560px,100vw)] overflow-y-auto" side="right">
          {selected && (
            <>
              <SheetHeader>
                <div
                  className={`h-0.5 w-12 rounded-full ${STATUS_DOT_CLASS[selected.state]} mb-1`}
                />
                <SheetTitle className="pr-8">
                  {formatPeriod(selected.billingPeriod)}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={STATUS_BADGE_CLASS[selected.state]}
                  >
                    {STATUS_LABELS[selected.state]}
                  </Badge>
                  <span>
                    {selected.publicId} · Apt {selected.apartmentId}
                  </span>
                </SheetDescription>
              </SheetHeader>

              <div className="px-4 pb-4 flex flex-col gap-0">
                <div className="flex items-baseline justify-between px-0.5 py-3">
                  <span className="text-xs text-muted-foreground">
                    Issued {formatDate(selected.dateCreated)}
                  </span>
                  <span className="text-2xl font-bold tabular-nums">
                    ${selected.total.toFixed(2)}
                  </span>
                </div>

                <Separator />

                {selected.parameters.map((p, i) => (
                  <div key={p.index}>
                    <div className="flex items-start justify-between py-2.5 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-sm font-medium">{p.title}</span>
                          {p.isUncertain && (
                            <span className="text-[10px] bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 px-1 rounded shrink-0">
                              est.
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {calcUsage(p).toLocaleString()} units ×{" "}
                          ${p.price.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums shrink-0">
                        ${calcAmount(p).toFixed(2)}
                      </span>
                    </div>
                    {i < selected.parameters.length - 1 && <Separator />}
                  </div>
                ))}

                <Separator />
                <div className="flex items-center justify-between px-0.5 py-3">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold tabular-nums">
                    ${selected.total.toFixed(2)}
                  </span>
                </div>

                {selected.state === BillStatusEnum.Created && (
                  <>
                    <Separator />
                    <div className="flex gap-2 pt-3">
                      <Button variant="outline" className="flex-1">
                        Download PDF
                      </Button>
                      <Button className="flex-1">
                        Pay ${selected.total.toFixed(2)}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
