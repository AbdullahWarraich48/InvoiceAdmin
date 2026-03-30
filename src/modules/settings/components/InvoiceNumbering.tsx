import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NumberingData {
  prefix: string;
  next_number: number;
  format: string;
}

const defaults: NumberingData = { prefix: "INV-", next_number: 1, format: "{PREFIX}{YYYY}{MM}-{SEQ}" };

export default function InvoiceNumbering() {
  const { value, setValue, save, loading } = useSettings<NumberingData>("invoice_numbering", defaults);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  // Be defensive: `value` can temporarily be a raw JSON string depending on backend/MySQL driver.
  const safeValue =
    value && typeof value === "object" && "format" in value && "prefix" in value && "next_number" in value
      ? value
      : defaults;

  const now = new Date();
  const preview = safeValue.format
    .replace("{PREFIX}", safeValue.prefix)
    .replace("{YYYY}", String(now.getFullYear()))
    .replace("{MM}", String(now.getMonth() + 1).padStart(2, "0"))
    .replace("{SEQ}", String(safeValue.next_number).padStart(3, "0"));

  return (
    <Card>
      <CardHeader><CardTitle>Invoice Numbering</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Prefix</Label>
            <Input value={safeValue.prefix} onChange={(e) => setValue({ ...safeValue, prefix: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Next Number</Label>
            <Input
              type="number"
              min={1}
              value={safeValue.next_number}
              onChange={(e) => setValue({ ...safeValue, next_number: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Format Pattern</Label>
          <Input value={safeValue.format} onChange={(e) => setValue({ ...safeValue, format: e.target.value })} />
          <p className="text-xs text-muted-foreground">Tokens: {"{PREFIX}"}, {"{YYYY}"}, {"{MM}"}, {"{SEQ}"}</p>
        </div>
        <div className="rounded-lg border bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground">Preview: <span className="font-mono font-medium text-foreground">{preview}</span></p>
        </div>
        <Button onClick={() => save(safeValue)}>Save</Button>
      </CardContent>
    </Card>
  );
}
