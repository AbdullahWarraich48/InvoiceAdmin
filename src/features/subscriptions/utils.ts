import type { BillingCycle, HostingPlan } from "./types";

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

export const planPrice = (plan: HostingPlan, cycle: BillingCycle) =>
  cycle === "monthly" ? plan.prices.monthly : plan.prices.yearly;

export const yearlySavingsPercent = (plan: HostingPlan) => {
  const originalYearly = plan.prices.yearlyOriginal * 12;
  const discountedYearly = plan.prices.yearly * 12;
  if (!originalYearly) return 0;
  return Math.round(((originalYearly - discountedYearly) / originalYearly) * 100);
};

export const addOnsTotal = (
  selectedAddOnIds: string[],
  cycle: BillingCycle,
  addOns: { id: string; monthlyPrice: number; yearlyPrice: number }[]
) =>
  selectedAddOnIds.reduce((sum, id) => {
    const addOn = addOns.find((item) => item.id === id);
    if (!addOn) return sum;
    return sum + (cycle === "monthly" ? addOn.monthlyPrice : addOn.yearlyPrice);
  }, 0);

export const parseDateOnly = (yyyyMmDd?: string) => {
  if (!yyyyMmDd) return null;
  const [y, m, d] = yyyyMmDd.split("-").map((x) => Number(x));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  dt.setHours(0, 0, 0, 0);
  return dt;
};

export const startOfToday = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};

export const daysUntil = (yyyyMmDd?: string) => {
  const dt = parseDateOnly(yyyyMmDd);
  if (!dt) return null;
  const today = startOfToday();
  const diffMs = dt.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const isOverdue = (yyyyMmDd?: string) => {
  const d = daysUntil(yyyyMmDd);
  if (d === null) return false;
  return d < 0;
};

export const computeLateFee = (subtotal: number, yyyyMmDd?: string) => {
  if (!isOverdue(yyyyMmDd)) return 0;
  // Simple policy: 5% of subtotal, with min/max caps.
  const fee = subtotal * 0.05;
  return Math.min(50, Math.max(2, Number(fee.toFixed(2))));
};

