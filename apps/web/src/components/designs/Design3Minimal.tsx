import { useState, useMemo, useRef, useEffect } from "react"
import type { BillData } from "../../models/BillData"
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
  formatPeriod,
  formatShortPeriod,
  formatDate,
  calcUsage,
  calcAmount,
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
} from "./shared"

const BATCH_SIZE = 6

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

const sortedBills = [...dummyBills].sort((a, b) =>
  b.billingPeriod.localeCompare(a.billingPeriod)
)

function BillDetail({
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
            Issued {formatDate(bill.dateCreated)} &middot; Apt{" "}
            {bill.apartmentId}
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

export function Design3Minimal() {
  const [selectedId, setSelectedId] = useState(sortedBills[0].id)
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const visibleBills = useMemo(
    () => sortedBills.slice(0, visibleCount),
    [visibleCount]
  )

  const selected = sortedBills.find((b) => b.id === selectedId)!
  const selectedIndex = sortedBills.findIndex((b) => b.id === selectedId)
  // sortedBills is descending, so the chronologically previous bill is at index + 1
  const prevBill = sortedBills[selectedIndex + 1]
  const hasMore = visibleCount < sortedBills.length

  useEffect(() => {
    const sentinel = sentinelRef.current
    const nav = navRef.current
    if (!sentinel || !nav || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true)
          setTimeout(() => {
            setVisibleCount((c) => Math.min(c + BATCH_SIZE, sortedBills.length))
            setIsLoadingMore(false)
          }, 600)
        }
      },
      { root: nav, threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore])

  return (
    <div className="min-h-[calc(100vh-48px)] bg-background">
      <div className="mx-auto flex max-w-5xl gap-12 px-6 py-8">
        {/* Left nav — sticky, independently scrollable */}
        <nav
          ref={navRef}
          className="sticky top-12 max-h-[calc(100vh-80px)] w-40 shrink-0 self-start overflow-y-auto pt-1"
          style={{ scrollbarWidth: "none" }}
        >
          <p className="sticky top-0 z-10 mb-3 bg-background px-1 pb-1 text-[10px] tracking-widest text-muted-foreground uppercase">
            Billing History
          </p>

          <div className="flex flex-col gap-0.5">
            {visibleBills.map((bill, i) => {
              const year = bill.billingPeriod.slice(0, 4)
              const prevYear =
                i > 0 ? visibleBills[i - 1].billingPeriod.slice(0, 4) : null
              const showYearSep = prevYear !== null && year !== prevYear

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
                  <button
                    onClick={() => setSelectedId(bill.id)}
                    className={`w-full rounded py-1.5 text-left text-sm transition-all ${
                      bill.id === selectedId
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
                </div>
              )
            })}

            {/* Sentinel for infinite scroll */}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-3">
                {isLoadingMore ? (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                ) : (
                  <span className="text-[10px] text-muted-foreground/30">
                    ···
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="mt-2 px-1 text-center text-[10px] text-muted-foreground/40">
            {visibleBills.length} of {sortedBills.length}
          </p>
        </nav>

        <main className="min-w-0 flex-1">
          <BillDetail bill={selected} prevBill={prevBill} />
        </main>
      </div>
    </div>
  )
}
