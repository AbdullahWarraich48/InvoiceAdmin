import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { BillingCycle, HostingPlan } from "../types";
import { formatPrice, planPrice, yearlySavingsPercent } from "../utils";

interface Props {
  plan: HostingPlan;
  cycle: BillingCycle;
  onSelect: (plan: HostingPlan) => void;
  onViewDetails: (plan: HostingPlan) => void;
}

export function PricingCard({ plan, cycle, onSelect, onViewDetails }: Props) {
  const price = planPrice(plan, cycle);
  const yearlySavings = yearlySavingsPercent(plan);
  const featured = !!plan.featured;

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
      <Card className={`h-full rounded-2xl border ${featured ? "border-teal-400/70 shadow-xl shadow-teal-500/10" : "shadow-md"} bg-card`}>
        <CardHeader className={featured ? "bg-gradient-to-br from-teal-500/10 via-emerald-500/10 to-purple-500/10 rounded-t-2xl" : ""}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            {featured && <span className="rounded-full bg-teal-500 px-2.5 py-1 text-xs font-medium text-white">Most Popular</span>}
          </div>
          <p className="text-sm text-muted-foreground">{plan.tagline}</p>
          <div className="pt-2">
            <p className="text-sm text-muted-foreground line-through">{formatPrice(plan.prices.yearlyOriginal)}/mo</p>
            <p className="text-3xl font-bold tracking-tight">
              {formatPrice(price)}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
            {cycle === "yearly" && <p className="text-xs text-emerald-600">Save {yearlySavings}% with yearly billing</p>}
            <p className="pt-1 text-xs text-muted-foreground">Renews at {formatPrice(plan.prices.renewalMonthly)}/mo</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          {plan.features.slice(0, 5).map((feature) => (
            <p key={feature.label} className="text-sm">
              <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>{feature.included ? "✓" : "—"} {feature.label}</span>
            </p>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => onSelect(plan)}>{plan.ctaLabel}</Button>
          <Button variant="ghost" className="w-full" onClick={() => onViewDetails(plan)}>View details</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

