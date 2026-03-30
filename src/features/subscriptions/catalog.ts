import type {
  AddOnItem,
  BillingHistoryItem,
  ComparisonRow,
  HostingPlan,
  TrustBadge,
} from "./types";
import {
  addOns,
  billingHistory,
  comparisonRows,
  hostingPlans,
  saasComparisonRows,
  saasPlans,
  saasProjects,
  trustBadges,
} from "./data";

export const SUBSCRIPTION_CATALOG_SETTING_KEY = "subscription_catalog";

export interface SubscriptionCatalog {
  hostingPlans: HostingPlan[];
  saasPlans: HostingPlan[];
  saasProjects: (typeof saasProjects)[number][];
  trustBadges: TrustBadge[];
  comparisonRows: ComparisonRow[];
  saasComparisonRows: ComparisonRow[];
  addOns: AddOnItem[];
  billingHistory: BillingHistoryItem[];
}

export const defaultSubscriptionCatalog: SubscriptionCatalog = {
  hostingPlans,
  saasPlans,
  saasProjects,
  trustBadges,
  comparisonRows,
  saasComparisonRows,
  addOns,
  billingHistory,
};

