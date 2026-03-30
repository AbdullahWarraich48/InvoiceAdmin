import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BillingHistoryTable } from "@/features/subscriptions/components/BillingHistoryTable";
import { SubscriptionOverview } from "@/features/subscriptions/components/SubscriptionOverview";
import { useSubscriptionCatalog } from "@/features/subscriptions/useSubscriptionCatalog";
import { useAuth } from "@/hooks/useAuth";

export default function SubscriptionManage() {
  const [autoRenew, setAutoRenew] = useState(true);
  const { value: catalog, loading } = useSubscriptionCatalog();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading subscription data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Subscription</h1>
      {isSuperAdmin && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/subscriptions/catalog?mode=hosting")}>
            Edit Hosting Packages
          </Button>
          <Button variant="outline" onClick={() => navigate("/subscriptions/catalog?mode=saas")}>
            Edit SaaS Packages
          </Button>
          <Button variant="outline" onClick={() => navigate("/subscriptions/catalog?mode=all")}>
            Advanced (all)
          </Button>
        </div>
      )}

      <SubscriptionOverview
        autoRenew={autoRenew}
        onAutoRenewChange={(next) => {
          setAutoRenew(next);
          toast.success(next ? "Auto-renew enabled" : "Auto-renew disabled");
        }}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-base">Usage</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Storage: 42/50 GB<br />Bandwidth: 320 GB / unmetered</CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-base">Payment Method</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Visa ending in 4242<br />Next charge: 14 Feb 2027</CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-base">Active Add-ons</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Domain Privacy, Daily Backups, Advanced Security</CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline">Upgrade</Button>
        <Button variant="outline">Downgrade</Button>
        <Button variant="outline">Change Payment Method</Button>
        <Button variant="outline" onClick={() => toast.warning("Reminder: renews in 18 days")}>Show warning toast</Button>
        <Button variant="outline" onClick={() => toast.error("Example: payment attempt failed")}>Show error toast</Button>
      </div>

      <BillingHistoryTable rows={catalog.billingHistory} />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Cancel Subscription</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription stays active until the end of the billing period, then auto-renew will stop.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={() => toast.success("Subscription will not renew")}>Confirm Cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

