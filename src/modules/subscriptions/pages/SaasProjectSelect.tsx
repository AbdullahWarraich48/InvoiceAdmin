import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Layers3, Sparkles, Users2 } from "lucide-react";
import { useSubscriptionCatalog } from "@/features/subscriptions/useSubscriptionCatalog";
import { toast } from "sonner";

export default function SaasProjectSelect() {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const { value: catalog, loading: catalogLoading, save } = useSubscriptionCatalog();

  // Safety: backend catalog payload can be missing or malformed; keep UI resilient.
  const saasProjects = Array.isArray(catalog.saasProjects) ? catalog.saasProjects : [];

  const totalMonthlyUsers = saasProjects.reduce((sum, p) => {
    const n = Number(String(p.monthlyUsers).replace(/,/g, "")) || 0;
    return sum + n;
  }, 0);

  const selectedProject = useMemo(
    () => saasProjects.find((p) => p.id === selectedProjectId) ?? null,
    [saasProjects, selectedProjectId]
  );

  const [newProject, setNewProject] = useState({
    id: "",
    name: "",
    type: "CRM SaaS",
    status: "active",
    monthlyUsers: "0",
  });

  const addProject = async () => {
    const id = newProject.id.trim() || `proj-${Date.now()}`;
    const name = newProject.name.trim();
    const type = newProject.type.trim();
    const status = (newProject.status.trim() || "active").toLowerCase();
    const monthlyUsers = (newProject.monthlyUsers || "0").trim();

    if (!name) return toast.error("Project name is required");
    if (!type) return toast.error("Project type is required");
    if (!id) return toast.error("Project id is required");

    if ((saasProjects ?? []).some((p) => p.id === id)) {
      toast.error("Project id already exists");
      return;
    }

    const next = {
      ...catalog,
      saasProjects: [
        ...(Array.isArray(catalog.saasProjects) ? catalog.saasProjects : []),
        { id, name, type, status, monthlyUsers },
      ],
    };

    const ok = await save(next);
    if (!ok) {
      toast.error("Failed to save project (server error)");
      return;
    }

    setSelectedProjectId(id);
    setNewProject({ id: "", name: "", type: newProject.type, status: newProject.status, monthlyUsers: "0" });
    toast.success("Project added");
  };

  if (catalogLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      <div className="rounded-2xl border bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-purple-500/10 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Select Your SaaS Project</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Pick your project to continue with plan recommendations, pricing, and checkout.
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            <Sparkles className="mr-1 h-3 w-3" /> Premium Subscription Flow
          </Badge>
        </div>
      </div>

      <Card className="rounded-2xl border bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add SaaS Project (Admin)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter dummy data to test your SaaS flow. This updates the subscription catalog.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Project ID (optional)</Label>
              <Input
                value={newProject.id}
                onChange={(e) => setNewProject((prev) => ({ ...prev, id: e.target.value }))}
                placeholder="proj-123"
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
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                value={newProject.name}
                onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. ClientFlow CRM"
              />
            </div>
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Input
                value={newProject.type}
                onChange={(e) => setNewProject((prev) => ({ ...prev, type: e.target.value }))}
                placeholder="e.g. CRM SaaS"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Input
              value={newProject.status}
              onChange={(e) => setNewProject((prev) => ({ ...prev, status: e.target.value }))}
              placeholder="active"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={addProject}>Add Project</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 rounded-2xl border bg-card/50 p-4 text-sm md:grid-cols-3">
        <div className="flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-teal-600" />
          <span className="text-muted-foreground">Projects:</span>
          <span className="font-semibold">{saasProjects.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users2 className="h-4 w-4 text-emerald-600" />
          <span className="text-muted-foreground">Total monthly users:</span>
          <span className="font-semibold">{totalMonthlyUsers.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-purple-600" />
          <span className="text-muted-foreground">Ready for upgrade:</span>
          <span className="font-semibold">All projects</span>
        </div>
      </div>

      {saasProjects.length === 0 && !catalogLoading && (
        <p className="text-sm text-muted-foreground">
          No SaaS projects found in the catalog yet. Add dummy data above to continue.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {saasProjects.map((project) => {
          const selected = project.id === selectedProjectId;
          return (
            <motion.div
              key={project.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={`cursor-pointer rounded-2xl border transition ${
                  selected
                    ? "border-teal-500 shadow-lg shadow-teal-500/10 ring-1 ring-teal-400/40"
                    : "hover:border-teal-300/60 hover:shadow-md"
                }`}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {selected && (
                      <Badge className="rounded-full bg-teal-600 text-white hover:bg-teal-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Selected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{project.type}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={project.status === "active" ? "default" : "secondary"} className="rounded-full capitalize">
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                    <span className="text-muted-foreground">Monthly users</span>
                    <span className="font-semibold">{project.monthlyUsers}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="sticky bottom-3 flex items-center justify-between gap-3 rounded-2xl border bg-background/95 p-3 shadow-sm backdrop-blur">
        <Button variant="outline" onClick={() => navigate("/subscriptions")}>Back</Button>
        <Button
          disabled={!selectedProject}
          className="min-w-52"
          onClick={() => {
            if (!selectedProject) return;
            // Continue SaaS packages, then handle hosting separately.
            navigate(`/subscriptions/saas/plans?projectId=${selectedProject.id}&after=hosting`);
          }}
        >
          Continue to SaaS Plans
        </Button>
      </div>
    </div>
  );
}

