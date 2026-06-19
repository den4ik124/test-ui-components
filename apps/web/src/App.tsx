import { useState } from "react"

// Bills
import { Design1Classic } from "./components/designs/Design1Classic"
// import { Design2Table } from "./components/designs/Design2Table";
import { Design3Minimal } from "./components/designs/Design3Minimal"
// import { Design4Cards } from "./components/designs/Design4Cards";
// import { Design5Calendar } from "./components/designs/Design5Calendar";
// import { Design6Ledger } from "./components/designs/Design6Ledger";
// import { Design7Analytics } from "./components/designs/Design7Analytics";
// import { Design8ThreePane } from "./components/designs/Design8ThreePane";
// import { Design9Stepper } from "./components/designs/Design9Stepper";
// import { Design10Statement } from "./components/designs/Design10Statement";

// Apartments
import { ApartmentDesign1List } from "./components/designs/ApartmentDesign1List"
import { ApartmentDesign2Cards } from "./components/designs/ApartmentDesign2Cards"
import { ApartmentBillsPage } from "./components/designs/ApartmentBillsPage"

// Issues
import { IssueDesign1Board } from "./components/designs/IssueDesign1Board"
import { IssueDesign2List } from "./components/designs/IssueDesign2List"

// Notifications
import { NotificationDesign1Feed } from "./components/designs/NotificationDesign1Feed"

// Payments
import { PaymentDesign1History } from "./components/designs/PaymentDesign1History"
import { PaymentDesign2Plans } from "./components/designs/PaymentDesign2Plans"

// Statistics
import { StatsDesign1Dashboard } from "./components/designs/StatsDesign1Dashboard"

// Audit
import { AuditDesign1Log } from "./components/designs/AuditDesign1Log"

type DesignEntry = { id: string; label: string; Component: React.ComponentType }
type Category = {
  id: string
  label: string
  icon: string
  designs: DesignEntry[]
}

const CATEGORIES: Category[] = [
  {
    id: "bills",
    label: "Bills",
    icon: "🧾",
    designs: [
      { id: "b1", label: "Minimal", Component: Design3Minimal },
      { id: "b2", label: "Classic", Component: Design1Classic },
      // { id: "b3",  label: "Table",      Component: Design2Table },
      // { id: "b4",  label: "Cards",      Component: Design4Cards },
      // { id: "b5",  label: "Calendar",   Component: Design5Calendar },
      // { id: "b6",  label: "Ledger",     Component: Design6Ledger },
      // { id: "b7",  label: "Analytics",  Component: Design7Analytics },
      // { id: "b8",  label: "Three Pane", Component: Design8ThreePane },
      // { id: "b9",  label: "Stepper",    Component: Design9Stepper },
      // { id: "b10", label: "Statement",  Component: Design10Statement },
    ],
  },
  {
    id: "apartments",
    label: "Apartments",
    icon: "🏠",
    designs: [
      { id: "a1", label: "List", Component: ApartmentDesign1List },
      { id: "a2", label: "Cards", Component: ApartmentDesign2Cards },
      { id: "a3", label: "Bills", Component: ApartmentBillsPage },
    ],
  },
  {
    id: "issues",
    label: "Issues",
    icon: "🐛",
    designs: [
      { id: "i1", label: "Board", Component: IssueDesign1Board },
      { id: "i2", label: "List", Component: IssueDesign2List },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "🔔",
    designs: [{ id: "n1", label: "Feed", Component: NotificationDesign1Feed }],
  },
  {
    id: "payments",
    label: "Payments",
    icon: "💳",
    designs: [
      { id: "p1", label: "History", Component: PaymentDesign1History },
      { id: "p2", label: "Plans", Component: PaymentDesign2Plans },
    ],
  },
  {
    id: "statistics",
    label: "Statistics",
    icon: "📊",
    designs: [
      { id: "s1", label: "Dashboard", Component: StatsDesign1Dashboard },
    ],
  },
  {
    id: "audit",
    label: "Audit Logs",
    icon: "📋",
    designs: [{ id: "au1", label: "Log", Component: AuditDesign1Log }],
  },
]

export function App() {
  const [activeCategoryId, setActiveCategoryId] = useState(CATEGORIES[0].id)
  const [activeDesignId, setActiveDesignId] = useState(
    CATEGORIES[0].designs[0].id
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const activeCategory = CATEGORIES.find((c) => c.id === activeCategoryId)!
  const activeDesign =
    activeCategory.designs.find((d) => d.id === activeDesignId) ??
    activeCategory.designs[0]
  const { Component } = activeDesign

  function selectCategory(catId: string) {
    const cat = CATEGORIES.find((c) => c.id === catId)!
    setActiveCategoryId(catId)
    setActiveDesignId(cat.designs[0].id)
  }

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`flex shrink-0 flex-col border-r border-border bg-background transition-all duration-200 ${
          sidebarOpen ? "w-48" : "w-12"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-border px-3 py-3">
          {sidebarOpen && (
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Sections
            </span>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="ml-auto rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Category list */}
        <nav className="flex-1 overflow-y-auto py-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                cat.id === activeCategoryId
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
              title={!sidebarOpen ? cat.label : undefined}
            >
              <span className="shrink-0 text-base">{cat.icon}</span>
              {sidebarOpen && (
                <span className="truncate text-sm">{cat.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Dark mode hint */}
        {sidebarOpen && (
          <div className="border-t border-border px-3 py-2">
            <span className="font-mono text-[10px] text-muted-foreground/50">
              press d = dark
            </span>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Design sub-nav */}
        {activeCategory.designs.length > 1 && (
          <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
            <div className="flex scrollbar-none gap-1 overflow-x-auto px-2 py-1.5">
              <span className="mr-1 flex shrink-0 items-center px-1 text-xs text-muted-foreground/60">
                {activeCategory.icon} {activeCategory.label}:
              </span>
              {activeCategory.designs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveDesignId(d.id)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                    d.id === activeDesign.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </nav>
        )}

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          <Component />
        </main>
      </div>
    </div>
  )
}
