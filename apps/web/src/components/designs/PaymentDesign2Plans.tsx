import { dummyProducts, dummySubscription } from "../../data/paymentDummyData";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import type { Product } from "../../models/payment";

const PLAN_ACCENT: Record<string, string> = {
  Free:     "border-gray-200 dark:border-gray-700",
  Pro:      "border-blue-400 dark:border-blue-600 ring-1 ring-blue-400/30",
  Premium:  "border-violet-400 dark:border-violet-600 ring-1 ring-violet-400/30",
  Tenant:   "border-emerald-400 dark:border-emerald-600",
};

const PLAN_BADGE: Record<string, string> = {
  Free:    "bg-gray-100 text-gray-600 border-gray-200",
  Pro:     "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
  Premium: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300",
  Tenant:  "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function PlanCard({ product, isCurrent }: { product: Product; isCurrent: boolean }) {
  const price = product.priceInCents / 100;
  const accent = PLAN_ACCENT[product.plan] ?? "";
  const badgeClass = PLAN_BADGE[product.plan] ?? "";

  return (
    <Card className={`flex flex-col relative ${accent}`}>
      {isCurrent && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <Badge className="bg-foreground text-background border-0 text-[10px] px-2">Current plan</Badge>
        </div>
      )}

      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{product.title}</CardTitle>
          <Badge variant="outline" className={badgeClass}>{product.plan}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex items-end gap-1">
          {price === 0 ? (
            <span className="text-3xl font-bold text-foreground">Free</span>
          ) : (
            <>
              <span className="text-3xl font-bold text-foreground">${price.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground pb-0.5">/ month</span>
            </>
          )}
        </div>

        {product.trialPeriod > 0 && (
          <p className="text-xs text-muted-foreground -mt-2">
            {product.trialPeriod}-day free trial included
          </p>
        )}

        <Separator />

        <ul className="flex flex-col gap-2 flex-1">
          {(product.features ?? []).map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-foreground">
              <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <button
          className={`w-full rounded-lg py-2 text-sm font-medium transition-colors mt-auto ${
            isCurrent
              ? "bg-muted text-muted-foreground cursor-default"
              : "bg-foreground text-background hover:bg-foreground/90"
          }`}
          disabled={isCurrent}
        >
          {isCurrent ? "Current plan" : price === 0 ? "Downgrade" : "Upgrade"}
        </button>
      </CardContent>
    </Card>
  );
}

export function PaymentDesign2Plans() {
  const currentPlan = dummySubscription.plan;

  return (
    <ScrollArea className="h-[calc(100svh-49px)]">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Plans & Pricing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            You are on the <strong>{currentPlan}</strong> plan. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dummyProducts.map((p) => (
            <PlanCard
              key={p.id}
              product={p}
              isCurrent={p.plan === currentPlan}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          All prices in USD. Billed monthly. Cancel anytime.
          Annual billing available for 20% off.
        </p>
      </div>
    </ScrollArea>
  );
}
