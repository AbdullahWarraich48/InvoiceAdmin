import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface CompanyData {
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

const defaultCompany: CompanyData = {
  name: "", address: "", phone: "", email: "", ntn: "",
  logo_url: "", bank_details: "", signature_name: "", signature_url: "",
};

export default function CompanyProfile() {
  const { value, setValue, save, loading } = useSettings<CompanyData>("company_profile", defaultCompany);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (field: "logo_url" | "signature_url", file: File) => {
    setUploading(true);
    // TODO: Implement file upload endpoint in backend
    // For now, convert to base64 or use a placeholder
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setValue({ ...value, [field]: base64String });
      setUploading(false);
      toast.info("File upload will be implemented with backend storage. Using base64 for now.");
    };
    reader.readAsDataURL(file);
  };

  const update = (field: keyof CompanyData, val: string) => setValue({ ...value, [field]: val });

  const handleSave = async () => {
    const success = await save(value);
    if (success) {
      toast.success("Company profile saved");
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <Card>
      <CardHeader><CardTitle>Company Profile</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Company Name</Label><Input value={value.name} onChange={(e) => update("name", e.target.value)} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={value.email} onChange={(e) => update("email", e.target.value)} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={value.phone} onChange={(e) => update("phone", e.target.value)} /></div>
          <div className="space-y-2"><Label>NTN / VAT</Label><Input value={value.ntn} onChange={(e) => update("ntn", e.target.value)} /></div>
        </div>
        <div className="space-y-2"><Label>Address</Label><Textarea value={value.address} onChange={(e) => update("address", e.target.value)} rows={2} /></div>
        <div className="space-y-2"><Label>Bank Details</Label><Textarea value={value.bank_details} onChange={(e) => update("bank_details", e.target.value)} rows={2} /></div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Company Logo</Label>
            {value.logo_url && <img src={value.logo_url} alt="Logo" className="mb-2 h-20 object-contain" />}
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload("logo_url", file);
                }}
                disabled={uploading}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Authorized Signature</Label>
            {value.signature_url && <img src={value.signature_url} alt="Signature" className="mb-2 h-20 object-contain" />}
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload("signature_url", file);
                }}
                disabled={uploading}
                className="flex-1"
              />
            </div>
            <Input
              placeholder="Signature Name"
              value={value.signature_name}
              onChange={(e) => update("signature_name", e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={uploading}>
          {uploading ? "Uploading..." : "Save Company Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}
