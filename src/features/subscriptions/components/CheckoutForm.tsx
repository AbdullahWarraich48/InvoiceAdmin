import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AddOnItem, BillingCycle, HostingPlan } from "../types";

interface Props {
  plan: HostingPlan;
  cycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
  addOns: AddOnItem[];
  selectedAddOns: string[];
  onToggleAddOn: (id: string) => void;
  promoCode: string;
  onPromoChange: (value: string) => void;
  domainName: string;
  onDomainChange: (value: string) => void;
  billingName: string;
  onBillingNameChange: (value: string) => void;
  accountEmail: string;
  onAccountEmailChange: (value: string) => void;
  dueDate: string;
  onDueDateChange: (value: string) => void;
  autoRenew: boolean;
  onAutoRenewChange: (value: boolean) => void;
  acknowledgedTerms: boolean;
  onAcknowledgedTermsChange: (value: boolean) => void;
}

export function CheckoutForm(props: Props) {
  const {
    plan, cycle, onCycleChange, addOns, selectedAddOns, onToggleAddOn, promoCode, onPromoChange,
    domainName, onDomainChange, billingName, onBillingNameChange, accountEmail, onAccountEmailChange, dueDate, onDueDateChange, autoRenew, onAutoRenewChange, acknowledgedTerms, onAcknowledgedTermsChange,
  } = props;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Chosen Plan</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="font-medium">{plan.name}</p>
          <div className="inline-flex rounded-xl border p-1 text-sm">
            <button className={`rounded-lg px-3 py-1 ${cycle === "monthly" ? "bg-muted" : ""}`} onClick={() => onCycleChange("monthly")} type="button">Monthly</button>
            <button className={`rounded-lg px-3 py-1 ${cycle === "yearly" ? "bg-muted" : ""}`} onClick={() => onCycleChange("yearly")} type="button">Yearly</button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Domain, Account & Due Date</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Domain choice (optional)</Label>
            <Input placeholder="mybrand.com" value={domainName} onChange={(e) => onDomainChange(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Billing name</Label>
            <Input placeholder="e.g. Abdullah Harracchi" value={billingName} onChange={(e) => onBillingNameChange(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Account email</Label>
            <Input type="email" placeholder="you@company.com" value={accountEmail} onChange={(e) => onAccountEmailChange(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={(e) => onDueDateChange(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Add-ons</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {addOns.map((addon) => (
            <label key={addon.id} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3">
              <Checkbox checked={selectedAddOns.includes(addon.id)} onCheckedChange={() => onToggleAddOn(addon.id)} />
              <div className="flex-1">
                <p className="font-medium">{addon.name}</p>
                <p className="text-sm text-muted-foreground">{addon.description}</p>
              </div>
              <span className="text-sm text-muted-foreground">
                ${cycle === "yearly" ? addon.yearlyPrice : addon.monthlyPrice}
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Renewal, Promo & Terms</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border p-3">
            <div>
              <p className="font-medium">Auto renew subscription</p>
              <p className="text-xs text-muted-foreground">Automatically renew at the end of billing period.</p>
            </div>
            <Switch checked={autoRenew} onCheckedChange={onAutoRenewChange} />
          </div>
          <div className="space-y-2">
            <Label>Promo code</Label>
            <Input placeholder="Try STARTUP20" value={promoCode} onChange={(e) => onPromoChange(e.target.value)} />
          </div>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={acknowledgedTerms} onCheckedChange={(v) => onAcknowledgedTermsChange(Boolean(v))} />
            <span>I agree to terms and subscription policy acknowledgement.</span>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}

