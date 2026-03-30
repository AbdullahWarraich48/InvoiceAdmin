import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { HostingPlan } from "../types";
import { FeatureList } from "./FeatureList";

interface Props {
  open: boolean;
  plan: HostingPlan | null;
  onClose: () => void;
  onContinue: (plan: HostingPlan) => void;
}

export function PlanDetailsModal({ open, plan, onClose, onContinue }: Props) {
  if (!plan) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>{plan.name} Plan Details</DialogTitle>
          <DialogDescription>{plan.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Included extras</h4>
            <FeatureList items={plan.includedExtras} />
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Technical specs</h4>
            <FeatureList items={plan.technicalSpecs} />
          </div>
          <div className="md:col-span-2">
            <h4 className="mb-2 text-sm font-semibold">Best for</h4>
            <FeatureList items={plan.useCases} />
          </div>
          <div className="md:col-span-2">
            <h4 className="mb-2 text-sm font-semibold">SaaS project types supported</h4>
            <FeatureList items={plan.projectTypes} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => onContinue(plan)}>Continue to checkout</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

