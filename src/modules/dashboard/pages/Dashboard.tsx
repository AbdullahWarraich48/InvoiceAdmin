import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface RecentInvoice {
  id: string;
  invoice_number: string;
  grand_total: number;
  status: string;
  issue_date: string;
  customers: { name: string } | null;
}

export default function Dashboard() {
  const { isSuperAdmin } = useAuth();
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0, thisMonth: 0 });
  const [recent, setRecent] = useState<RecentInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getDashboard();
        setStats({
          total: Number(data?.summary?.totalInvoices ?? 0),
          paid: Number(data?.summary?.paidInvoices ?? 0),
          unpaid: Number(data?.summary?.unpaidInvoices ?? 0),
          thisMonth: Number(data?.summary?.thisMonthRevenue ?? 0),
        });
        setRecent(data.recentInvoices.map((inv: any) => ({
          ...inv,
          customers: inv.customer_name ? { name: inv.customer_name } : null
        })));
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const tiles = [
    { label: "Total Invoices", value: stats.total, icon: FileText, color: "text-blue-600" },
    { label: "Paid", value: stats.paid, icon: CheckCircle, color: "text-green-600" },
    { label: "Unpaid", value: stats.unpaid, icon: Clock, color: "text-amber-600" },
    { label: "This Month Revenue", value: `Rs. ${Number(stats.thisMonth).toLocaleString()}`, icon: DollarSign, color: "text-primary" },
  ];

  const statusColor: Record<string, string> = {
    draft: "secondary",
    finalized: "default",
    paid: "default",
    cancelled: "destructive",
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.label}</CardTitle>
              <t.icon className={`h-5 w-5 ${t.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{t.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((inv) => (
                <Link
                  key={inv.id}
                  to={`/invoices/${inv.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{inv.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">{inv.customers?.name ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusColor[inv.status] as any}>{inv.status}</Badge>
                    <span className="text-sm font-medium">Rs. {Number(inv.grand_total).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
