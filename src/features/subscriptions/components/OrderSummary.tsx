import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AddOnItem, BillingCycle, HostingPlan } from "../types";
import { computeLateFee, formatPrice, planPrice } from "../utils";

interface Props {
  plan: HostingPlan;
  cycle: BillingCycle;
  selectedAddOns: string[];
  addOns: AddOnItem[];
  promoCode: string;
  taxRate: number;
  autoRenew: boolean;
  dueDate?: string;
}

export function OrderSummary({ plan, cycle, selectedAddOns, addOns, promoCode, taxRate, autoRenew, dueDate }: Props) {
  const base = planPrice(plan, cycle) * (cycle === "yearly" ? 12 : 1);
  const addOnTotal = selectedAddOns.reduce((sum, id) => {
    const item = addOns.find((a) => a.id === id);
    if (!item) return sum;
    return sum + (cycle === "yearly" ? item.yearlyPrice : item.monthlyPrice);
  }, 0);
  const discount = promoCode.toLowerCase() === "startup20" ? (base + addOnTotal) * 0.2 : 0;
  const subtotal = base + addOnTotal - discount;
  const lateFee = computeLateFee(subtotal, dueDate);
  const taxable = subtotal + lateFee;
  const tax = taxable * taxRate;
  const total = taxable + tax;

  return (
    <Card className="sticky top-20 rounded-2xl">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">{plan.name} ({cycle})</span><span>{formatPrice(base)}</span></div>
        {selectedAddOns.map((id) => {
          const item = addOns.find((addon) => addon.id === id);
          if (!item) return null;
          const value = cycle === "yearly" ? item.yearlyPrice : item.monthlyPrice;
          return <div key={id} className="flex justify-between"><span className="text-muted-foreground">{item.name}</span><span>{formatPrice(value)}</span></div>;
        })}
        {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Promo discount</span><span>-{formatPrice(discount)}</span></div>}
        {lateFee > 0 && <div className="flex justify-between text-amber-700"><span>Late fee</span><span>{formatPrice(lateFee)}</span></div>}
        <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatPrice(tax)}</span></div>
        {dueDate && <div className="flex justify-between"><span className="text-muted-foreground">Due date</span><span>{dueDate}</span></div>}
        <div className="border-t pt-2 text-base font-semibold flex justify-between"><span>Total</span><span>{formatPrice(total)}</span></div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Auto renew</span>
          <span className={autoRenew ? "text-emerald-600" : "text-muted-foreground"}>{autoRenew ? "Enabled" : "Disabled"}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {autoRenew ? "Subscription renews automatically unless canceled." : "Subscription will end at period completion unless renewed manually."} Renewal pricing may differ.
        </p>
      </CardContent>
    </Card>
  );
}

