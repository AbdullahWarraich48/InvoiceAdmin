import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BillingToggle } from "@/features/subscriptions/components/BillingToggle";
import { PricingCard } from "@/features/subscriptions/components/PricingCard";
import { ComparisonTable } from "@/features/subscriptions/components/ComparisonTable";
import { PlanDetailsModal } from "@/features/subscriptions/components/PlanDetailsModal";
import type { BillingCycle, HostingPlan } from "@/features/subscriptions/types";
import { useSubscriptionCatalog } from "@/features/subscriptions/useSubscriptionCatalog";
import { useAuth } from "@/hooks/useAuth";

export default function SubscriptionPricing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isSaasFlow = location.pathname.includes("/subscriptions/saas/");
  const projectId = searchParams.get("projectId") ?? "";
  const afterStep = searchParams.get("after") ?? "";

  const { value: catalog, loading } = useSubscriptionCatalog();
  const { isSuperAdmin } = useAuth();
  const project = isSaasFlow ? catalog.saasProjects.find((p) => p.id === projectId) : null;
  const packagesReady = isSaasFlow ? Boolean((project as any)?.packagesReady) : true;
  const allPlans = isSaasFlow ? catalog.saasPlans : catalog.hostingPlans;
  const relatedSaasPlans =
    isSaasFlow && project
      ? (catalog.saasPlans ?? []).filter((plan) => (plan.projectTypes ?? []).includes(project.type))
      : [];

  const plans = !isSaasFlow
    ? allPlans
    : packagesReady
      ? relatedSaasPlans
      : [];
  const rows = isSaasFlow ? catalog.saasComparisonRows : catalog.comparisonRows;
  const showRelatedWarning = isSaasFlow && project && packagesReady && relatedSaasPlans.length === 0;
  const cycleParam = searchParams.get("cycle");
  const initialCycle: BillingCycle = cycleParam === "monthly" || cycleParam === "yearly" ? cycleParam : "yearly";
  const [cycle, setCycle] = useState<BillingCycle>(initialCycle);
  const [selected, setSelected] = useState<HostingPlan | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Keep selected plan in sync with loaded catalog and current flow (saas vs hosting).
  // We prefer "featured" plan; fallback to first available plan.
  useEffect(() => {
    const fallback = plans.find((p) => p.featured) ?? plans[0] ?? null;
    if (!fallback) return;
    if (!selected || !plans.some((p) => p.id === selected.id)) {
      setSelected(fallback);
    }
  }, [plans, selected]);

  const onSelect = (plan: HostingPlan) => {
    setSelected(plan);
    toast.success(`${plan.name} selected`);
    const type = isSaasFlow ? "saas" : "hosting";
    const projectQuery = isSaasFlow && projectId ? `&projectId=${projectId}` : "";
    const afterQuery = isSaasFlow && afterStep === "hosting" ? `&after=hosting` : "";
    navigate(`/subscriptions/checkout?type=${type}&plan=${plan.id}&cycle=${cycle}${projectQuery}${afterQuery}`);
  };

  const onViewDetails = (plan: HostingPlan) => {
    setSelected(plan);
    setDetailsOpen(true);
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Loading subscription plans...</p></div>;
  }

  return (
    <div className="space-y-10 pb-8">
      <section className="rounded-2xl border bg-gradient-to-br from-teal-600/10 via-emerald-600/5 to-purple-600/10 p-8 md:p-12">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold md:text-5xl">
            {isSaasFlow ? "SaaS Subscription Plans" : "Hosting Subscription Plans"}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Compare plans, choose a billing cycle, and continue with a secure subscription checkout.
          </p>
          {isSaasFlow && project && (
            <p className="mt-2 text-sm text-foreground">
              Selected project: <span className="font-semibold">{project.name}</span> ({project.type})
            </p>
          )}
          {showRelatedWarning && (
            <p className="mt-2 text-sm text-muted-foreground">
              No related SaaS packages found for this project type. Showing all SaaS packages.
            </p>
          )}
          {isSuperAdmin && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate("/subscriptions/catalog?mode=hosting")}>
                Edit Hosting packages
              </Button>
              <Button variant="outline" onClick={() => navigate("/subscriptions/catalog?mode=saas")}>
                Edit SaaS packages
              </Button>
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <BillingToggle cycle={cycle} onChange={setCycle} />
          </div>
        </motion.div>
      </section>

      {isSaasFlow && project && !packagesReady ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="space-y-3 p-6">
            <p className="text-base font-semibold">Packages aren’t configured yet</p>
            <p className="text-sm text-muted-foreground">
              This project was added recently. Please finish configuring its SaaS packages in the catalog editor, then mark it
              as <span className="font-medium text-foreground">Packages ready</span>.
            </p>
            {isSuperAdmin && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate("/subscriptions/catalog?mode=saas")}>
                  Configure SaaS packages
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 lg:grid-cols-4">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} cycle={cycle} onSelect={onSelect} onViewDetails={onViewDetails} />
          ))}
        </section>
      )}

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {catalog.trustBadges.map((item) => (
          <Card key={item.id} className="rounded-xl border-dashed">
            <CardContent className="p-4">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {plans.length > 0 ? <ComparisonTable plans={plans} rows={rows} /> : null}

      <PlanDetailsModal
        open={detailsOpen}
        plan={selected}
        onClose={() => setDetailsOpen(false)}
        onContinue={(plan) => {
          setDetailsOpen(false);
          onSelect(plan);
        }}
      />
    </div>
  );
}

