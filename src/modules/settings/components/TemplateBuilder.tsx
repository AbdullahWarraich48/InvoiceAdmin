import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import TemplatePreview from "./TemplatePreview";

interface TemplateData {
  page_size: string;
  orientation: string;
  margins: { top: number; right: number; bottom: number; left: number };
  header_logo_position: string;
  show_customer_details: boolean;
  show_shipping: boolean;
  show_tax_discount: boolean;
  show_grand_total: boolean;
  show_notes_terms: boolean;
  show_payment_details: boolean;
  show_signature: boolean;
  show_footer: boolean;
  labels: { invoice: string; bill_to: string; ntn: string };
  columns: Record<string, boolean>;
  font_size_base: number;
  font_size_header: number;
  currency_symbol: string;
  currency_format: string;
  footer_text: string;
}

const defaults: TemplateData = {
  page_size: "A4", orientation: "portrait",
  margins: { top: 20, right: 15, bottom: 20, left: 15 },
  header_logo_position: "left",
  show_customer_details: true, show_shipping: false, show_tax_discount: true, show_grand_total: true,
  show_notes_terms: true, show_payment_details: true, show_signature: true, show_footer: true,
  labels: { invoice: "INVOICE", bill_to: "Bill To", ntn: "NTN" },
  columns: { item_name: true, description: true, qty: true, unit_price: true, discount: true, tax: true, line_total: true },
  font_size_base: 12, font_size_header: 18,
  currency_symbol: "Rs.", currency_format: "symbol_before",
  footer_text: "Thank you for your business!",
};

const columnLabels: Record<string, string> = {
  item_name: "Item Name", description: "Description", qty: "Quantity",
  unit_price: "Unit Price", discount: "Discount", tax: "Tax", line_total: "Line Total",
};

export default function TemplateBuilder() {
  const { value, setValue, save, loading } = useSettings<TemplateData>("template_settings", defaults);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  const toggle = (field: keyof TemplateData) => setValue({ ...value, [field]: !value[field as keyof TemplateData] });
  const updateMargin = (side: string, val: number) => setValue({ ...value, margins: { ...value.margins, [side]: val } });
  const updateLabel = (key: string, val: string) => setValue({ ...value, labels: { ...value.labels, [key]: val } });
  const toggleColumn = (col: string) => setValue({ ...value, columns: { ...value.columns, [col]: !value.columns[col] } });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_auto]">
      <div className="space-y-6">
      {/* Page Setup */}
      <Card>
        <CardHeader><CardTitle>Page Setup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Page Size</Label>
              <Select value={value.page_size} onValueChange={(v) => setValue({ ...value, page_size: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A3">A3 (297 × 420 mm)</SelectItem>
                  <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                  <SelectItem value="A5">A5 (148 × 210 mm)</SelectItem>
                  <SelectItem value="B4">B4 (250 × 353 mm)</SelectItem>
                  <SelectItem value="B5">B5 (176 × 250 mm)</SelectItem>
                  <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                  <SelectItem value="Legal">Legal (8.5 × 14 in)</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Orientation</Label>
              <Select value={value.orientation} onValueChange={(v) => setValue({ ...value, orientation: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Logo Position</Label>
              <Select value={value.header_logo_position} onValueChange={(v) => setValue({ ...value, header_logo_position: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <div key={side} className="space-y-1">
                <Label className="text-xs capitalize">{side} (mm)</Label>
                <Input type="number" min={0} value={value.margins[side]} onChange={(e) => updateMargin(side, Number(e.target.value))} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section Toggles */}
      <Card>
        <CardHeader><CardTitle>Sections</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {([
            ["show_customer_details", "Customer Details"],
            ["show_shipping", "Shipping Block"],
            ["show_tax_discount", "Tax / Discount Lines"],
            ["show_grand_total", "Grand Total"],
            ["show_notes_terms", "Notes & Terms"],
            ["show_payment_details", "Payment Details"],
            ["show_signature", "Signature"],
            ["show_footer", "Footer"],
          ] as const).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <Label>{label}</Label>
              <Switch checked={value[key] as boolean} onCheckedChange={() => toggle(key)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Custom Labels */}
      <Card>
        <CardHeader><CardTitle>Custom Labels</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {Object.entries(value.labels).map(([key, val]) => (
            <div key={key} className="space-y-2">
              <Label className="capitalize">{key.replace(/_/g, " ")}</Label>
              <Input value={val} onChange={(e) => updateLabel(key, e.target.value)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Table Columns */}
      <Card>
        <CardHeader><CardTitle>Table Columns</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(value.columns).map(([col, enabled]) => (
            <div key={col} className="flex items-center justify-between">
              <Label>{columnLabels[col] ?? col}</Label>
              <Switch checked={enabled} onCheckedChange={() => toggleColumn(col)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Typography & Currency */}
      <Card>
        <CardHeader><CardTitle>Typography & Currency</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Base Font Size (px)</Label>
              <Input type="number" min={8} max={24} value={value.font_size_base} onChange={(e) => setValue({ ...value, font_size_base: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Header Font Size (px)</Label>
              <Input type="number" min={12} max={36} value={value.font_size_header} onChange={(e) => setValue({ ...value, font_size_header: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Currency Symbol</Label>
              <Input value={value.currency_symbol} onChange={(e) => setValue({ ...value, currency_symbol: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Currency Format</Label>
              <Select value={value.currency_format} onValueChange={(v) => setValue({ ...value, currency_format: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="symbol_before">Symbol Before (Rs. 100)</SelectItem>
                  <SelectItem value="symbol_after">Symbol After (100 Rs.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Footer Text</Label>
            <Input value={value.footer_text} onChange={(e) => setValue({ ...value, footer_text: e.target.value })} />
          </div>
        </CardContent>
      </Card>


      <Button size="lg" onClick={() => save(value)}>Save All Template Settings</Button>
      </div>

      {/* Live Preview Panel */}
      <div>
        <TemplatePreview templateData={value} />
      </div>
    </div>
  );
}
