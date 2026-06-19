import { dummyApartments } from "../../data/apartmentDummyData";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import type { ApartmentResponse } from "../../models/apartment";

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };

function sym(apt: ApartmentResponse) {
  return CURRENCY_SYMBOLS[apt.currency.shortName ?? ""] ?? apt.currency.shortName ?? "";
}

function ApartmentCard({ apt }: { apt: ApartmentResponse }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base leading-tight">{apt.title ?? apt.id}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{apt.id}</p>
          </div>
          <Badge
            variant="outline"
            className={apt.isSelfManaged
              ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 shrink-0"
              : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 shrink-0"
            }
          >
            {apt.isSelfManaged ? "Self" : "Managed"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <span className="text-muted-foreground text-xs">Monthly Rent</span>
          <span className="text-2xl font-bold text-foreground">
            {sym(apt)}{apt.rentPrice.toLocaleString()}
          </span>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="text-muted-foreground">Lease period</div>
          <div className="text-right font-medium text-foreground">{apt.rentalPeriodMonths} mo</div>
          <div className="text-muted-foreground">Deposit</div>
          <div className="text-right font-medium text-foreground">{apt.depositMonths} month{apt.depositMonths > 1 ? "s" : ""}</div>
          <div className="text-muted-foreground">Currency</div>
          <div className="text-right font-medium text-foreground">{apt.currency.shortName}</div>
          <div className="text-muted-foreground">Parameters</div>
          <div className="text-right font-medium text-foreground">
            {apt.template ? apt.template.length : "—"}
          </div>
        </div>

        {apt.bankAccountNumber && (
          <>
            <Separator />
            <div className="text-xs">
              <p className="text-muted-foreground mb-1">IBAN</p>
              <p className="font-mono text-foreground break-all">{apt.bankAccountNumber}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ApartmentDesign2Cards() {
  return (
    <ScrollArea className="h-[calc(100svh-49px)]">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">{dummyApartments.length} apartments under management</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dummyApartments.map((apt) => (
            <ApartmentCard key={apt.id} apt={apt} />
          ))}
        </div>

        {/* Summary footer */}
        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{dummyApartments.length}</p>
            <p className="text-xs text-muted-foreground">Total Properties</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {dummyApartments.filter((a) => !a.isSelfManaged).length}
            </p>
            <p className="text-xs text-muted-foreground">Managed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {dummyApartments.filter((a) => a.isSelfManaged).length}
            </p>
            <p className="text-xs text-muted-foreground">Self-managed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              ${ dummyApartments
                  .filter((a) => a.currency.shortName === "USD")
                  .reduce((s, a) => s + a.rentPrice, 0)
                  .toLocaleString() }
            </p>
            <p className="text-xs text-muted-foreground">Total USD Rent/mo</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
