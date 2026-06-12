import { useState } from "react";
import { BillStatusEnum } from "../../BillStatusEnum";
import { dummyBills } from "../../data/billDummyData";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  formatPeriod, formatShortPeriod, formatDate, calcUsage, calcAmount,
  STATUS_LABELS, STATUS_BADGE_CLASS,
} from "./shared";

const sortedBills = [...dummyBills].sort((a, b) =>
  b.billingPeriod.localeCompare(a.billingPeriod)
);

export function Design10Statement() {
  const [index, setIndex] = useState(0);
  const bill = sortedBills[index];

  return (
    <div className="min-h-[calc(100vh-48px)] bg-muted/40 py-8 px-4">
      {/* Navigation */}
      <div className="max-w-2xl mx-auto mb-3 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIndex(index - 1)}
          disabled={index === 0}
        >
          ← Newer
        </Button>
        <p className="text-xs text-muted-foreground tabular-nums">
          {index + 1} of {sortedBills.length} statements
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIndex(index + 1)}
          disabled={index >= sortedBills.length - 1}
        >
          Older →
        </Button>
      </div>

      {/* Quick-jump period selector */}
      <div className="max-w-2xl mx-auto mb-4 flex gap-1 flex-wrap justify-center">
        {sortedBills.map((b, i) => (
          <button
            key={b.id}
            onClick={() => setIndex(i)}
            title={formatShortPeriod(b.billingPeriod)}
            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
              i === index
                ? "bg-foreground text-background border-foreground"
                : "text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {formatShortPeriod(b.billingPeriod)}
          </button>
        ))}
      </div>

      {/* Statement paper */}
      <div className="max-w-2xl mx-auto bg-background border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Company header */}
        <div className="bg-foreground text-background px-8 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">
              Utility Management
            </p>
            <h1 className="text-lg font-bold">CityUtilities Corp.</h1>
            <p className="text-xs opacity-50 mt-0.5">123 Main St, Anytown, US 00000</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Invoice</p>
            <p className="font-mono text-sm">{bill.publicId}</p>
            <p className="text-xs opacity-50 mt-0.5">{formatDate(bill.dateCreated)}</p>
          </div>
        </div>

        {/* Customer + Summary bar */}
        <div className="px-8 py-4 border-b border-border flex items-start justify-between gap-4 flex-wrap bg-muted/20">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
              Service Address
            </p>
            <p className="text-sm font-medium">Apartment {bill.apartmentId}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Billing Period: {formatPeriod(bill.billingPeriod)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
              Amount Due
            </p>
            <p className="text-2xl font-bold tabular-nums">${bill.total.toFixed(2)}</p>
            <Badge
              variant="outline"
              className={`${STATUS_BADGE_CLASS[bill.state]} mt-1`}
            >
              {STATUS_LABELS[bill.state]}
            </Badge>
          </div>
        </div>

        {/* Line items */}
        <div className="px-8 py-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
            Service Detail
          </p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-medium text-muted-foreground">
                  Service
                </th>
                <th className="text-right py-2 text-xs font-medium text-muted-foreground">
                  Meter Reading
                </th>
                <th className="text-right py-2 text-xs font-medium text-muted-foreground">
                  Usage × Rate
                </th>
                <th className="text-right py-2 text-xs font-medium text-muted-foreground">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {bill.parameters.map((p, i) => (
                <tr
                  key={p.index}
                  className={`border-b border-border/30 ${
                    i % 2 === 1 ? "bg-muted/20" : ""
                  }`}
                >
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-1">
                      <span>{p.title}</span>
                      {p.isUncertain && (
                        <span className="text-amber-500 text-[10px]">*</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 text-right tabular-nums text-xs text-muted-foreground">
                    {p.previousValue.toLocaleString()} →{" "}
                    {p.value.toLocaleString()}
                  </td>
                  <td className="py-2 text-right tabular-nums text-xs text-muted-foreground">
                    {calcUsage(p).toLocaleString()} × ${p.price.toFixed(2)}
                  </td>
                  <td className="py-2 text-right tabular-nums font-medium">
                    ${calcAmount(p).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-foreground/30">
                <td colSpan={3} className="pt-3 pb-2 font-bold text-sm">
                  Total Amount Due
                </td>
                <td className="pt-3 pb-2 text-right font-bold tabular-nums">
                  ${bill.total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
          {bill.parameters.some((p) => p.isUncertain) && (
            <p className="text-[10px] text-amber-500 mt-2">
              * Estimated reading — actual usage may vary
            </p>
          )}
        </div>

        {/* Payment / Status section */}
        <div className="border-t-2 border-dashed border-border mx-8 py-4">
          {bill.state === BillStatusEnum.Created ? (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs font-medium">Ready to Pay</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pay by the due date to avoid late fees
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Download PDF
                </Button>
                <Button size="sm">Pay ${bill.total.toFixed(2)}</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={STATUS_BADGE_CLASS[bill.state]}>
                {STATUS_LABELS[bill.state]}
              </Badge>
              <p className="text-xs text-muted-foreground">
                This invoice has been {STATUS_LABELS[bill.state].toLowerCase()}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-muted/20 border-t border-border px-8 py-3 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            Thank you for choosing CityUtilities Corp.
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">{bill.publicId}</p>
        </div>
      </div>
    </div>
  );
}
