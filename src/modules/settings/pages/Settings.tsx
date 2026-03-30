import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyProfile from "@/modules/settings/components/CompanyProfile";
import InvoiceNumbering from "@/modules/settings/components/InvoiceNumbering";
import TaxDiscountSettings from "@/modules/settings/components/TaxDiscountSettings";
import NotesTermsSettings from "@/modules/settings/components/NotesTermsSettings";
import TemplateBuilder from "@/modules/settings/components/TemplateBuilder";

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="numbering">Numbering</TabsTrigger>
          <TabsTrigger value="tax">Tax & Discount</TabsTrigger>
          <TabsTrigger value="notes">Notes & Terms</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
        </TabsList>
        <TabsContent value="company"><CompanyProfile /></TabsContent>
        <TabsContent value="numbering"><InvoiceNumbering /></TabsContent>
        <TabsContent value="tax"><TaxDiscountSettings /></TabsContent>
        <TabsContent value="notes"><NotesTermsSettings /></TabsContent>
        <TabsContent value="template"><TemplateBuilder /></TabsContent>
      </Tabs>
    </div>
  );
}
