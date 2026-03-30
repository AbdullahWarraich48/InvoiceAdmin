import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Rocket, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";

export default function Subscriptions() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 pb-6">
      <section className="rounded-2xl border bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-purple-500/10 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">Choose Subscription Type</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Pick the subscription journey that matches your need. You can subscribe for an existing SaaS product
              or for a hosting plan directly.
            </p>
          </div>
          <Badge className="rounded-full bg-teal-600 px-3 py-1 text-white hover:bg-teal-600">
            <Sparkles className="mr-1 h-3 w-3" /> Premium Flow
          </Badge>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border bg-card/50 p-4 text-sm md:grid-cols-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="text-muted-foreground">Secure checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <WandSparkles className="h-4 w-4 text-purple-600" />
          <span className="text-muted-foreground">Modern onboarding experience</span>
        </div>
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-teal-600" />
          <span className="text-muted-foreground">Fast activation after purchase</span>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card className="group rounded-2xl border transition hover:border-teal-400/70 hover:shadow-lg hover:shadow-teal-500/10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">SaaS Project Subscription</CardTitle>
                <Badge variant="secondary" className="rounded-full">Recommended</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">
                First select your SaaS project and choose its packages. After checkout, pick a hosting plan next.
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-teal-600" /> Project-first selection</li>
                <li className="flex items-center gap-2"><Rocket className="h-4 w-4 text-teal-600" /> Tailored SaaS plans</li>
              </ul>
              <Button className="w-full justify-between" onClick={() => navigate("/subscriptions/saas/projects")}>
                Go with SaaS <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card className="group rounded-2xl border transition hover:border-emerald-400/70 hover:shadow-lg hover:shadow-emerald-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Hosting Plan Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">
                Directly choose a hosting plan and continue to subscription checkout.
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Infrastructure-first flow</li>
                <li className="flex items-center gap-2"><Rocket className="h-4 w-4 text-emerald-600" /> Quick setup path</li>
              </ul>
              <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/subscriptions/hosting/plans")}>
                Go with Hosting <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

