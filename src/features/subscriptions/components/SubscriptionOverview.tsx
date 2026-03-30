import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface Props {
  autoRenew: boolean;
  onAutoRenewChange: (next: boolean) => void;
}

export function SubscriptionOverview({ autoRenew, onAutoRenewChange }: Props) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Current Subscription</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Plan:</span> Premium</p>
          <p><span className="text-muted-foreground">Renewal Date:</span> 14 Feb 2027</p>
          <p><span className="text-muted-foreground">Billing Cycle:</span> Yearly</p>
        </div>
        <div className="rounded-xl border p-3">
          <div className="flex items-center justify-between">
            <p className="font-medium">Auto-renew</p>
            <Switch checked={autoRenew} onCheckedChange={onAutoRenewChange} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep this on to avoid interruption and retain current pricing benefits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

