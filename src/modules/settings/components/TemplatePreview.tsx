import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import PrintableInvoice, {
  type TemplateData,
  type CompanyData,
  defaultCompany,
} from "@/modules/invoices/components/PrintableInvoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";

const sampleInvoice = {
  invoice_number: "INV-2026-001",
  issue_date: "2026-02-23",
  due_date: "2026-03-23",
  status: "finalized",
  subtotal: 25000,
  discount_total: 1500,
  tax_total: 3525,
  grand_total: 27025,
  notes: "Please make payment within 30 days.",
  terms: "Goods once sold will not be returned.",
  customers: {
    name: "Acme Corporation",
    email: "billing@acme.com",
    phone: "+92 300 1234567",
    address: "123 Business Ave, Karachi",
  },
};

const sampleItems = [
  { id: "1", item_name: "Web Design", description: "Landing page design", qty: 1, unit_price: 15000, discount: 1000, tax_rate: 17, line_total: 16380 },
  { id: "2", item_name: "Logo Design", description: "Brand identity", qty: 2, unit_price: 5000, discount: 500, tax_rate: 5, line_total: 9975 },
  { id: "3", item_name: "Hosting", description: "Annual hosting plan", qty: 1, unit_price: 3000, discount: 0, tax_rate: 0, line_total: 3000 },
];

interface TemplatePreviewProps {
  templateData: TemplateData;
}

export default function TemplatePreview({ templateData }: TemplatePreviewProps) {
  const [company, setCompany] = useState<CompanyData>(defaultCompany);

  useEffect(() => {
    api.getSetting("company_profile")
      .then((data) => {
        const raw = data?.value;
        if (!raw) return;
        if (typeof raw === "string") {
          try {
            setCompany(JSON.parse(raw) as CompanyData);
          } catch {
            setCompany(raw as unknown as CompanyData);
          }
        } else {
          setCompany(raw as CompanyData);
        }
      })
      .catch(() => {
        // Use default if fetch fails
      });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Template Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <PrintableInvoice
            invoice={sampleInvoice}
            items={sampleItems}
            templateOverride={templateData}
            companyOverride={company}
            showOnScreen
          />
        </div>
      </CardContent>
    </Card>
  );
}
