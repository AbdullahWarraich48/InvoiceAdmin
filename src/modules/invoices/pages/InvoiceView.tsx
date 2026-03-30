import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Printer, Edit, Trash2, CheckCircle, XCircle, Lock, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import PrintableInvoice from "@/modules/invoices/components/PrintableInvoice";

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSuperAdmin, isGenerator } = useAuth();
  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const data = await api.getInvoice(id!);
      setInvoice(data);
      setItems(data.items || []);
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to load invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await api.updateInvoiceStatus(id!, status);
      toast.success(`Invoice ${status}`);
      loadInvoice();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const softDelete = async () => {
    try {
      await api.deleteInvoice(id!);
      toast.success("Invoice deleted");
      navigate("/invoices");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete invoice");
    }
  };

  const canEdit = isSuperAdmin || (isGenerator && invoice?.created_by === user?.id && invoice?.status === "draft");

  if (loading) return <p className="p-6 text-muted-foreground">Loading...</p>;
  if (!invoice) return <p className="p-6 text-muted-foreground">Invoice not found.</p>;

  const statusColor: Record<string, string> = { draft: "secondary", finalized: "default", paid: "default", cancelled: "destructive" };
  const notesText = String(invoice.notes ?? "");
  const termsText = String(invoice.terms ?? "");

  const billingModel: "one_time" | "subscription" =
    notesText.includes("[BillingModel:subscription]") ? "subscription" : "one_time";

  const getTagValue = (text: string, tag: string) => {
    const match = text.match(new RegExp(`\\[${tag}:(.*?)\\]`));
    return match?.[1] ?? "";
  };

  const subscription = billingModel === "subscription" ? {
    planName: getTagValue(termsText, "PlanName"),
    billingCycle: getTagValue(termsText, "BillingCycle"),
    start: getTagValue(termsText, "SubscriptionStart"),
    end: getTagValue(termsText, "SubscriptionEnd"),
    autoRenew: getTagValue(termsText, "AutoRenew"),
  } : null;

  const stripInternalTags = (text: string) => text
    .replace(/\s*\[BillingModel:(one_time|subscription)\]/g, "")
    .replace(/\s*\[PlanName:.*?\]/g, "")
    .replace(/\s*\[BillingCycle:.*?\]/g, "")
    .replace(/\s*\[SubscriptionStart:.*?\]/g, "")
    .replace(/\s*\[SubscriptionEnd:.*?\]/g, "")
    .replace(/\s*\[AutoRenew:.*?\]/g, "")
    .trim();

  const cleanNotes = stripInternalTags(notesText);
  const cleanTerms = stripInternalTags(termsText);

  return (
    <div className="space-y-6">
      {/* Hidden printable invoice */}
      <PrintableInvoice invoice={invoice} items={items} />

      <div className="no-print flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
          <Badge variant={statusColor[invoice.status] as any}>{invoice.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          {canEdit && (
            <Button variant="outline" asChild>
              <Link to={`/invoices/${id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Status Actions */}
      {(isSuperAdmin || (isGenerator && invoice.status === "draft")) && (
        <div className="no-print flex gap-2">
          {invoice.status === "draft" && (
            <Button onClick={() => updateStatus("finalized")}>
              <Lock className="mr-2 h-4 w-4" /> Finalize
            </Button>
          )}
          {isSuperAdmin && invoice.status === "finalized" && (
            <Button onClick={() => updateStatus("paid")} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" /> Mark Paid
            </Button>
          )}
          {isSuperAdmin && invoice.status !== "cancelled" && (
            <Button variant="outline" onClick={() => updateStatus("cancelled")}>
              <XCircle className="mr-2 h-4 w-4" /> Cancel
            </Button>
          )}
          {isSuperAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                  <AlertDialogDescription>This will soft-delete the invoice. It can be recovered later.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={softDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}

      <div className="no-print grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Invoice Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Invoice #</span><span>{invoice.invoice_number}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Issue Date</span><span>{format(new Date(invoice.issue_date), "dd MMM yyyy")}</span></div>
            {invoice.due_date && <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span>{format(new Date(invoice.due_date), "dd MMM yyyy")}</span></div>}
            {invoice.categories?.name && <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{invoice.categories.name}</span></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {invoice.customers ? (
              <>
                <p className="font-medium">{invoice.customers.name}</p>
                {invoice.customers.email && <p className="text-muted-foreground">{invoice.customers.email}</p>}
                {invoice.customers.phone && <p className="text-muted-foreground">{invoice.customers.phone}</p>}
                {invoice.customers.address && <p className="text-muted-foreground">{invoice.customers.address}</p>}
              </>
            ) : (
              <p className="text-muted-foreground">No customer assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="no-print">
        <CardHeader><CardTitle>Billing</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Type</span>
            <span className="font-medium">{billingModel === "subscription" ? "Subscription" : "One-time"}</span>
          </div>

          {subscription && (
            <div className="mt-3 rounded-lg border p-3 space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="font-medium">{subscription.planName || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Billing Cycle</span><span>{subscription.billingCycle || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Start</span><span>{subscription.start ? format(new Date(subscription.start), "dd MMM yyyy") : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">End</span><span>{subscription.end && subscription.end !== "none" ? format(new Date(subscription.end), "dd MMM yyyy") : "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Auto Renew</span><span>{subscription.autoRenew ? (subscription.autoRenew === "yes" ? "Yes" : "No") : "—"}</span></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="no-print">
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Tax %</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.item_name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.description || "—"}</TableCell>
                  <TableCell className="text-right">{item.qty}</TableCell>
                  <TableCell className="text-right">Rs. {Number(item.unit_price).toLocaleString()}</TableCell>
                  <TableCell className="text-right">Rs. {Number(item.discount).toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.tax_rate}%</TableCell>
                  <TableCell className="text-right font-medium">Rs. {Number(item.line_total).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>Rs. {Number(invoice.subtotal).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-Rs. {Number(invoice.discount_total).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>Rs. {Number(invoice.tax_total).toLocaleString()}</span></div>
              <Separator />
              <div className="flex justify-between font-bold text-base"><span>Grand Total</span><span>Rs. {Number(invoice.grand_total).toLocaleString()}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {cleanNotes && (
        <Card className="no-print">
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{cleanNotes}</p></CardContent>
        </Card>
      )}

      {cleanTerms && (
        <Card className="no-print">
          <CardHeader><CardTitle>Terms & Conditions</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{cleanTerms}</p></CardContent>
        </Card>
      )}

      {isSuperAdmin && logs.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="relative space-y-0">
              {logs.map((log: any, idx: number) => {
                const actionConfig: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
                  created: { label: "Invoice Created", icon: CheckCircle, color: "text-green-600" },
                  updated: { label: "Invoice Updated", icon: Edit, color: "text-blue-600" },
                  status_changed: { label: `Status → ${(log.metadata as any)?.new_status ?? ""}`, icon: Lock, color: "text-amber-600" },
                  deleted: { label: "Invoice Deleted", icon: Trash2, color: "text-destructive" },
                  hard_deleted: { label: "Invoice Hard Deleted", icon: Trash2, color: "text-destructive" },
                };
                const config = actionConfig[log.action] ?? { label: log.action, icon: CheckCircle, color: "text-muted-foreground" };
                const Icon = config.icon;
                const meta = log.metadata as Record<string, any> | null;

                return (
                  <div key={log.id} className="flex gap-4 pb-6 last:pb-0">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {idx < logs.length - 1 && <div className="w-px flex-1 bg-border" />}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-baseline justify-between">
                        <p className="font-medium text-sm">{config.label}</p>
                        <span className="text-xs text-muted-foreground">{format(new Date(log.created_at), "dd MMM yyyy, HH:mm")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">by {log.profiles?.name ?? "System"}</p>
                      {meta && Object.keys(meta).length > 0 && (
                        <div className="mt-1 rounded border bg-muted/50 px-2 py-1">
                          {meta.old_status && meta.new_status && (
                            <p className="text-xs"><span className="text-muted-foreground">Status:</span> {meta.old_status} → {meta.new_status}</p>
                          )}
                          {meta.old_total !== undefined && meta.new_total !== undefined && (
                            <p className="text-xs"><span className="text-muted-foreground">Total:</span> Rs. {Number(meta.old_total).toLocaleString()} → Rs. {Number(meta.new_total).toLocaleString()}</p>
                          )}
                          {meta.invoice_number && !meta.old_status && (
                            <p className="text-xs"><span className="text-muted-foreground">Invoice:</span> {meta.invoice_number}</p>
                          )}
                          {meta.grand_total !== undefined && meta.status && (
                            <p className="text-xs"><span className="text-muted-foreground">Total:</span> Rs. {Number(meta.grand_total).toLocaleString()} · <span className="text-muted-foreground">Status:</span> {meta.status}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
