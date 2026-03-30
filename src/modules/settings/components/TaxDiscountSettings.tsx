import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaxData { enabled: boolean; default_rate: number; label: string; }
interface DiscountData { mode: string; }

export default function TaxDiscountSettings() {
  const tax = useSettings<TaxData>("tax_settings", { enabled: false, default_rate: 0, label: "GST" });
  const discount = useSettings<DiscountData>("discount_settings", { mode: "percentage" });

  if (tax.loading || discount.loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Tax Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={tax.value.enabled} onCheckedChange={(v) => tax.setValue({ ...tax.value, enabled: v })} />
            <Label>Enable Tax</Label>
          </div>
          {tax.value.enabled && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Default Rate (%)</Label>
                <Input type="number" min={0} max={100} value={tax.value.default_rate} onChange={(e) => tax.setValue({ ...tax.value, default_rate: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Tax Label</Label>
                <Input value={tax.value.label} onChange={(e) => tax.setValue({ ...tax.value, label: e.target.value })} placeholder="e.g. GST, VAT" />
              </div>
            </div>
          )}
          <Button onClick={() => tax.save(tax.value)}>Save Tax Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Discount Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Discount Mode</Label>
            <Select value={discount.value.mode} onValueChange={(v) => discount.setValue({ ...discount.value, mode: v })}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => discount.save(discount.value)}>Save Discount Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
