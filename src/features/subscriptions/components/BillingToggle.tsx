import { motion } from "framer-motion";
import type { BillingCycle } from "../types";

interface Props {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}

export function BillingToggle({ cycle, onChange }: Props) {
  return (
    <div className="inline-flex rounded-2xl border bg-muted/40 p-1">
      {(["monthly", "yearly"] as BillingCycle[]).map((option) => {
        const active = cycle === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`relative rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${active ? "text-foreground" : "text-muted-foreground"}`}
          >
            {active && (
              <motion.span
                layoutId="billing-toggle-bg"
                className="absolute inset-0 rounded-xl bg-background shadow-sm"
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {option}
              {option === "yearly" && <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600">Save up to 45%</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

