import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckoutForm } from "@/features/subscriptions/components/CheckoutForm";
import { OrderSummary } from "@/features/subscriptions/components/OrderSummary";
import type { BillingCycle } from "@/features/subscriptions/types";
import { daysUntil } from "@/features/subscriptions/utils";
import { useSubscriptionCatalog } from "@/features/subscriptions/useSubscriptionCatalog";

export default function SubscriptionCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const subscriptionType = searchParams.get("type") === "saas" ? "saas" : "hosting";
  const initialCycle = (searchParams.get("cycle") as BillingCycle) || "yearly";
  const initialPlan = searchParams.get("plan") || "premium";
  const projectId = searchParams.get("projectId") || "";
  const afterStep = searchParams.get("after") ?? "";
  const getDefaultDueDate = (selectedCycle: BillingCycle) => {
    const now = new Date();
    const next = new Date(now);
    next.setDate(next.getDate() + (selectedCycle === "yearly" ? 365 : 30));
    return next.toISOString().split("T")[0];
  };

  const [cycle, setCycle] = useState<BillingCycle>(initialCycle);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState(searchParams.get("promo") ?? "");
  const [domainName, setDomainName] = useState(searchParams.get("domain") ?? "");
  const [billingName, setBillingName] = useState(searchParams.get("name") ?? "");
  const [accountEmail, setAccountEmail] = useState(searchParams.get("email") ?? "");
  const [dueDate, setDueDate] = useState(searchParams.get("dueDate") ?? getDefaultDueDate(initialCycle));
  const [autoRenew, setAutoRenew] = useState(searchParams.get("autoRenew") !== "no");
  const [acknowledgedTerms, setAcknowledgedTerms] = useState(false);

  const { value: catalog, loading } = useSubscriptionCatalog();

  useEffect(() => {
    const d = daysUntil(dueDate);
    if (d === null) return;
    if (d < 0) {
      toast.error(`Due date passed (${dueDate}). Late fee will be added.`);
      return;
    }
    if (d === 0) {
      toast.warning(`Due today (${dueDate}). Pay now to avoid late fee.`);
      return;
    }
    if (d <= 3) {
      toast.warning(`Due in ${d} day${d === 1 ? "" : "s"} (${dueDate}).`);
    }
  }, [dueDate]);

  const plan = useMemo(
    () => {
      const source = subscriptionType === "saas" ? catalog.saasPlans : catalog.hostingPlans;
      return source.find((p) => p.id === initialPlan) ?? source[1] ?? source[0];
    },
    [catalog, initialPlan, subscriptionType]
  );
  const project = useMemo(() => catalog.saasProjects.find((p) => p.id === projectId) ?? null, [catalog, projectId]);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const validateCheckout = () => {
    if (subscriptionType === "saas" && !project) return "Please select a SaaS project first";
    if (!billingName.trim()) return "Enter billing name";
    if (!accountEmail.includes("@")) return "Enter a valid account email";
    if (!dueDate) return "Please select due date";
    if (!acknowledgedTerms) return "Please accept terms and subscription acknowledgement";
    return null;
  };

  const continueToPayment = async () => {
    const error = validateCheckout();
    if (error) {
      toast.error(error);
      return;
    }
    const projectQuery = subscriptionType === "saas" && projectId ? `&projectId=${projectId}` : "";
    const afterQuery = afterStep ? `&after=${encodeURIComponent(afterStep)}` : "";
    navigate(
      `/subscriptions/payment?type=${subscriptionType}&plan=${plan.id}&cycle=${cycle}` +
      `&promo=${encodeURIComponent(promoCode)}` +
      `&domain=${encodeURIComponent(domainName)}` +
      `&name=${encodeURIComponent(billingName)}` +
      `&email=${encodeURIComponent(accountEmail)}` +
      `&dueDate=${encodeURIComponent(dueDate)}` +
      `&addons=${encodeURIComponent(selectedAddOns.join(","))}` +
      `&autoRenew=${autoRenew ? "yes" : "no"}${projectQuery}${afterQuery}`
    );
  };

  return loading ? (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">Loading subscription catalog...</p>
    </div>
  ) : (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{subscriptionType === "saas" ? "SaaS Checkout" : "Hosting Checkout"}</h1>
        {subscriptionType === "saas" && project && (
          <p className="text-sm text-muted-foreground">
            Project: <span className="font-medium text-foreground">{project.name}</span> ({project.type})
          </p>
        )}
        <CheckoutForm
          plan={plan}
          cycle={cycle}
          onCycleChange={setCycle}
          addOns={catalog.addOns}
          selectedAddOns={selectedAddOns}
          onToggleAddOn={toggleAddOn}
          promoCode={promoCode}
          onPromoChange={setPromoCode}
          domainName={domainName}
          onDomainChange={setDomainName}
          billingName={billingName}
          onBillingNameChange={setBillingName}
          accountEmail={accountEmail}
          onAccountEmailChange={setAccountEmail}
          dueDate={dueDate}
          onDueDateChange={setDueDate}
          autoRenew={autoRenew}
          onAutoRenewChange={setAutoRenew}
          acknowledgedTerms={acknowledgedTerms}
          onAcknowledgedTermsChange={setAcknowledgedTerms}
        />
        <div className="flex justify-end">
          <Button onClick={continueToPayment}>Continue to Payment</Button>
        </div>
      </div>
      <OrderSummary
        plan={plan}
        cycle={cycle}
        selectedAddOns={selectedAddOns}
        addOns={catalog.addOns}
        promoCode={promoCode}
        taxRate={0.07}
        autoRenew={autoRenew}
        dueDate={dueDate}
      />
    </div>
  );
}

