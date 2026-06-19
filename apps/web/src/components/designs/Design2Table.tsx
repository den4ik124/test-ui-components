import { useState } from "react"
import { BillStatusEnum } from "../../models/BillStatusEnum"
import { dummyBills } from "../../data/billDummyData"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet"
import {
  formatPeriod,
  formatDate,
  calcUsage,
  calcAmount,
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
} from "./shared"

const sortedBills = [...dummyBills].sort((a, b) =>
  b.billingPeriod.localeCompare(a.billingPeriod)
)

type Filter = BillStatusEnum | "all"

const FILTER_OPTIONS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  {
    label: STATUS_LABELS[BillStatusEnum.Created],
    value: BillStatusEnum.Created,
  },
  {
    label: STATUS_LABELS[BillStatusEnum.Confirmed],
    value: BillStatusEnum.Confirmed,
  },
  { label: STATUS_LABELS[BillStatusEnum.Paid], value: BillStatusEnum.Paid },
  {
    label: STATUS_LABELS[BillStatusEnum.Outdated],
    value: BillStatusEnum.Outdated,
  },
]

export function Design2Table() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")

  const filtered =
    filter === "all"
      ? sortedBills
      : sortedBills.filter((b) => b.state === filter)

  const selected = selectedId
    ? (sortedBills.find((b) => b.id === selectedId) ?? null)
    : null

  const outstanding = sortedBills
    .filter((b) => b.state === BillStatusEnum.Created)
    .reduce((s, b) => s + b.total, 0)

  return (
    <div className="flex min-h-[calc(100vh-48px)] flex-col bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 border-b border-border px-6 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setFilter(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === opt.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
              <span className="ml-1 opacity-50">
                (
                {opt.value === "all"
                  ? sortedBills.length
                  : sortedBills.filter((b) => b.state === opt.value).length}
                )
              </span>
            </button>
          ))}
        </div>
        <div className="ml-auto shrink-0 text-xs text-muted-foreground">
          Outstanding:{" "}
          <span className="font-semibold text-foreground">
            ${outstanding.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 py-4">
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead className="text-center">Services</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((bill) => (
                <TableRow
                  key={bill.id}
                  onClick={() => setSelectedId(bill.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">
                    {formatPeriod(bill.billingPeriod)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {bill.publicId}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(bill.dateCreated)}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {bill.parameters.length}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_BADGE_CLASS[bill.state]}
                    >
                      {STATUS_LABELS[bill.state]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    ${bill.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-2 px-0.5 text-xs text-muted-foreground">
          Showing {filtered.length} of {sortedBills.length} invoices
        </p>
      </div>

      {/* Slide-out detail */}
      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      >
        <SheetContent
          className="w-[min(580px,100vw)] overflow-y-auto"
          side="right"
        >
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex flex-wrap items-center gap-2 pr-8">
                  {formatPeriod(selected.billingPeriod)}
                  <Badge
                    variant="outline"
                    className={STATUS_BADGE_CLASS[selected.state]}
                  >
                    {STATUS_LABELS[selected.state]}
                  </Badge>
                </SheetTitle>
                <SheetDescription>
                  {selected.publicId} · Apt {selected.apartmentId} · Issued{" "}
                  {formatDate(selected.dateCreated)}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-4 px-4 pb-4">
                <div className="overflow-hidden rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Usage</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected.parameters.map((p) => (
                        <TableRow key={p.index}>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{p.title}</span>
                              {p.isUncertain && (
                                <span className="rounded bg-amber-100 px-1 text-[10px] text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                  est.
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {p.previousValue.toLocaleString()} →{" "}
                              {p.value.toLocaleString()}
                            </p>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                            {calcUsage(p).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                            ${p.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium tabular-nums">
                            ${calcAmount(p).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="font-semibold">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold tabular-nums">
                          ${selected.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>

                {selected.state === BillStatusEnum.Created && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
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
  )
}
