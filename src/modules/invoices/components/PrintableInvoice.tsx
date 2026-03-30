import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface TemplateData {
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

export interface CompanyData {
  name: string;
  address: string;
  phone: string;
  email: string;
  ntn: string;
  logo_url: string;
  bank_details: string;
  signature_name: string;
  signature_url: string;
}

export const defaultTemplate: TemplateData = {
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

export const defaultCompany: CompanyData = {
  name: "", address: "", phone: "", email: "", ntn: "",
  logo_url: "", bank_details: "", signature_name: "", signature_url: "",
};

export const columnLabels: Record<string, string> = {
  item_name: "Item", description: "Description", qty: "Qty",
  unit_price: "Unit Price", discount: "Discount", tax: "Tax %", line_total: "Total",
};

export function fmt(value: number, symbol: string, format: string) {
  const num = Number(value).toLocaleString();
  return format === "symbol_after" ? `${num} ${symbol}` : `${symbol} ${num}`;
}

interface PrintableInvoiceProps {
  invoice: any;
  items: any[];
  /** Pass template data directly to skip DB fetch (used for live preview) */
  templateOverride?: TemplateData;
  /** Pass company data directly to skip DB fetch (used for live preview) */
  companyOverride?: CompanyData;
  /** When true, render on screen too (used by TemplatePreview). */
  showOnScreen?: boolean;
}

export default function PrintableInvoice({
  invoice,
  items,
  templateOverride,
  companyOverride,
  showOnScreen,
}: PrintableInvoiceProps) {
  const [tpl, setTpl] = useState<TemplateData>(templateOverride ?? defaultTemplate);
  const [company, setCompany] = useState<CompanyData>(companyOverride ?? defaultCompany);
  const [loaded, setLoaded] = useState(!!templateOverride);

  const normalizeJson = <T,>(raw: unknown, fallback: T): T => {
    if (raw === undefined || raw === null) return fallback;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    }
    return raw as T;
  };

  const normalizeTemplate = (raw: unknown): TemplateData => {
    const parsed = normalizeJson<Partial<TemplateData>>(raw, {});
    const parsedAny = parsed as any;
    const marginsParsed = parsedAny?.margins;
    const labelsParsed = parsedAny?.labels;
    const columnsParsed = parsedAny?.columns;
    return {
      ...defaultTemplate,
      ...parsed,
      margins:
        marginsParsed && typeof marginsParsed === "object"
          ? { ...defaultTemplate.margins, ...marginsParsed }
          : { ...defaultTemplate.margins },
      labels:
        labelsParsed && typeof labelsParsed === "object"
          ? { ...defaultTemplate.labels, ...labelsParsed }
          : { ...defaultTemplate.labels },
      columns:
        columnsParsed && typeof columnsParsed === "object"
          ? { ...defaultTemplate.columns, ...columnsParsed }
          : { ...defaultTemplate.columns },
    };
  };

  const normalizeCompany = (raw: unknown): CompanyData => {
    const parsed = normalizeJson<Partial<CompanyData>>(raw, {});
    return { ...defaultCompany, ...parsed };
  };

  // If overrides change (live preview), update state
  useEffect(() => {
    if (templateOverride) setTpl(templateOverride);
  }, [templateOverride]);

  useEffect(() => {
    if (companyOverride) setCompany(companyOverride);
  }, [companyOverride]);

  // Only fetch from DB when no overrides provided
  useEffect(() => {
    if (templateOverride) return;
    Promise.all([
      api.getSetting("template_settings").catch(() => ({ value: defaultTemplate })),
      api.getSetting("company_profile").catch(() => ({ value: defaultCompany })),
    ]).then(([tplRes, compRes]) => {
      setTpl(normalizeTemplate(tplRes?.value));
      setCompany(normalizeCompany(compRes?.value));
      setLoaded(true);
    });
  }, [templateOverride]);

  if (!loaded && !templateOverride) {
    return (
      <div className={`${showOnScreen ? "block" : "hidden print:block"} printable-invoice`}>
        Loading...
      </div>
    );
  }

  const customer = invoice.customers || {};
  const safeTpl =
    tpl && tpl.margins && typeof tpl.margins.top === "number"
      ? tpl
      : (defaultTemplate as TemplateData);
  const style = {
    fontSize: `${safeTpl.font_size_base}pt`,
    padding: `${safeTpl.margins.top}mm ${safeTpl.margins.right}mm ${safeTpl.margins.bottom}mm ${safeTpl.margins.left}mm`,
  };

  return (
    <div className={`${showOnScreen ? "block" : "hidden print:block"} printable-invoice`} style={style}>
      {/* Header */}
      <div className={`mb-6 flex ${tpl.header_logo_position === "right" ? "justify-between" : "justify-start"} items-start`}>
        {tpl.header_logo_position !== "right" && company.logo_url && (
          <img src={company.logo_url} alt="Logo" className="h-16 object-contain" />
        )}
        <div className={`flex-1 ${tpl.header_logo_position === "left" ? "ml-4" : ""}`}>
          {company.name && <h2 className="text-xl font-bold">{company.name}</h2>}
          {company.address && <p className="text-sm">{company.address}</p>}
          {company.phone && <p className="text-sm">Phone: {company.phone}</p>}
          {company.email && <p className="text-sm">Email: {company.email}</p>}
          {company.ntn && <p className="text-sm">{tpl.labels.ntn}: {company.ntn}</p>}
        </div>
        {tpl.header_logo_position === "right" && company.logo_url && (
          <img src={company.logo_url} alt="Logo" className="h-16 object-contain" />
        )}
      </div>

      {/* Invoice Title */}
      <h1 className="mb-6 text-center" style={{ fontSize: `${tpl.font_size_header}pt` }}>{tpl.labels.invoice}</h1>

      {/* Invoice Meta */}
      <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Invoice #:</strong> {invoice.invoice_number}
        </div>
        <div className="text-right">
          <strong>Date:</strong> {new Date(invoice.issue_date).toLocaleDateString()}
        </div>
      </div>

      {/* Customer Details */}
      {tpl.show_customer_details && customer.name && (
        <div className="mb-6">
          <h3 className="mb-2 font-semibold">{tpl.labels.bill_to}</h3>
          <p className="text-sm">{customer.name}</p>
          {customer.address && <p className="text-sm">{customer.address}</p>}
          {customer.phone && <p className="text-sm">Phone: {customer.phone}</p>}
          {customer.email && <p className="text-sm">Email: {customer.email}</p>}
        </div>
      )}

      {/* Items Table */}
      <table className="mb-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2">
            {tpl.columns.item_name && <th className="p-2 text-left">Item</th>}
            {tpl.columns.description && <th className="p-2 text-left">Description</th>}
            {tpl.columns.qty && <th className="p-2 text-right">Qty</th>}
            {tpl.columns.unit_price && <th className="p-2 text-right">Unit Price</th>}
            {tpl.columns.discount && <th className="p-2 text-right">Discount</th>}
            {tpl.columns.tax && <th className="p-2 text-right">Tax %</th>}
            {tpl.columns.line_total && <th className="p-2 text-right">Total</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b">
              {tpl.columns.item_name && <td className="p-2">{item.item_name}</td>}
              {tpl.columns.description && <td className="p-2">{item.description || "—"}</td>}
              {tpl.columns.qty && <td className="p-2 text-right">{Number(item.qty).toLocaleString()}</td>}
              {tpl.columns.unit_price && <td className="p-2 text-right">{fmt(Number(item.unit_price), tpl.currency_symbol, tpl.currency_format)}</td>}
              {tpl.columns.discount && <td className="p-2 text-right">{fmt(Number(item.discount), tpl.currency_symbol, tpl.currency_format)}</td>}
              {tpl.columns.tax && <td className="p-2 text-right">{Number(item.tax_rate).toFixed(2)}%</td>}
              {tpl.columns.line_total && <td className="p-2 text-right">{fmt(Number(item.line_total), tpl.currency_symbol, tpl.currency_format)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      {tpl.show_tax_discount && (
        <div className="mb-6 ml-auto w-64 text-right text-sm">
          <div className="flex justify-between"><span>Subtotal:</span><span>{fmt(Number(invoice.subtotal), tpl.currency_symbol, tpl.currency_format)}</span></div>
          {Number(invoice.discount_total) > 0 && <div className="flex justify-between"><span>Discount:</span><span>-{fmt(Number(invoice.discount_total), tpl.currency_symbol, tpl.currency_format)}</span></div>}
          {Number(invoice.tax_total) > 0 && <div className="flex justify-between"><span>Tax:</span><span>{fmt(Number(invoice.tax_total), tpl.currency_symbol, tpl.currency_format)}</span></div>}
          <div className="mt-2 flex justify-between border-t-2 pt-2 font-bold">
            <span>Grand Total:</span><span>{fmt(Number(invoice.grand_total), tpl.currency_symbol, tpl.currency_format)}</span>
          </div>
        </div>
      )}

      {/* Notes & Terms */}
      {tpl.show_notes_terms && (invoice.notes || invoice.terms) && (
        <div className="mb-6 text-sm">
          {invoice.notes && <div className="mb-2"><strong>Notes:</strong> {invoice.notes}</div>}
          {invoice.terms && <div><strong>Terms:</strong> {invoice.terms}</div>}
        </div>
      )}

      {/* Signature */}
      {tpl.show_signature && company.signature_name && (
        <div className="mt-12 text-sm">
          {company.signature_url && <img src={company.signature_url} alt="Signature" className="mb-2 h-16 object-contain" />}
          <p>{company.signature_name}</p>
        </div>
      )}

      {/* Footer */}
      {tpl.show_footer && tpl.footer_text && (
        <div className="mt-12 text-center text-sm text-muted-foreground">
          {tpl.footer_text}
        </div>
      )}
    </div>
  );
}
