import { CheckCircle2, Download, LifeBuoy, LayoutDashboard, Link2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { HostingPlan, BillingCycle } from "../types";

interface Props {
  plan: HostingPlan;
  cycle: BillingCycle;
  dueDate?: string;
  autoRenew: boolean;
  onDashboard: () => void;
}

export function SuccessState({ plan, cycle, dueDate, autoRenew, onDashboard }: Props) {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          <h1 className="text-2xl font-semibold">Subscription confirmed</h1>
          <p className="text-muted-foreground">Your {plan.name} plan ({cycle}) is active and ready.</p>
          {dueDate && <p className="text-sm text-muted-foreground">Due date: <span className="font-medium text-foreground">{dueDate}</span></p>}
          <p className="text-sm">
            Auto renew: <span className={autoRenew ? "text-emerald-600 font-medium" : "text-muted-foreground font-medium"}>{autoRenew ? "Enabled" : "Disabled"}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Download Invoice</Button>
            <Button onClick={onDashboard}><LayoutDashboard className="mr-2 h-4 w-4" /> Go to Dashboard</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Setup website", icon: Rocket, text: "Install CMS and publish your first page." },
          { title: "Connect domain", icon: Link2, text: "Point DNS and secure SSL automatically." },
          { title: "Access dashboard", icon: LayoutDashboard, text: "Track usage and manage add-ons." },
          { title: "Contact support", icon: LifeBuoy, text: "24/7 onboarding and migration help." },
        ].map((item) => (
          <Card key={item.title} className="rounded-xl">
            <CardContent className="space-y-2 p-4">
              <item.icon className="h-5 w-5 text-teal-600" />
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

