import { useState } from "react";
import { Design1Classic } from "./components/designs/Design1Classic";
import { Design2Table } from "./components/designs/Design2Table";
import { Design3Minimal } from "./components/designs/Design3Minimal";
import { Design4Cards } from "./components/designs/Design4Cards";
import { Design5Calendar } from "./components/designs/Design5Calendar";
import { Design6Ledger } from "./components/designs/Design6Ledger";
import { Design7Analytics } from "./components/designs/Design7Analytics";
import { Design8ThreePane } from "./components/designs/Design8ThreePane";
import { Design9Stepper } from "./components/designs/Design9Stepper";
import { Design10Statement } from "./components/designs/Design10Statement";

const DESIGNS = [
  { id: "1",  label: "1 Classic",    Component: Design1Classic },
  { id: "2",  label: "2 Table",      Component: Design2Table },
  { id: "3",  label: "3 Minimal",    Component: Design3Minimal },
  { id: "4",  label: "4 Cards",      Component: Design4Cards },
  { id: "5",  label: "5 Calendar",   Component: Design5Calendar },
  { id: "6",  label: "6 Ledger",     Component: Design6Ledger },
  { id: "7",  label: "7 Analytics",  Component: Design7Analytics },
  { id: "8",  label: "8 Three Pane", Component: Design8ThreePane },
  { id: "9",  label: "9 Stepper",    Component: Design9Stepper },
  { id: "10", label: "10 Statement", Component: Design10Statement },
];

export function App() {
  const [activeId, setActiveId] = useState("1");
  const active = DESIGNS.find((d) => d.id === activeId)!;
  const { Component } = active;

  return (
    <div className="flex flex-col min-h-svh bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <div className="flex gap-1 overflow-x-auto px-2 py-1.5 scrollbar-none">
          {DESIGNS.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveId(d.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                d.id === activeId
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {d.label}
            </button>
          ))}
          <div className="ml-auto shrink-0 flex items-center pr-1">
            <span className="text-[10px] text-muted-foreground/50 font-mono">
              press d = dark
            </span>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Component />
      </main>
    </div>
  );
}
