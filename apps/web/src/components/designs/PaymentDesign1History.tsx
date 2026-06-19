import { dummyPaymentHistory, dummySubscription } from "../../data/paymentDummyData";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("default", { year: "numeric", month: "short", day: "numeric" });
}

export function PaymentDesign1History() {
  const sub = dummySubscription;
  const product = sub.product;

  const totalPaid = dummyPaymentHistory.reduce((s, p) => s + p.amount, 0);
  const paidPayments = dummyPaymentHistory.filter((p) => p.amount > 0);

  return (
    <ScrollArea className="h-[calc(100svh-49px)]">
      <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
        {/* Active subscription card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Current Subscription</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{product.title}</p>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 text-sm px-3 py-1">
                Active
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Monthly price</p>
                <p className="font-semibold text-foreground">${(product.priceInCents / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Started</p>
                <p className="font-semibold text-foreground">{formatDate(sub.dateCreated)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Renews</p>
                <p className="font-semibold text-foreground">{sub.expiredAt ? formatDate(sub.expiredAt) : "—"}</p>
              </div>
            </div>

            {product.features && product.features.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Included features</p>
                  <ul className="flex flex-col gap-1">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <span className="text-emerald-500">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Payments", value: paidPayments.length },
            { label: "Total Paid", value: `$${totalPaid.toFixed(2)}` },
            { label: "Avg / Month", value: `$${(totalPaid / Math.max(paidPayments.length, 1)).toFixed(2)}` },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* History table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-b-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyPaymentHistory.map((p, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 text-foreground">{formatDate(p.date)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-foreground">
                        {p.amount === 0 ? "Free trial" : `$${p.amount.toFixed(2)}`}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge variant="outline" className={
                          p.amount === 0
                            ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
                        }>
                          {p.amount === 0 ? "Trial" : "Paid"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
