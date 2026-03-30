import { useEffect, useRef, useState } from "react";
import type { SubscriptionCatalog } from "./catalog";
import { api } from "@/lib/api";
import { defaultSubscriptionCatalog, SUBSCRIPTION_CATALOG_SETTING_KEY } from "./catalog";

export function useSubscriptionCatalog(pollIntervalMs = 5000) {
  const [value, setValue] = useState<SubscriptionCatalog>(defaultSubscriptionCatalog);
  const [loading, setLoading] = useState(true);
  const didInitialLoad = useRef(false);
  const lastRawValueRef = useRef<string | null>(null);

  const isValidCatalog = (candidate: any): candidate is SubscriptionCatalog => {
    if (!candidate || typeof candidate !== "object") return false;
    return (
      Array.isArray(candidate.hostingPlans) &&
      Array.isArray(candidate.saasPlans) &&
      Array.isArray(candidate.saasProjects) &&
      Array.isArray(candidate.trustBadges) &&
      Array.isArray(candidate.comparisonRows) &&
      Array.isArray(candidate.saasComparisonRows) &&
      Array.isArray(candidate.addOns) &&
      Array.isArray(candidate.billingHistory)
    );
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // Only show loading UI for the initial fetch.
        // Subsequent polls keep current UI to avoid scroll jumps/blink.
        if (!didInitialLoad.current) setLoading(true);
        const data = await api.getSetting(SUBSCRIPTION_CATALOG_SETTING_KEY);
        const raw = (data as any)?.value;
        if (!raw) return;

        // Backend stores this setting as a JSON string.
        // Compare raw to avoid unnecessary setState (which resets draft and jumps scroll).
        if (typeof raw === "string") {
          if (lastRawValueRef.current === raw) return;
          lastRawValueRef.current = raw;

          const normalized = JSON.parse(raw);
          if (!cancelled && normalized) {
            setValue(isValidCatalog(normalized) ? (normalized as SubscriptionCatalog) : defaultSubscriptionCatalog);
          }
          return;
        }

        // Fallback if backend ever returns a structured object.
        const serialized = JSON.stringify(raw);
        if (lastRawValueRef.current === serialized) return;
        lastRawValueRef.current = serialized;

        if (!cancelled && raw) {
          setValue(isValidCatalog(raw) ? (raw as SubscriptionCatalog) : defaultSubscriptionCatalog);
        }
      } catch {
        if (!cancelled && !didInitialLoad.current) setValue(defaultSubscriptionCatalog);
      } finally {
        if (!cancelled && !didInitialLoad.current) {
          setLoading(false);
          didInitialLoad.current = true;
        }
      }
    };

    load();
    const id = window.setInterval(load, pollIntervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollIntervalMs]);

  const save = async (next: SubscriptionCatalog) => {
    // Optimistic update so UI reflects changes immediately.
    setValue(next);
    lastRawValueRef.current = JSON.stringify(next);
    try {
      await api.updateSetting(SUBSCRIPTION_CATALOG_SETTING_KEY, next);
      return true;
    } catch {
      // Keep optimistic changes until next poll/reload; editor will be overwritten on failure.
      return false;
    }
  };

  return { value, loading, save };
}

