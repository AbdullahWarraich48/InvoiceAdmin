import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComparisonRow, HostingPlan } from "../types";

interface Props {
  plans: HostingPlan[];
  rows: ComparisonRow[];
}

function cellValue(value: string | boolean) {
  if (typeof value === "boolean") return value ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <X className="mx-auto h-4 w-4 text-muted-foreground" />;
  return value;
}

export function ComparisonTable({ plans, rows }: Props) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Plan Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 bg-background p-3 text-left">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="p-3 text-center">{plan.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="sticky left-0 border-t bg-background p-3 font-medium">{row.label}</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="border-t p-3 text-center">{cellValue(row.values[plan.id])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 md:hidden">
          {plans.map((plan) => (
            <Card key={plan.id} className="rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {rows.map((row) => (
                  <div key={`${plan.id}-${row.key}`} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span>{cellValue(row.values[plan.id])}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

