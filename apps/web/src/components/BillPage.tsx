import { useState } from "react";
import type { BillData } from "../models/BillData";
import type { BillParameter } from "../models/BillParameter";
import { BillStatusEnum } from "../models/BillStatusEnum";
import { Button } from "@workspace/ui/components/button";
import { dummyBills } from "../data/billDummyData";

const STATUS_LABELS: Record<BillStatusEnum, string> = {
  [BillStatusEnum.Created]: "Created",
  [BillStatusEnum.Paid]: "Paid",
  [BillStatusEnum.Confirmed]: "Confirmed",
  [BillStatusEnum.Outdated]: "Outdated",
};

const STATUS_CLASSES: Record<BillStatusEnum, string> = {
  [BillStatusEnum.Created]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  [BillStatusEnum.Paid]:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  [BillStatusEnum.Confirmed]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  [BillStatusEnum.Outdated]:
    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

function calcUsage(p: BillParameter) {
  return p.value - p.previousValue;
}

function calcAmount(p: BillParameter) {
  return calcUsage(p) * p.price;
}

function StatusBadge({ state }: { state: BillStatusEnum }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[state]}`}
    >
      {STATUS_LABELS[state]}
    </span>
  );
}

function BillCard({
  bill,
  selected,
  onClick,
}: {
  bill: BillData;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected
          ? "border-primary bg-accent"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-card-foreground">
            {formatPeriod(bill.billingPeriod)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{bill.publicId}</p>
        </div>
        <StatusBadge state={bill.state} />
      </div>
      <p className="mt-3 text-2xl font-bold text-card-foreground">
        ${bill.total.toFixed(2)}
      </p>
    </button>
  );
}

function ParameterRow({ param }: { param: BillParameter }) {
  const usage = calcUsage(param);
  const amount = calcAmount(param);

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{param.title}</span>
          {param.isUncertain && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              estimated
            </span>
          )}
        </div>
        {param.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {param.description}
          </p>
        )}
      </td>
      <td className="py-3 pr-4 text-right tabular-nums text-sm text-muted-foreground">
        {param.previousValue.toLocaleString()}
      </td>
      <td className="py-3 pr-4 text-right tabular-nums text-sm text-foreground">
        {param.value.toLocaleString()}
      </td>
      <td className="py-3 pr-4 text-right tabular-nums text-sm font-medium text-foreground">
        {usage.toLocaleString()}
      </td>
      <td className="py-3 pr-4 text-right tabular-nums text-sm text-muted-foreground">
        ${param.price.toFixed(2)}
      </td>
      <td className="py-3 text-right tabular-nums text-sm font-semibold text-foreground">
        ${amount.toFixed(2)}
      </td>
    </tr>
  );
}

function BillDetail({ bill }: { bill: BillData }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">
              {formatPeriod(bill.billingPeriod)}
            </h2>
            <StatusBadge state={bill.state} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Invoice {bill.publicId} &middot; Apartment {bill.apartmentId}
          </p>
          <p className="text-sm text-muted-foreground">
            Created{" "}
            {new Date(bill.dateCreated).toLocaleDateString("default", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total due</p>
          <p className="text-4xl font-bold text-foreground">
            ${bill.total.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="py-3 pr-4 text-left font-medium text-muted-foreground">
                Service
              </th>
              <th className="py-3 pr-4 text-right font-medium text-muted-foreground">
                Previous
              </th>
              <th className="py-3 pr-4 text-right font-medium text-muted-foreground">
                Current
              </th>
              <th className="py-3 pr-4 text-right font-medium text-muted-foreground">
                Usage
              </th>
              <th className="py-3 pr-4 text-right font-medium text-muted-foreground">
                Rate
              </th>
              <th className="py-3 text-right font-medium text-muted-foreground">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="px-4">
            {bill.parameters.map((p) => (
              <ParameterRow key={p.index} param={p} />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/30">
              <td
                colSpan={5}
                className="py-3 pr-4 text-right text-sm font-semibold text-foreground"
              >
                Total
              </td>
              <td className="py-3 text-right text-sm font-bold text-foreground">
                ${bill.total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {bill.state === BillStatusEnum.Created && (
        <div className="flex justify-end">
          <Button>Pay ${bill.total.toFixed(2)}</Button>
        </div>
      )}
    </div>
  );
}

export function BillPage() {
  const [selectedId, setSelectedId] = useState<string>(dummyBills[0].id);
  const selectedBill = dummyBills.find((b) => b.id === selectedId)!;

  return (
    <div className="min-h-svh bg-background p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Utility Bills</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Apartment {dummyBills[0].apartmentId}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-3">
            {dummyBills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                selected={bill.id === selectedId}
                onClick={() => setSelectedId(bill.id)}
              />
            ))}
          </div>

          <div className="rounded-lg border border-border bg-background p-6">
            <BillDetail bill={selectedBill} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground font-mono">
          Press <kbd className="rounded border border-border px-1">d</kbd> to toggle dark mode
        </p>
      </div>
    </div>
  );
}
