import { useState, useMemo, useEffect, useRef } from "react";
import { dummyApartments } from "../../data/apartmentDummyData";
import { dummyBills } from "../../data/billDummyData";
import type { BillData } from "../../models/BillData";
import type { ApartmentResponse } from "../../models/apartment";
import { BillStatusEnum } from "../../models/BillStatusEnum";
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

const STATUS_SELECTED_CLASS: Record<BillStatusEnum, string> = {
  [BillStatusEnum.Created]:
    "bg-blue-50 border-l-2 border-blue-500 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100 dark:border-blue-400",
  [BillStatusEnum.Paid]:
    "bg-emerald-50 border-l-2 border-emerald-500 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100 dark:border-emerald-400",
  [BillStatusEnum.Confirmed]:
    "bg-violet-50 border-l-2 border-violet-500 text-violet-900 dark:bg-violet-950/30 dark:text-violet-100 dark:border-violet-400",
  [BillStatusEnum.Outdated]:
    "bg-gray-100 border-l-2 border-gray-400 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-500",
};

const ALL_STATES = [
  BillStatusEnum.Created,
  BillStatusEnum.Paid,
  BillStatusEnum.Confirmed,
  BillStatusEnum.Outdated,
] as const;

// ─── Bill detail ─────────────────────────────────────────────────────────────

function BillDetail({ bill, prevBill }: { bill: BillData; prevBill?: BillData }) {
  const prevUsageMap = useMemo(() => {
    const map = new Map<string, number>();
    if (prevBill) {
      for (const p of prevBill.parameters) map.set(p.title ?? "", calcUsage(p));
    }
    return map;
  }, [prevBill]);

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Invoice {bill.publicId}
          </p>
          <h2 className="text-4xl font-light text-foreground tracking-tight">
            {formatPeriod(bill.billingPeriod)}
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Issued {formatDate(bill.dateCreated)} &middot; Apt {bill.apartmentId}
          </p>
        </div>
        <div className="text-right">
          <Badge variant="outline" className={`${STATUS_BADGE_CLASS[bill.state]} mb-2`}>
            {STATUS_LABELS[bill.state]}
          </Badge>
          <p className="text-5xl font-extralight text-foreground tabular-nums">
            ${bill.total.toFixed(2)}
          </p>
        </div>
      </div>

      <Separator className="mb-6" />

      <div className="rounded-lg overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="text-center">Value</TableHead>
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
                    <span className="font-medium">{p.title}</span>
                    {p.isUncertain && (
                      <span className="text-[10px] bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 px-1 rounded">
                        est.
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <span className="tabular-nums text-muted-foreground text-right w-14 shrink-0">
                      {p.previousValue.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground/40 shrink-0">→</span>
                    <span className="tabular-nums w-14 shrink-0">
                      {p.value.toLocaleString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  <span>{calcUsage(p).toLocaleString()}</span>
                  {(() => {
                    const prev = prevUsageMap.get(p.title ?? "");
                    if (prev === undefined) return null;
                    const delta = calcUsage(p) - prev;
                    if (delta === 0) return null;
                    return (
                      <span className={`ml-1.5 text-xs font-normal ${delta > 0 ? "text-red-500" : "text-emerald-500"}`}>
                        {delta > 0 ? "↑" : "↓"}{Math.abs(delta).toLocaleString()}
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  ${p.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold">
                  ${calcAmount(p).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="font-semibold">Total</TableCell>
              <TableCell className="text-right font-bold tabular-nums">
                ${bill.total.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {bill.state === BillStatusEnum.Created && (
        <>
          <Separator className="my-6" />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">Download PDF</Button>
            <Button className="flex-1">Pay Now</Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Apartment switcher dropdown ─────────────────────────────────────────────

function ApartmentDropdown({
  apartments,
  selectedId,
  billCountByApt,
  onSelect,
  onClose,
}: {
  apartments: ApartmentResponse[];
  selectedId: string;
  billCountByApt: Map<string, number>;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 z-50 mt-1 w-72 rounded-lg border border-border bg-background shadow-lg overflow-hidden"
    >
      {apartments.map((apt) => {
        const count = billCountByApt.get(apt.id) ?? 0;
        const isSelected = apt.id === selectedId;
        return (
          <button
            key={apt.id}
            onClick={() => { onSelect(apt.id); onClose(); }}
            className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-border last:border-0 transition-colors ${
              isSelected ? "bg-accent" : "hover:bg-muted/50"
            }`}
          >
            <span className="text-base mt-0.5 shrink-0">🏠</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {apt.title ?? apt.id}
                </span>
                {isSelected && (
                  <span className="text-[10px] text-muted-foreground shrink-0">✓</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                <span className="font-mono bg-muted px-1 rounded text-[10px]">{apt.id}</span>
                <span>{apt.currency.shortName}</span>
                <span>{apt.rentPrice.toLocaleString()}/mo</span>
                <span>{count} bills</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Period select ────────────────────────────────────────────────────────────

function PeriodSelect({
  value,
  periods,
  placeholder,
  onChange,
}: {
  value: string;
  periods: string[];
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground cursor-pointer hover:border-foreground/40 transition-colors outline-none"
    >
      <option value="">{placeholder}</option>
      {periods.map((p) => (
        <option key={p} value={p}>{formatShortPeriod(p)}</option>
      ))}
    </select>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ApartmentBillsPage() {
  const [selectedAptId, setSelectedAptId] = useState(dummyApartments[0].id);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<BillStatusEnum | "all">("all");
  const [fromPeriod, setFromPeriod] = useState("");
  const [toPeriod, setToPeriod] = useState("");

  const hasMultiple = dummyApartments.length > 1;
  const hasActiveFilter = statusFilter !== "all" || fromPeriod !== "" || toPeriod !== "";

  const billCountByApt = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of dummyBills) map.set(b.apartmentId, (map.get(b.apartmentId) ?? 0) + 1);
    return map;
  }, []);

  const selectedApt = dummyApartments.find((a) => a.id === selectedAptId)!;

  // All bills for this apartment, newest first
  const aptBills = useMemo(
    () =>
      dummyBills
        .filter((b) => b.apartmentId === selectedAptId)
        .sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod)),
    [selectedAptId],
  );

  // Periods available in this apartment's bills (ascending, for selects)
  const availablePeriods = useMemo(
    () => [...new Set(aptBills.map((b) => b.billingPeriod))].sort(),
    [aptBills],
  );

  // Filtered subset shown in nav
  const filteredBills = useMemo(() => {
    return aptBills.filter((b) => {
      if (statusFilter !== "all" && b.state !== statusFilter) return false;
      if (fromPeriod && b.billingPeriod < fromPeriod) return false;
      if (toPeriod && b.billingPeriod > toPeriod) return false;
      return true;
    });
  }, [aptBills, statusFilter, fromPeriod, toPeriod]);

  const effectiveBillId =
    selectedBillId && filteredBills.some((b) => b.id === selectedBillId)
      ? selectedBillId
      : (filteredBills[0]?.id ?? null);

  const selectedBill = filteredBills.find((b) => b.id === effectiveBillId);
  // prevBill always from the full unfiltered list to get correct usage delta
  const selectedBillIndex = aptBills.findIndex((b) => b.id === effectiveBillId);
  const prevBill = aptBills[selectedBillIndex + 1];

  function selectApartment(aptId: string) {
    setSelectedAptId(aptId);
    setSelectedBillId(null);
    setStatusFilter("all");
    setFromPeriod("");
    setToPeriod("");
  }

  function clearFilters() {
    setStatusFilter("all");
    setFromPeriod("");
    setToPeriod("");
    setSelectedBillId(null);
  }

  return (
    <div className="flex flex-col h-[calc(100svh-49px)] overflow-hidden">

      {/* ── Apartment header bar ── */}
      <div className="relative shrink-0 border-b border-border bg-background">
        <div className="flex items-center gap-3 px-4 py-2 min-h-[42px]">
          {hasMultiple ? (
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="flex items-center gap-2 rounded-md px-2 py-1 -ml-2 hover:bg-muted transition-colors group"
            >
              <span className="text-sm">🏠</span>
              <span className="text-sm font-semibold text-foreground">
                {selectedApt.title ?? selectedApt.id}
              </span>
              <span className="text-muted-foreground text-xs group-hover:text-foreground transition-colors">
                ▾
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm">🏠</span>
              <span className="text-sm font-semibold text-foreground">
                {selectedApt.title ?? selectedApt.id}
              </span>
            </div>
          )}
          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {selectedApt.id}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {selectedApt.currency.shortName}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {selectedApt.rentPrice.toLocaleString()}/mo
          </span>
          {aptBills.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground/60">
              {aptBills.length} {aptBills.length === 1 ? "bill" : "bills"}
            </span>
          )}
        </div>

        {hasMultiple && pickerOpen && (
          <ApartmentDropdown
            apartments={dummyApartments}
            selectedId={selectedAptId}
            billCountByApt={billCountByApt}
            onSelect={selectApartment}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>

      {/* ── Filter bar (only shown when apartment has bills) ── */}
      {aptBills.length > 0 && (
        <div className="shrink-0 border-b border-border bg-background px-4 py-2 flex items-center gap-2 flex-wrap">
          {/* Status pills */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              All
            </button>
            {ALL_STATES.map((state) => (
              <button
                key={state}
                onClick={() => setStatusFilter(statusFilter === state ? "all" : state)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  statusFilter === state
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT_CLASS[state]}`} />
                {STATUS_LABELS[state]}
              </button>
            ))}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">From</span>
            <PeriodSelect
              value={fromPeriod}
              periods={availablePeriods}
              placeholder="earliest"
              onChange={setFromPeriod}
            />
            <span className="text-xs text-muted-foreground">to</span>
            <PeriodSelect
              value={toPeriod}
              periods={availablePeriods}
              placeholder="latest"
              onChange={setToPeriod}
            />
            {hasActiveFilter && (
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1 flex items-center gap-1"
              >
                <span>✕</span>
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Bills section ── */}
      <div className="flex flex-1 min-w-0 overflow-hidden">
        {aptBills.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-4xl mb-3">🧾</p>
              <p className="text-sm font-medium">No bills yet</p>
              <p className="text-xs mt-1 text-muted-foreground/60">
                This property has no billing history
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Bill list nav */}
            <nav className="w-44 shrink-0 border-r border-border flex flex-col overflow-hidden">
              <div className="px-3 py-2.5 border-b border-border shrink-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Billing History
                </p>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: "none" }}>
                {filteredBills.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 gap-1 text-center px-3">
                    <p className="text-xs font-medium text-muted-foreground">No matches</p>
                    <button
                      onClick={clearFilters}
                      className="text-[11px] text-muted-foreground/60 hover:text-foreground underline underline-offset-2 transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5 py-2 px-2">
                    {filteredBills.map((bill, i) => {
                      const year = bill.billingPeriod.slice(0, 4);
                      const prevYear = i > 0 ? filteredBills[i - 1].billingPeriod.slice(0, 4) : null;
                      const showYearSep = prevYear !== null && year !== prevYear;
                      const isSelected = bill.id === effectiveBillId;
                      return (
                        <div key={bill.id}>
                          {showYearSep && (
                            <div className="flex items-center gap-1.5 px-1 py-1.5">
                              <div className="flex-1 h-px bg-border" />
                              <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                                {year}
                              </span>
                              <div className="flex-1 h-px bg-border" />
                            </div>
                          )}
                          <button
                            onClick={() => setSelectedBillId(bill.id)}
                            className={`w-full text-left py-1.5 text-sm rounded transition-all ${
                              isSelected
                                ? `font-medium pl-2 pr-1 ${STATUS_SELECTED_CLASS[bill.state]}`
                                : "px-1 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT_CLASS[bill.state]}`}
                              />
                              {formatShortPeriod(bill.billingPeriod)}
                            </span>
                            <span className="block text-xs mt-0.5 pl-3 opacity-60">
                              ${bill.total.toFixed(2)}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="px-3 py-2 border-t border-border shrink-0">
                <p className="text-[10px] text-muted-foreground/40 text-center">
                  {hasActiveFilter
                    ? `${filteredBills.length} of ${aptBills.length} bills`
                    : `${aptBills.length} ${aptBills.length === 1 ? "bill" : "bills"}`}
                </p>
              </div>
            </nav>

            {/* Bill detail */}
            <main className="flex-1 min-w-0 overflow-hidden">
              {selectedBill ? (
                <ScrollArea className="h-full">
                  <div className="px-8 py-8">
                    <BillDetail bill={selectedBill} prevBill={prevBill} />
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Select a bill to view details
                </div>
              )}
            </main>
          </>
        )}
      </div>
    </div>
  );
}
