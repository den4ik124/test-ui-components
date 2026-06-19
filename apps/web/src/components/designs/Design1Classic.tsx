import { useState, useMemo } from "react"
import type { BillData } from "../../models/BillData"
import { BillStatusEnum } from "../../models/BillStatusEnum"
import { dummyBills } from "../../data/billDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  formatPeriod,
  formatShortPeriod,
  formatDate,
  calcUsage,
  calcAmount,
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
} from "./shared"

const BILLS_PER_PAGE = 6

const sortedBills = [...dummyBills].sort((a, b) =>
  b.billingPeriod.localeCompare(a.billingPeriod)
)

function StatusBadge({ state }: { state: BillStatusEnum }) {
  return (
    <Badge variant="outline" className={STATUS_BADGE_CLASS[state]}>
      {STATUS_LABELS[state]}
    </Badge>
  )
}

function BillListItem({
  bill,
  selected,
  onClick,
}: {
  bill: BillData
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg px-3 py-2.5 text-left transition-all hover:bg-accent ${
        selected ? "bg-accent ring-1 ring-primary/30" : ""
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">
          {formatShortPeriod(bill.billingPeriod)}
        </span>
        <StatusBadge state={bill.state} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{bill.publicId}</span>
        <span className="text-sm font-bold text-foreground">
          ${bill.total.toFixed(2)}
        </span>
      </div>
    </button>
  )
}

function BillDetail({ bill }: { bill: BillData }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-foreground">
              {formatPeriod(bill.billingPeriod)}
            </h2>
            <StatusBadge state={bill.state} />
          </div>
          <p className="text-sm text-muted-foreground">
            {bill.publicId} &middot; Apt {bill.apartmentId}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Issued {formatDate(bill.dateCreated)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Total Due
          </p>
          <p className="text-3xl font-bold text-foreground">
            ${bill.total.toFixed(2)}
          </p>
        </div>
      </div>

      <Separator />

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Previous</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Usage</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bill.parameters.map((p) => (
              <TableRow key={p.index}>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{p.title}</span>
                      {p.isUncertain && (
                        <span className="rounded bg-amber-100 px-1 text-[10px] text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                          est.
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-xs text-muted-foreground">
                        {p.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {p.previousValue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {p.value.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {calcUsage(p).toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  ${p.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  ${calcAmount(p).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="font-semibold">
                Total
              </TableCell>
              <TableCell className="text-right font-bold tabular-nums">
                ${bill.total.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {bill.state === BillStatusEnum.Created && (
        <div className="flex justify-end gap-2">
          <Button variant="outline">Download PDF</Button>
          <Button>Pay ${bill.total.toFixed(2)}</Button>
        </div>
      )}
    </div>
  )
}

export function Design1Classic() {
  const [selectedId, setSelectedId] = useState(sortedBills[0].id)
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(sortedBills.length / BILLS_PER_PAGE)
  const pageBills = useMemo(
    () => sortedBills.slice(page * BILLS_PER_PAGE, (page + 1) * BILLS_PER_PAGE),
    [page]
  )

  const selected = sortedBills.find((b) => b.id === selectedId)!

  function goToPage(next: number) {
    setPage(next)
    setSelectedId(sortedBills[next * BILLS_PER_PAGE].id)
  }

  const outstanding = sortedBills
    .filter((b) => b.state === BillStatusEnum.Created)
    .reduce((s, b) => s + b.total, 0)

  return (
    <div className="flex min-h-[calc(100vh-48px)] bg-background">
      {/* Sidebar */}
      <aside className="flex w-72 flex-col border-r border-border">
        <div className="border-b border-border p-4">
          <h1 className="text-lg font-bold text-foreground">Utility Bills</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Apartment {sortedBills[0].apartmentId} &middot; {sortedBills.length}{" "}
            invoices
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {pageBills.map((bill) => (
              <BillListItem
                key={bill.id}
                bill={bill}
                selected={bill.id === selectedId}
                onClick={() => setSelectedId(bill.id)}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 0}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                className={`size-6 rounded text-xs font-medium transition-colors ${
                  i === page
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next →
          </button>
        </div>

        {/* Summary card */}
        <div className="border-t border-border p-3">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>
                {sortedBills.length} invoices total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Outstanding:{" "}
                <span className="font-semibold text-foreground">
                  ${outstanding.toFixed(2)}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <BillDetail bill={selected} />
      </main>
    </div>
  )
}
