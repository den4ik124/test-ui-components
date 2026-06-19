import { useState } from "react";
import { dummyApartments, dummyTenants } from "../../data/apartmentDummyData";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import type { ApartmentResponse } from "../../models/apartment";

function ApartmentRow({
  apt,
  selected,
  onClick,
}: {
  apt: ApartmentResponse;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg px-3 py-3 text-left transition-all hover:bg-accent ${
        selected ? "bg-accent ring-1 ring-primary/30" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-semibold text-sm text-foreground truncate">{apt.title ?? apt.id}</span>
        <Badge variant="outline" className={apt.isSelfManaged
          ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300"
          : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
        }>
          {apt.isSelfManaged ? "Self-managed" : "Managed"}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{apt.id}</span>
        <span className="text-sm font-bold text-foreground">
          {apt.currency.shortName} {apt.rentPrice.toLocaleString()}/mo
        </span>
      </div>
    </button>
  );
}

function ApartmentDetail({ apt }: { apt: ApartmentResponse }) {
  const tenantCount = dummyTenants.filter(
    (t) => t.state === "Active"
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-0.5">{apt.title ?? apt.id}</h2>
        <p className="text-sm text-muted-foreground">{apt.id} &middot; {apt.isSelfManaged ? "Self-managed" : "Managed by host"}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Rent",       value: `${apt.currency.shortName} ${apt.rentPrice.toLocaleString()}/mo` },
          { label: "Lease",      value: `${apt.rentalPeriodMonths} months` },
          { label: "Deposit",    value: `${apt.depositMonths} month${apt.depositMonths > 1 ? "s" : ""}` },
          { label: "Currency",   value: apt.currency.shortName ?? String(apt.currency.code) },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="text-sm font-semibold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {apt.bankAccountNumber && (
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground mb-1">Bank Account (IBAN)</p>
          <p className="text-sm font-mono text-foreground">{apt.bankAccountNumber}</p>
        </div>
      )}

      {apt.template && apt.template.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Bill Parameter Template</h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Parameter</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Rate</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Unit</th>
                </tr>
              </thead>
              <tbody>
                {apt.template.map((t, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-foreground">{t.title}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">{t.valuePerUnit.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{t.unitName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApartmentDesign1List() {
  const [selectedId, setSelectedId] = useState(dummyApartments[0].id);
  const selected = dummyApartments.find((a) => a.id === selectedId)!;

  return (
    <div className="flex h-[calc(100svh-49px)]">
      {/* Sidebar list */}
      <aside className="w-64 shrink-0 border-r border-border flex flex-col">
        <div className="px-3 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Apartments</h2>
          <p className="text-xs text-muted-foreground">{dummyApartments.length} properties</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {dummyApartments.map((apt) => (
              <ApartmentRow
                key={apt.id}
                apt={apt}
                selected={apt.id === selectedId}
                onClick={() => setSelectedId(apt.id)}
              />
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Detail */}
      <main className="flex-1 overflow-auto">
        <ScrollArea className="h-full">
          <div className="p-6 max-w-2xl">
            <ApartmentDetail apt={selected} />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
