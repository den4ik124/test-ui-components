import { useMemo } from "react"
import type { BillData } from "../../models/BillData"
import { BillStatusEnum } from "../../models/BillStatusEnum"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@workspace/ui/components/context-menu"
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
  STATUS_DOT_CLASS,
} from "./shared"

const STATUS_SELECTED_CLASS: Record<BillStatusEnum, string> = {
  [BillStatusEnum.Created]:
    "bg-blue-50 border-l-2 border-blue-500 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100 dark:border-blue-400",
  [BillStatusEnum.Paid]:
    "bg-emerald-50 border-l-2 border-emerald-500 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100 dark:border-emerald-400",
  [BillStatusEnum.Confirmed]:
    "bg-violet-50 border-l-2 border-violet-500 text-violet-900 dark:bg-violet-950/30 dark:text-violet-100 dark:border-violet-400",
  [BillStatusEnum.Outdated]:
    "bg-gray-100 border-l-2 border-gray-400 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-500",
}

export function BillDetail({
  bill,
  prevBill,
}: {
  bill: BillData
  prevBill?: BillData
}) {
  const prevUsageMap = useMemo(() => {
    const map = new Map<string, number>()
    if (prevBill) {
      for (const p of prevBill.parameters) map.set(p.title ?? "", calcUsage(p))
    }
    return map
  }, [prevBill])

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs tracking-widest text-muted-foreground uppercase">
            Invoice {bill.publicId}
          </p>
          <h2 className="text-4xl font-light tracking-tight text-foreground">
            {formatPeriod(bill.billingPeriod)}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Issued {formatDate(bill.dateCreated)} · Apt {bill.apartmentId}
          </p>
        </div>
        <div className="text-right">
          <Badge
            variant="outline"
            className={`${STATUS_BADGE_CLASS[bill.state]} mb-2`}
          >
            {STATUS_LABELS[bill.state]}
          </Badge>
          <p className="text-5xl font-extralight text-foreground tabular-nums">
            ${bill.total.toFixed(2)}
          </p>
        </div>
      </div>

      <Separator className="mb-6" />

      <div className="overflow-hidden rounded-lg border border-border">
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
                      <span className="rounded bg-amber-100 px-1 text-[10px] text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                        est.
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-14 shrink-0 text-right text-muted-foreground tabular-nums">
                      {p.previousValue.toLocaleString()}
                    </span>
                    <span className="shrink-0 text-muted-foreground/40">→</span>
                    <span className="w-14 shrink-0 tabular-nums">
                      {p.value.toLocaleString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  <span>{calcUsage(p).toLocaleString()}</span>
                  {(() => {
                    const prev = prevUsageMap.get(p.title ?? "")
                    if (prev === undefined) return null
                    const delta = calcUsage(p) - prev
                    if (delta === 0) return null
                    return (
                      <span
                        className={`ml-1.5 text-xs font-normal ${delta > 0 ? "text-red-500" : "text-emerald-500"}`}
                      >
                        {delta > 0 ? "↑" : "↓"}
                        {Math.abs(delta).toLocaleString()}
                      </span>
                    )
                  })()}
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
              <TableCell colSpan={4} className="font-semibold">
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
        <>
          <Separator className="my-6" />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              Download PDF
            </Button>
            <Button className="flex-1">Pay Now</Button>
          </div>
        </>
      )}
    </div>
  )
}

// Scrollable bill list for a sidebar nav column.
// Uses flex-1 + overflow-y-auto internally; wrap in a flex-col container.
export function BillListNav({
  bills,
  selectedId,
  onSelect,
  onCopy,
  emptyLabel = "No bills yet",
}: {
  bills: BillData[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCopy?: (bill: BillData) => void
  emptyLabel?: string
}) {
  if (bills.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-3 py-8">
        <p className="text-center text-xs text-muted-foreground/50">
          {emptyLabel}
        </p>
      </div>
    )
  }

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="flex flex-col gap-0.5 px-2 py-2">
        {bills.map((bill, i) => {
          const year = bill.billingPeriod.slice(0, 4)
          const prevYear = i > 0 ? bills[i - 1].billingPeriod.slice(0, 4) : null
          const showYearSep = prevYear !== null && year !== prevYear
          const isSelected = bill.id === selectedId
          return (
            <div key={bill.id}>
              {showYearSep && (
                <div className="flex items-center gap-1.5 px-1 py-1.5">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                    {year}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
              <ContextMenu>
                <ContextMenuTrigger>
                  <button
                    onClick={() => onSelect(bill.id)}
                    className={`w-full rounded py-1.5 text-left text-sm transition-all ${
                      isSelected
                        ? `pr-1 pl-2 font-medium ${STATUS_SELECTED_CLASS[bill.state]}`
                        : "px-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[bill.state]}`}
                      />
                      {formatShortPeriod(bill.billingPeriod)}
                    </span>
                    <span className="mt-0.5 block pl-3 text-xs opacity-60">
                      ${bill.total.toFixed(2)}
                    </span>
                  </button>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-44">
                  <ContextMenuItem onClick={() => onSelect(bill.id)}>
                    View details
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => onCopy?.(bill)}>
                    Copy
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Full bills pane: nav list on left + detail on right.
// Pass className to control sizing of the outer wrapper.
export function BillsMasterDetail({
  bills,
  selectedBillId,
  onSelectBill,
  onCopyBill,
  navLabel = "Billing History",
}: {
  bills: BillData[]
  selectedBillId: string | null
  onSelectBill: (id: string) => void
  onCopyBill?: (bill: BillData) => void
  navLabel?: string
}) {
  const effectiveId =
    selectedBillId && bills.some((b) => b.id === selectedBillId)
      ? selectedBillId
      : (bills[0]?.id ?? null)

  const selectedBill = bills.find((b) => b.id === effectiveId)
  const selectedIdx = bills.findIndex((b) => b.id === effectiveId)
  const prevBill = bills[selectedIdx + 1]

  return (
    <div className="flex min-w-0 flex-1 overflow-hidden">
      {/* Nav */}
      <nav className="flex w-44 shrink-0 flex-col overflow-hidden border-r border-border">
        <div className="shrink-0 border-b border-border px-3 py-2.5">
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
            {navLabel}
          </p>
        </div>
        <BillListNav
          bills={bills}
          selectedId={effectiveId}
          onSelect={onSelectBill}
          onCopy={onCopyBill}
        />
        {bills.length > 0 && (
          <div className="shrink-0 border-t border-border px-3 py-2">
            <p className="text-center text-[10px] text-muted-foreground/40">
              {bills.length} {bills.length === 1 ? "bill" : "bills"}
            </p>
          </div>
        )}
      </nav>

      {/* Detail */}
      <main className="min-w-0 flex-1 overflow-hidden">
        {selectedBill ? (
          <ScrollArea className="h-full">
            <div className="px-8 py-8">
              <BillDetail bill={selectedBill} prevBill={prevBill} />
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {bills.length === 0 ? (
              <div className="text-center">
                <p className="mb-2 text-4xl">🧾</p>
                <p className="text-sm font-medium">No bills yet</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  This property has no billing history
                </p>
              </div>
            ) : (
              "Select a bill to view details"
            )}
          </div>
        )}
      </main>
    </div>
  )
}
