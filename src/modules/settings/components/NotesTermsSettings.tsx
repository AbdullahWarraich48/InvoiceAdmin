import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesTermsData {
  default_notes: string;
  default_terms: string;
}

const defaults: NotesTermsData = {
  default_notes: "",
  default_terms: "",
};

export default function NotesTermsSettings() {
  const { value, setValue, save, loading } = useSettings<NotesTermsData>("notes_terms_settings", defaults);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <Card>
      <CardHeader><CardTitle>Default Notes & Terms</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          These will be automatically added to every new invoice.
        </p>
        <div className="space-y-2">
          <Label>Default Notes</Label>
          <Textarea
            value={value.default_notes}
            onChange={(e) => setValue({ ...value, default_notes: e.target.value })}
            rows={3}
            placeholder="e.g. Please make payment within 30 days."
          />
        </div>
        <div className="space-y-2">
          <Label>Default Terms & Conditions</Label>
          <Textarea
            value={value.default_terms}
            onChange={(e) => setValue({ ...value, default_terms: e.target.value })}
            rows={3}
            placeholder="e.g. Goods once sold will not be returned."
          />
        </div>
        <Button onClick={() => save(value)}>Save Notes & Terms</Button>
      </CardContent>
    </Card>
  );
}
