import {
  dummyMainStats,
  dummyHostStats,
  dummyTenantStats,
} from "../../data/statisticsDummyData"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function formatPeriod(p: string) {
  const [year, month] = p.split("-")
  if (!month) return year
  return new Date(Number(year), Number(month) - 1).toLocaleString("default", {
    month: "short",
    year: "2-digit",
  })
}

export function StatsDesign1Dashboard() {
  const main = dummyMainStats
  const host = dummyHostStats
  const tenant = dummyTenantStats

  const revenueEntries = Object.entries(host.apartmentsRevenue ?? {}).sort(
    (a, b) => b[1] - a[1]
  )
  const totalRevenue = revenueEntries.reduce((s, [, v]) => s + v, 0)

  const paidEntries = Object.entries(tenant.totalPaid ?? {}).sort((a, b) =>
    a[0].localeCompare(b[0])
  )
  const unpaidEntries = Object.entries(tenant.totalUnpaid ?? {})
  const avgEntries = Object.entries(tenant.averageMonthlyBill ?? {})

  return (
    <ScrollArea className="h-[calc(100svh-49px)]">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
        {/* Platform stats */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">
            Platform Overview
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Apartments" value={main.totalApartments} />
            <StatCard label="Bills" value={main.totalBiils} />
            <StatCard label="Parameters" value={main.totalParameters} />
            <StatCard label="Subscriptions" value={main.totalSubscriptions} />
            <StatCard
              label="Total Revenue"
              value={`$${main.totalRevenue.toLocaleString()}`}
              sub="All time"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Last updated: {new Date(main.lastUpdated).toLocaleString()}
          </p>
        </section>

        <Separator />

        {/* Host stats */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">
            Host Dashboard
          </h2>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <StatCard label="Properties" value={host.totalApartments} />
            <StatCard label="Open Bills" value={host.openBiils} />
            <StatCard label="Completed Bills" value={host.completedBiils} />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Revenue by Property (Annual)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {revenueEntries.map(([id, amount]) => {
                const pct = (amount / totalRevenue) * 100
                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0"
                  >
                    <span className="w-24 shrink-0 text-sm text-foreground">
                      {id}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-20 text-right font-mono text-sm font-semibold text-foreground">
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                )
              })}
              <div className="flex justify-between bg-muted/30 px-4 py-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Total
                </span>
                <span className="text-sm font-bold text-foreground">
                  ${totalRevenue.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Tenant stats */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">
            Tenant Billing Summary
          </h2>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Paid Bills" value={tenant.paidBillsCount} />
            {avgEntries.map(([year, avg]) => (
              <StatCard
                key={year}
                label={`Avg Monthly (${year})`}
                value={`$${avg.toFixed(2)}`}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Unpaid */}
            {unpaidEntries.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-600 dark:text-amber-400">
                    Unpaid Bills
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {unpaidEntries.map(([period, amount]) => (
                    <div
                      key={period}
                      className="flex items-center justify-between border-b border-border px-4 py-2 text-sm last:border-0"
                    >
                      <span className="text-muted-foreground">
                        {formatPeriod(period)}
                      </span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        ${amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Paid history */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Payment History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {[...paidEntries]
                  .reverse()
                  .slice(0, 8)
                  .map(([period, amount]) => (
                    <div
                      key={period}
                      className="flex items-center justify-between border-b border-border px-4 py-2 text-sm last:border-0"
                    >
                      <span className="text-muted-foreground">
                        {formatPeriod(period)}
                      </span>
                      <span className="font-semibold text-foreground">
                        ${amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </ScrollArea>
  )
}
