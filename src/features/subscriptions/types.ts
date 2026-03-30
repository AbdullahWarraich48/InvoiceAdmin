export type BillingCycle = "monthly" | "yearly";

export type PlanTier = "starter" | "premium" | "business" | "cloud-pro";

export interface PlanFeature {
  label: string;
  included: boolean;
  note?: string;
}

export interface PlanPrice {
  monthly: number;
  yearly: number;
  yearlyOriginal: number;
  renewalMonthly: number;
}

export interface HostingPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  description: string;
  featured?: boolean;
  ctaLabel: string;
  prices: PlanPrice;
  features: PlanFeature[];
  useCases: string[];
  projectTypes: string[];
  technicalSpecs: string[];
  includedExtras: string[];
}

export interface AddOnItem {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
}

export interface TrustBadge {
  id: string;
  title: string;
  subtitle: string;
}

export interface ComparisonRow {
  key: string;
  label: string;
  values: Record<PlanTier, string | boolean>;
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

