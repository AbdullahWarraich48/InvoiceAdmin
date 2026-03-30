import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentTabs } from "@/features/subscriptions/components/PaymentTabs";
import type { CardForm } from "@/features/subscriptions/components/PaymentTabs";
import { OrderSummary } from "@/features/subscriptions/components/OrderSummary";
import type { BillingCycle } from "@/features/subscriptions/types";
import { ArrowRight, CreditCard, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { daysUntil } from "@/features/subscriptions/utils";
import { api } from "@/lib/api";
import { computeLateFee, planPrice } from "@/features/subscriptions/utils";
import { useSubscriptionCatalog } from "@/features/subscriptions/useSubscriptionCatalog";

export default function SubscriptionPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const subscriptionType = searchParams.get("type") === "saas" ? "saas" : "hosting";
  const cycle = (searchParams.get("cycle") as BillingCycle) || "yearly";
  const planId = searchParams.get("plan") || "premium";
  const projectId = searchParams.get("projectId") || "";
  const afterStep = searchParams.get("after") || "";
  const promoCode = searchParams.get("promo") || "";
  const autoRenew = searchParams.get("autoRenew") !== "no";
  const domainName = searchParams.get("domain") || "";
  const billingName = searchParams.get("name") || "";
  const accountEmail = searchParams.get("email") || "";
  const dueDate = searchParams.get("dueDate") || "";
  const addOnIds = (searchParams.get("addons") || "").split(",").filter(Boolean);

  const { value: catalog, loading: catalogLoading } = useSubscriptionCatalog();

  const plan = useMemo(() => {
    const source = subscriptionType === "saas" ? catalog.saasPlans : catalog.hostingPlans;
    return source.find((p) => p.id === planId) ?? source[1] ?? source[0];
  }, [catalog, planId, subscriptionType]);
  const project = useMemo(() => catalog.saasProjects.find((p) => p.id === projectId) ?? null, [catalog, projectId]);

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [cardForm, setCardForm] = useState<CardForm>({
    holderName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    country: "",
    billingAddress: "",
  });

  useEffect(() => {
    const d = daysUntil(dueDate);
    if (d === null) return;
    if (d < 0) {
      toast.error(`Payment is overdue (due date was ${dueDate}). Late fee is applied.`);
      return;
    }
    if (d === 0) {
      toast.warning(`Due today (${dueDate}). Complete payment to avoid late fee.`);
      return;
    }
    if (d <= 3) {
      toast.warning(`Due in ${d} day${d === 1 ? "" : "s"} (${dueDate}).`);
    }
  }, [dueDate]);

  const validatePayment = () => {
    if (!accountEmail) return "Missing account email. Please go back.";
    if (!billingName) return "Missing billing name. Please go back.";
    if (!dueDate) return "Missing due date. Please go back.";
    if (subscriptionType === "saas" && !project) return "Missing SaaS project. Please go back.";
    if (paymentMethod === "card") {
      if (!cardForm.holderName || !cardForm.cardNumber || !cardForm.expiry || !cardForm.cvv) {
        return "Complete card details";
      }
    }
    return null;
  };

  const payNow = async () => {
    const error = validatePayment();
    if (error) {
      toast.error(error);
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Public website (no login): no backend auth => run a demo payment flow.
    // Admin / generator users have an auth_token and will generate real invoices.
    const hasAuthToken = Boolean(localStorage.getItem("auth_token"));
    if (!hasAuthToken) {
      try {
        toast.success("Payment successful (demo).");
        const projectQuery = subscriptionType === "saas" && projectId ? `&projectId=${projectId}` : "";
        const afterQuery = afterStep ? `&after=${encodeURIComponent(afterStep)}` : "";
        navigate(
          `/subscriptions/success?type=${subscriptionType}&plan=${plan.id}&cycle=${cycle}&dueDate=${encodeURIComponent(dueDate)}&autoRenew=${autoRenew ? "yes" : "no"}${projectQuery}${afterQuery}`
        );
        return;
      } finally {
        setLoading(false);
      }
    }

    try {
      // 1) Find/create customer by email
      const customers = await api.getCustomers();
      const existing = customers.find((c: any) => (c.email || "").toLowerCase() === accountEmail.toLowerCase());
      const customer = existing ?? await api.createCustomer({ name: billingName, email: accountEmail });

      // 2) Build invoice items (plan + add-ons + possible late fee)
      const base = planPrice(plan as any, cycle as any) * (cycle === "yearly" ? 12 : 1);
      const addOnItems = addOnIds
        .map((id) => catalog.addOns.find((a) => a.id === id))
        .filter(Boolean)
        .map((a: any) => ({
          item_name: a.name,
          description: a.description,
          qty: 1,
          unit_price: cycle === "yearly" ? a.yearlyPrice : a.monthlyPrice,
          discount: 0,
          tax_rate: 7,
          sort_order: 1,
        }));

      const promoDiscount = promoCode.toLowerCase() === "startup20" ? (base + addOnItems.reduce((s: number, i: any) => s + i.unit_price, 0)) * 0.2 : 0;
      const planItem = {
        item_name: `${plan.name} (${subscriptionType})`,
        description: `${subscriptionType === "saas" ? `Project: ${project?.name}` : "Hosting plan"} · Cycle: ${cycle}${domainName ? ` · Domain: ${domainName}` : ""}`,
        qty: 1,
        unit_price: base,
        discount: Number(Math.min(base, promoDiscount).toFixed(2)),
        tax_rate: 7,
        sort_order: 0,
      };

      const subtotalForLateFee = (base - planItem.discount) + addOnItems.reduce((s: number, i: any) => s + i.unit_price, 0);
      const lateFee = computeLateFee(subtotalForLateFee, dueDate);
      const lateFeeItem = lateFee > 0 ? [{
        item_name: "Late fee",
        description: `Applied because payment is after due date (${dueDate})`,
        qty: 1,
        unit_price: lateFee,
        discount: 0,
        tax_rate: 7,
        sort_order: 99,
      }] : [];

      const invoice = await api.createInvoice({
        customer_id: customer.id,
        category_id: null,
        issue_date: new Date().toISOString().split("T")[0],
        due_date: dueDate,
        notes: `[BillingModel:subscription] [SubscriptionType:${subscriptionType}]${autoRenew ? " [AutoRenew:yes]" : " [AutoRenew:no]"}`,
        terms: `[PlanName:${plan.name}] [BillingCycle:${cycle}] [SubscriptionStart:${new Date().toISOString().split("T")[0]}] [SubscriptionEnd:none] [AutoRenew:${autoRenew ? "yes" : "no"}]`,
        items: [planItem, ...addOnItems, ...lateFeeItem],
      });

      // 3) Mark as paid => receipt
      await api.updateInvoiceStatus(invoice.id, "paid");

      toast.success("Payment successful. Invoice + receipt generated.");
      const projectQuery = subscriptionType === "saas" && projectId ? `&projectId=${projectId}` : "";
      const afterQuery = afterStep ? `&after=${encodeURIComponent(afterStep)}` : "";
      navigate(`/subscriptions/success?type=${subscriptionType}&plan=${plan.id}&cycle=${cycle}&dueDate=${encodeURIComponent(dueDate)}&autoRenew=${autoRenew ? "yes" : "no"}&invoiceId=${invoice.id}${projectQuery}${afterQuery}`);
    } catch (e: any) {
      toast.error(e.message || "Payment succeeded but invoice generation failed");
    } finally {
      setLoading(false);
    }
  };

  if (catalogLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading subscription catalog...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-4">
        <section className="rounded-2xl border bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-purple-500/10 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Payment Method</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete secure payment to activate your subscription instantly.
              </p>
              {subscriptionType === "saas" && project && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Project: <span className="font-medium text-foreground">{project.name}</span> ({project.type})
                </p>
              )}
            </div>
            <Badge className="rounded-full bg-teal-600 px-3 py-1 text-white hover:bg-teal-600">
              <Sparkles className="mr-1 h-3 w-3" /> Secure Checkout
            </Badge>
          </div>
        </section>

        <div className="grid gap-3 rounded-2xl border bg-card/60 p-4 text-sm md:grid-cols-3">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> <span className="text-muted-foreground">PCI-friendly flow</span></div>
          <div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-teal-600" /> <span className="text-muted-foreground">256-bit encryption</span></div>
          <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-purple-600" /> <span className="text-muted-foreground">Multiple payment options</span></div>
        </div>

        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader><CardTitle>Select payment option</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <PaymentTabs paymentMethod={paymentMethod} onMethodChange={setPaymentMethod} cardForm={cardForm} setCardForm={setCardForm} />
            <p className="text-xs text-muted-foreground">Secure checkout protected by 256-bit encryption.</p>
          </CardContent>
        </Card>
        </motion.div>

        <div className="sticky bottom-3 flex items-center justify-between gap-3 rounded-2xl border bg-background/95 p-3 shadow-sm backdrop-blur">
          <Button
            variant="outline"
            onClick={() => {
              const projectQuery = subscriptionType === "saas" && projectId ? `&projectId=${projectId}` : "";
              const afterQuery = afterStep ? `&after=${encodeURIComponent(afterStep)}` : "";
              navigate(`/subscriptions/checkout?type=${subscriptionType}&plan=${plan.id}&cycle=${cycle}&promo=${encodeURIComponent(promoCode)}&domain=${encodeURIComponent(domainName)}&name=${encodeURIComponent(billingName)}&email=${encodeURIComponent(accountEmail)}&dueDate=${encodeURIComponent(dueDate)}&addons=${encodeURIComponent(addOnIds.join(","))}&autoRenew=${autoRenew ? "yes" : "no"}${projectQuery}${afterQuery}`);
            }}
          >
            Back to Checkout
          </Button>
          <Button onClick={payNow} disabled={loading} className="min-w-36">
            {loading ? "Processing..." : "Pay Now"} {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
        <OrderSummary
          plan={plan}
          cycle={cycle}
          selectedAddOns={addOnIds}
            addOns={catalog.addOns}
          promoCode={promoCode}
          taxRate={0.07}
          autoRenew={autoRenew}
          dueDate={dueDate}
        />
      </motion.div>
    </div>
  );
}

