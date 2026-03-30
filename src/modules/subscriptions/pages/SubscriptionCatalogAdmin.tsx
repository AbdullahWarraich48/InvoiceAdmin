import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
import type { PlanTier, HostingPlan, ComparisonRow, TrustBadge } from "@/features/subscriptions/types";
import type { SubscriptionCatalog } from "@/features/subscriptions/catalog";
import { defaultSubscriptionCatalog } from "@/features/subscriptions/catalog";
import { useSubscriptionCatalog } from "@/features/subscriptions/useSubscriptionCatalog";
import { useNavigate, useSearchParams } from "react-router-dom";

const Tiers: PlanTier[] = ["starter", "premium", "business", "cloud-pro"];

function asNumber(input: string) {
  const cleaned = input.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export default function SubscriptionCatalogAdmin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") as "hosting" | "saas" | "all" | null) || "all";

  const { value: catalog, save, loading } = useSubscriptionCatalog();
  const [draft, setDraft] = useState<SubscriptionCatalog>(catalog);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [selectedSaasProjectId, setSelectedSaasProjectId] = useState<string>("");
  const [planSearch, setPlanSearch] = useState("");
  const [newProject, setNewProject] = useState<{
    id: string;
    name: string;
    type: string;
    status: string;
    monthlyUsers: string;
    packagesReady: boolean;
  }>({
    id: "",
    name: "",
    type: "CRM SaaS",
    status: "active",
    monthlyUsers: "0",
    packagesReady: false,
  });

  useEffect(() => {
    setDraft(catalog);
  }, [catalog]);

  useEffect(() => {
    if (mode !== "saas" && mode !== "all") return;
    const projects = draft.saasProjects ?? [];
    const exists = selectedSaasProjectId ? projects.some((p) => p.id === selectedSaasProjectId) : false;
    if (!exists) setSelectedSaasProjectId(projects[0]?.id ?? "");
  }, [mode, draft.saasProjects, selectedSaasProjectId]);

  const isReady = !loading;

  const onReset = () => {
    setDraft(defaultSubscriptionCatalog);
    setConfirmResetOpen(false);
    toast.success("Reset to default catalog (not saved yet).");
  };

  const updateHostingPlan = (tier: PlanTier, updater: (p: HostingPlan) => HostingPlan) => {
    setDraft((prev) => ({
      ...prev,
      hostingPlans: prev.hostingPlans.map((p) => (p.id === tier ? updater(p) : p)),
    }));
  };

  const updateSaasPlan = (tier: PlanTier, updater: (p: HostingPlan) => HostingPlan) => {
    setDraft((prev) => ({
      ...prev,
      saasPlans: prev.saasPlans.map((p) => (p.id === tier ? updater(p) : p)),
    }));
  };

  const updateTrustBadges = (idx: number, updater: (b: TrustBadge) => TrustBadge) => {
    setDraft((prev) => ({
      ...prev,
      trustBadges: prev.trustBadges.map((b, i) => (i === idx ? updater(b) : b)),
    }));
  };

  const updateComparisonRow = (
    section: "comparisonRows" | "saasComparisonRows",
    rowKey: string,
    tier: PlanTier,
    nextValue: string | boolean
  ) => {
    setDraft((prev) => ({
      ...prev,
      [section]: prev[section].map((row) => {
        if (row.key !== rowKey) return row;
        return {
          ...row,
          values: {
            ...(row.values as any),
            [tier]: nextValue,
          },
        } as ComparisonRow;
      }),
    }));
  };

  const updateComparisonRowLabel = (section: "comparisonRows" | "saasComparisonRows", rowKey: string, label: string) => {
    setDraft((prev) => ({
      ...prev,
      [section]: prev[section].map((row) => (row.key === rowKey ? { ...row, label } : row)),
    }));
  };

  const addSaasProject = () => {
    const name = newProject.name.trim();
    const type = newProject.type.trim();
    if (!name) {
      toast.error("Project name is required");
      return;
    }
    if (!type) {
      toast.error("Project type is required");
      return;
    }
    const id = newProject.id.trim() || `proj-${Date.now()}`;
    const monthlyUsers = newProject.monthlyUsers.trim() || "0";

    setDraft((prev) => {
      const list = prev.saasProjects ?? [];
      if (list.some((p) => p.id === id)) {
        toast.error("Project id already exists");
        return prev;
      }
      return {
        ...prev,
        saasProjects: [
          ...list,
          {
            id,
            name,
            type,
            status: newProject.status || "active",
            monthlyUsers,
            packagesReady: false,
          } as any,
        ],
      };
    });

    setNewProject({
      id: "",
      name: "",
      type: newProject.type,
      status: newProject.status,
      monthlyUsers: "0",
      packagesReady: false,
    });
    toast.success("SaaS project added to draft.");
  };

  const handleSave = async () => {
    const ok = await save(draft);
    if (ok) toast.success("Subscription catalog saved.");
  };

  const matchesPlanSearch = (plan: HostingPlan) => {
    const q = planSearch.trim().toLowerCase();
    if (!q) return true;
    return `${plan.name} ${plan.id} ${plan.tagline} ${plan.description}`.toLowerCase().includes(q);
  };

  const renderPlanAccordion = (
    plans: HostingPlan[],
    onUpdate: (tier: PlanTier, updater: (p: HostingPlan) => HostingPlan) => void
  ) => {
    const visible = plans.filter(matchesPlanSearch);

    if (visible.length === 0) {
      return (
        <div className="rounded-2xl border bg-muted/30 p-6">
          <p className="text-sm font-medium">No packages match your search.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different keyword (name, tier, tagline).</p>
        </div>
      );
    }

    return (
      <Accordion type="multiple" className="rounded-2xl border bg-card/40">
        {visible.map((plan) => {
          const monthly = plan.prices?.monthly ?? 0;
          const yearly = plan.prices?.yearly ?? 0;
          return (
            <AccordionItem key={plan.id} value={plan.id} className="border-b last:border-b-0">
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex w-full flex-wrap items-center justify-between gap-3 pr-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge variant="secondary" className="rounded-full capitalize">
                      {plan.id}
                    </Badge>
                    <p className="truncate text-left font-semibold">{plan.name}</p>
                    {plan.featured && (
                      <Badge className="rounded-full bg-teal-600 text-white hover:bg-teal-600">Featured</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border px-2 py-1">Monthly: {monthly.toLocaleString()}</span>
                    <span className="rounded-full border px-2 py-1">Yearly: {yearly.toLocaleString()}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={plan.name} onChange={(e) => onUpdate(plan.id, (p) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>CTA Label</Label>
                      <Input value={plan.ctaLabel} onChange={(e) => onUpdate(plan.id, (p) => ({ ...p, ctaLabel: e.target.value }))} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Tagline</Label>
                      <Input value={plan.tagline} onChange={(e) => onUpdate(plan.id, (p) => ({ ...p, tagline: e.target.value }))} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Input value={plan.description} onChange={(e) => onUpdate(plan.id, (p) => ({ ...p, description: e.target.value }))} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background/70 p-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold">Visibility</p>
                      <p className="text-sm text-muted-foreground">Mark a plan as featured to highlight it in the UI.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={Boolean(plan.featured)}
                        onCheckedChange={(checked) => onUpdate(plan.id, (p) => ({ ...p, featured: checked }))}
                      />
                      <Label>Featured</Label>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">Pricing</p>
                      <p className="text-xs text-muted-foreground">Enter numbers only (no commas).</p>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="space-y-2">
                        <Label>Monthly</Label>
                        <Input
                          type="number"
                          value={plan.prices.monthly}
                          onChange={(e) =>
                            onUpdate(plan.id, (p) => ({ ...p, prices: { ...p.prices, monthly: asNumber(e.target.value) } }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Yearly</Label>
                        <Input
                          type="number"
                          value={plan.prices.yearly}
                          onChange={(e) =>
                            onUpdate(plan.id, (p) => ({ ...p, prices: { ...p.prices, yearly: asNumber(e.target.value) } }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Yearly Original</Label>
                        <Input
                          type="number"
                          value={plan.prices.yearlyOriginal}
                          onChange={(e) =>
                            onUpdate(plan.id, (p) => ({ ...p, prices: { ...p.prices, yearlyOriginal: asNumber(e.target.value) } }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Renewal Monthly</Label>
                        <Input
                          type="number"
                          value={plan.prices.renewalMonthly}
                          onChange={(e) =>
                            onUpdate(plan.id, (p) => ({ ...p, prices: { ...p.prices, renewalMonthly: asNumber(e.target.value) } }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">Included features</p>
                      <p className="text-xs text-muted-foreground">Toggle + rename feature labels.</p>
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      {plan.features.map((f, idx) => (
                        <div key={`${plan.id}-${idx}`} className="flex items-center gap-3">
                          <Checkbox
                            checked={Boolean(f.included)}
                            onCheckedChange={(checked) =>
                              onUpdate(plan.id, (p) => ({
                                ...p,
                                features: p.features.map((x, i) => (i === idx ? { ...x, included: checked === true } : x)),
                              }))
                            }
                          />
                          <Input
                            value={f.label}
                            onChange={(e) =>
                              onUpdate(plan.id, (p) => ({
                                ...p,
                                features: p.features.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)),
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  };

  const renderComparisonRowEditor = (
    section: "comparisonRows" | "saasComparisonRows",
    rows: ComparisonRow[]
  ) => {
    return (
      <div className="space-y-4">
        {rows.map((row) => (
          <Card key={row.key} className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{row.key}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={row.label}
                  onChange={(e) => updateComparisonRowLabel(section, row.key, e.target.value)}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                {Tiers.map((tier) => {
                  const current = (row.values as any)[tier] as string | boolean | undefined;
                  const isBoolean = typeof current === "boolean";
                  return (
                    <div key={tier} className="space-y-2">
                      <Label className="text-xs text-muted-foreground capitalize">{tier}</Label>
                      {isBoolean ? (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={Boolean(current)}
                            onCheckedChange={(checked) => {
                              updateComparisonRow(section, row.key, tier, checked === true);
                            }}
                          />
                          <span className="text-sm">{Boolean(current) ? "Yes" : "No"}</span>
                        </div>
                      ) : (
                        <Input
                          value={String(current ?? "")}
                          onChange={(e) => updateComparisonRow(section, row.key, tier, e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (!isReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading subscription catalog...</p>
      </div>
    );
  }

  const selectedSaasProject =
    (draft.saasProjects ?? []).find((p) => p.id === selectedSaasProjectId) ?? null;
  const matchedSaasPlans = selectedSaasProject
    ? (draft.saasPlans ?? []).filter((plan) => (plan.projectTypes ?? []).includes(selectedSaasProject.type))
    : (draft.saasPlans ?? []);

  const hasMatchedSaasPlans = selectedSaasProject ? matchedSaasPlans.length > 0 : true;
  // If no packages match the project type, fall back to all so the admin can still edit.
  const saasPlansForSelectedProject = hasMatchedSaasPlans ? matchedSaasPlans : (draft.saasPlans ?? []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Subscription Catalog Editor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Editing mode: <span className="font-semibold">{mode}</span>. Saves to backend setting <code>{`subscription_catalog`}</code>.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Updates are saved to backend setting <code>{`subscription_catalog`}</code> and shown on the public website.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={mode === "hosting" ? "default" : "outline"}
            onClick={() => navigate("/subscriptions/catalog?mode=hosting")}
          >
            Hosting packages
          </Button>
          <Button
            variant={mode === "saas" ? "default" : "outline"}
            onClick={() => navigate("/subscriptions/catalog?mode=saas")}
          >
            SaaS packages
          </Button>
          <Button
            variant={mode === "all" ? "default" : "outline"}
            onClick={() => navigate("/subscriptions/catalog?mode=all")}
          >
            Advanced (all)
          </Button>

          <AlertDialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Reset</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset catalog?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset the editor back to default values (changes are not saved until you press Save).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onReset}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave}>Save Catalog</Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold">Search packages</p>
            <p className="text-sm text-muted-foreground">Filters Hosting/SaaS plans by name, tier, tagline, description.</p>
          </div>
          <div className="w-full md:w-80">
            <Input
              value={planSearch}
              onChange={(e) => setPlanSearch(e.target.value)}
              placeholder="Search packages…"
            />
          </div>
        </CardContent>
      </Card>

      {mode !== "saas" && (
        <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Hosting Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderPlanAccordion(draft.hostingPlans, updateHostingPlan)}
        </CardContent>
      </Card>
      )}

      {mode !== "hosting" && (
        <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>SaaS Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(mode === "saas" || mode === "all") && selectedSaasProject && (
            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-sm font-semibold">
                Related SaaS Packages for Type:{" "}
                <span className="font-bold text-teal-700">{selectedSaasProject.type}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasMatchedSaasPlans
                  ? `Showing ${matchedSaasPlans.length} matching plan${matchedSaasPlans.length === 1 ? "" : "s"} for this type.`
                  : "No matching packages found for this project type — showing all SaaS plans so you can still edit."}
              </p>
            </div>
          )}

          {renderPlanAccordion(saasPlansForSelectedProject, updateSaasPlan)}
        </CardContent>
      </Card>
      )}

      {mode === "saas" || mode === "all" ? (
        <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>SaaS Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="mb-6 rounded-xl border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Add New Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Project ID (optional)</Label>
                  <Input
                    value={newProject.id}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, id: e.target.value }))}
                    placeholder="proj-123 (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Users</Label>
                  <Input
                    value={newProject.monthlyUsers}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, monthlyUsers: e.target.value }))}
                    placeholder="e.g. 12,400"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={newProject.name} onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input value={newProject.type} onChange={(e) => setNewProject((prev) => ({ ...prev, type: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Input value={newProject.status} onChange={(e) => setNewProject((prev) => ({ ...prev, status: e.target.value }))} />
                </div>
                <div className="flex items-end justify-end">
                  <Button onClick={addSaasProject}>Add Project</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {(draft.saasProjects ?? []).map((p, idx) => (
            <Card
              key={`${p.id}-${idx}`}
              className={`rounded-xl border-dashed transition ${p.id === selectedSaasProjectId ? "border-teal-500 shadow-md shadow-teal-500/10" : ""}`}
              onClick={() => setSelectedSaasProjectId(p.id)}
            >
              <CardHeader>
                <CardTitle className="text-base">Project {p.id}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>ID</Label>
                  <Input value={p.id} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Input value={p.status} onChange={(e) => setDraft((prev) => ({ ...prev, saasProjects: prev.saasProjects.map((x, i) => (i === idx ? { ...x, status: e.target.value } : x)) }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Name</Label>
                  <Input value={p.name} onChange={(e) => setDraft((prev) => ({ ...prev, saasProjects: prev.saasProjects.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input value={p.type} onChange={(e) => setDraft((prev) => ({ ...prev, saasProjects: prev.saasProjects.map((x, i) => (i === idx ? { ...x, type: e.target.value } : x)) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Users</Label>
                  <Input value={String(p.monthlyUsers)} onChange={(e) => setDraft((prev) => ({ ...prev, saasProjects: prev.saasProjects.map((x, i) => (i === idx ? { ...x, monthlyUsers: e.target.value } : x)) }))} />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-2 md:col-span-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">Packages ready</p>
                    <p className="text-xs text-muted-foreground">Turn on when you finished mapping plans for this project type.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={Boolean((p as any).packagesReady)}
                      onCheckedChange={(checked) =>
                        setDraft((prev) => ({
                          ...prev,
                          saasProjects: prev.saasProjects.map((x, i) =>
                            i === idx ? ({ ...(x as any), packagesReady: checked } as any) : x
                          ),
                        }))
                      }
                    />
                    <Label className="text-sm">{Boolean((p as any).packagesReady) ? "Ready" : "Not ready"}</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {selectedSaasProject && (
            <Card className="rounded-2xl border-dashed">
              <CardHeader>
                <CardTitle className="text-base">
                  Related SaaS Packages for Type:{" "}
                  <span className="text-teal-700">{selectedSaasProject.type}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(draft.saasPlans ?? []).map((plan) => {
                  const related = (plan.projectTypes ?? []).includes(selectedSaasProject.type);
                  return (
                    <label key={plan.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3">
                      <div className="space-y-0.5">
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">Plan tier: {plan.id}</p>
                      </div>
                      <Checkbox
                        checked={related}
                        onCheckedChange={(checked) => {
                          const nextChecked = checked === true;
                          setDraft((prev) => ({
                            ...prev,
                            saasPlans: (prev.saasPlans ?? []).map((p) => {
                              if (p.id !== plan.id) return p;
                              const current = p.projectTypes ?? [];
                              const nextTypes = nextChecked
                                ? Array.from(new Set([...current, selectedSaasProject.type]))
                                : current.filter((t) => t !== selectedSaasProject.type);
                              return { ...p, projectTypes: nextTypes };
                            }),
                          }));
                        }}
                      />
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      ) : null}

      {mode === "all" ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Add-ons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {draft.addOns.map((a, idx) => (
              <Card key={a.id} className="rounded-xl border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">Add-on {a.id}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={a.name} onChange={(e) => setDraft((prev) => ({ ...prev, addOns: prev.addOns.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={a.description} onChange={(e) => setDraft((prev) => ({ ...prev, addOns: prev.addOns.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Price</Label>
                    <Input
                      type="number"
                      value={a.monthlyPrice}
                      onChange={(e) => setDraft((prev) => ({ ...prev, addOns: prev.addOns.map((x, i) => (i === idx ? { ...x, monthlyPrice: asNumber(e.target.value) } : x)) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Yearly Price</Label>
                    <Input
                      type="number"
                      value={a.yearlyPrice}
                      onChange={(e) => setDraft((prev) => ({ ...prev, addOns: prev.addOns.map((x, i) => (i === idx ? { ...x, yearlyPrice: asNumber(e.target.value) } : x)) }))}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {mode === "all" ? (
        <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Trust Badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft.trustBadges.map((b, idx) => (
            <Card key={b.id} className="rounded-xl border-dashed">
              <CardContent className="grid gap-3 md:grid-cols-2 p-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={b.title} onChange={(e) => updateTrustBadges(idx, (x) => ({ ...x, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input value={b.subtitle} onChange={(e) => updateTrustBadges(idx, (x) => ({ ...x, subtitle: e.target.value }))} />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
      ) : null}

      {mode === "all" ? (
        <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Comparison Tables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderComparisonRowEditor("comparisonRows", draft.comparisonRows)}
          {renderComparisonRowEditor("saasComparisonRows", draft.saasComparisonRows)}
        </CardContent>
      </Card>
      ) : null}
    </div>
  );
}

