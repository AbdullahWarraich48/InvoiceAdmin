import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Login, Signup, ForgotPassword, ResetPassword } from "@/modules/auth";
import { Pending, NotFound } from "@/modules/system";
import { Dashboard } from "@/modules/dashboard";
import { UsersManagement } from "@/modules/users";
import { InvoiceList, InvoiceForm, InvoiceView } from "@/modules/invoices";
import {
  Subscriptions,
  SaasProjectSelect,
  SubscriptionPricing,
  SubscriptionCheckout,
  SubscriptionPayment,
  SubscriptionSuccess,
  SubscriptionManage,
  SubscriptionCatalogAdmin,
} from "@/modules/subscriptions";
import { Customers } from "@/modules/customers";
import { Categories } from "@/modules/categories";
import { Settings } from "@/modules/settings";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRoles }: { children: React.ReactNode; requiredRoles?: string[] }) {
  const { session, loading, isActive, roles } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }
  if (!session) return <Navigate to="/login" replace />;
  if (!isActive) return <Navigate to="/pending" replace />;
  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.some((r) => roles.includes(r as any))) {
    return <Navigate to="/" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, isActive } = useAuth();
  if (loading) return null;
  if (session && isActive) return <Navigate to="/" replace />;
  if (session && !isActive) return <Navigate to="/pending" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/pending" element={<Pending />} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute requiredRoles={["super_admin"]}><UsersManagement /></ProtectedRoute>} />

      {/* Invoice routes */}
      <Route path="/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
      <Route path="/invoices/new" element={<ProtectedRoute requiredRoles={["super_admin", "generator"]}><InvoiceForm /></ProtectedRoute>} />
      <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />
      <Route path="/invoices/:id/edit" element={<ProtectedRoute requiredRoles={["super_admin", "generator"]}><InvoiceForm /></ProtectedRoute>} />

      {/* Subscription routes */}
      <Route path="/subscriptions" element={<ProtectedRoute requiredRoles={["super_admin", "generator"]}><Subscriptions /></ProtectedRoute>} />
      <Route path="/subscriptions/saas/projects" element={<ProtectedRoute requiredRoles={["super_admin", "generator"]}><SaasProjectSelect /></ProtectedRoute>} />
      <Route path="/subscriptions/saas/plans" element={<ProtectedRoute requiredRoles={["super_admin", "generator"]}><SubscriptionPricing /></ProtectedRoute>} />
      <Route path="/subscriptions/hosting/plans" element={<ProtectedRoute requiredRoles={["super_admin", "generator"]}><SubscriptionPricing /></ProtectedRoute>} />
      <Route path="/subscriptions/checkout" element={<ProtectedRoute requiredRoles={["super_admin", "generator"]}><SubscriptionCheckout /></ProtectedRoute>} />
      <Route path="/subscriptions/payment" element={<ProtectedRoute requiredRoles={["super_admin", "generator"]}><SubscriptionPayment /></ProtectedRoute>} />
      <Route path="/subscriptions/success" element={<ProtectedRoute requiredRoles={["super_admin", "generator"]}><SubscriptionSuccess /></ProtectedRoute>} />
      <Route path="/subscriptions/manage" element={<ProtectedRoute requiredRoles={["super_admin", "generator"]}><SubscriptionManage /></ProtectedRoute>} />
      <Route path="/subscriptions/catalog" element={<ProtectedRoute requiredRoles={["super_admin"]}><SubscriptionCatalogAdmin /></ProtectedRoute>} />
      <Route
        path="/subscriptions/catalog/hosting"
        element={<ProtectedRoute requiredRoles={["super_admin"]}><Navigate to="/subscriptions/catalog?mode=hosting" replace /></ProtectedRoute>}
      />
      <Route
        path="/subscriptions/catalog/saas"
        element={<ProtectedRoute requiredRoles={["super_admin"]}><Navigate to="/subscriptions/catalog?mode=saas" replace /></ProtectedRoute>}
      />

      {/* Other CRUD routes */}
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute requiredRoles={["super_admin"]}><Categories /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute requiredRoles={["super_admin"]}><Settings /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">This page will be built in the next phase.</p>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
