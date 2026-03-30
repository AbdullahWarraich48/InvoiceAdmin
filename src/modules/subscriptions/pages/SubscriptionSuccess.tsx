import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SuccessState } from "@/features/subscriptions/components/SuccessState";
import type { BillingCycle } from "@/features/subscriptions/types";
import { Button } from "@/components/ui/button";
import { useSubscriptionCatalog } from "@/features/subscriptions/useSubscriptionCatalog";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const type = params.get("type") === "saas" ? "saas" : "hosting";
  const afterStep = params.get("after") ?? "";
  const planId = params.get("plan") || "premium";
  const cycle = (params.get("cycle") as BillingCycle) || "yearly";
  const dueDate = params.get("dueDate") || "";
  const autoRenew = params.get("autoRenew") !== "no";
  const invoiceId = params.get("invoiceId") || "";
  const projectId = params.get("projectId") || "";

  const { value: catalog, loading: catalogLoading } = useSubscriptionCatalog();
  const hasAuthToken = Boolean(localStorage.getItem("auth_token"));

  if (catalogLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Loading subscription...</p></div>;
  }

  const plan = useMemo(() => {
    const source = type === "saas" ? catalog.saasPlans : catalog.hostingPlans;
    return source.find((p) => p.id === planId) ?? source[1] ?? source[0];
  }, [catalog, planId, type]);
  const project = useMemo(() => catalog.saasProjects.find((p) => p.id === projectId) ?? null, [catalog, projectId]);

  return (
    <div className="space-y-3">
      {type === "saas" && project && (
        <p className="text-sm text-muted-foreground">
          Activated for project <span className="font-medium text-foreground">{project.name}</span>
        </p>
      )}
      <SuccessState
        plan={plan}
        cycle={cycle}
        dueDate={dueDate}
        autoRenew={autoRenew}
        onDashboard={() => navigate(hasAuthToken ? "/subscriptions/manage" : "/subscriptions")}
      />

      {type === "saas" && afterStep === "hosting" && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(`/subscriptions/hosting/plans?cycle=${cycle}`)}
          >
            Continue with Hosting Plan
          </Button>
        </div>
      )}

      {invoiceId && (
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={`/invoices/${invoiceId}`}>View Invoice</Link>
          </Button>
          <Button asChild>
            <Link to={`/invoices/${invoiceId}`}>View Receipt</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

