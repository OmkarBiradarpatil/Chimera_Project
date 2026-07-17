import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/chimera/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Chimera" },
      { name: "description", content: "Workspace, profile, and integration settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div>
      <PageHeader eyebrow="Preferences" title="Settings" description="Manage your workspace, profile, and integrations." />
      <div className="p-4 md:p-6">
        <Tabs defaultValue="profile" className="max-w-3xl">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="workspace">Workspace</TabsTrigger>
            <TabsTrigger value="ai">AI & models</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4 space-y-6 rounded-xl border border-border/60 bg-card p-5">
            <Field label="Display name" defaultValue="Elena Márquez" />
            <Field label="Email" defaultValue="elena@chimera.dev" />
            <Field label="Timezone" defaultValue="Europe/Madrid" />
            <Separator />
            <Row title="Weekly digest" description="Receive a weekly summary of case activity by email.">
              <Switch defaultChecked />
            </Row>
            <Row title="Contradiction alerts" description="Real-time notifications for new contradictions.">
              <Switch defaultChecked />
            </Row>
          </TabsContent>

          <TabsContent value="workspace" className="mt-4 space-y-6 rounded-xl border border-border/60 bg-card p-5">
            <Field label="Workspace name" defaultValue="Chimera — Investigations" />
            <Field label="Default case owner" defaultValue="Elena Márquez" />
            <Row title="Auto-generate timelines" description="Automatically add extracted events to case timelines.">
              <Switch defaultChecked />
            </Row>
            <Row title="Auto-run contradiction detection" description="Compare each new evidence item against the existing corpus.">
              <Switch defaultChecked />
            </Row>
          </TabsContent>

          <TabsContent value="ai" className="mt-4 space-y-6 rounded-xl border border-border/60 bg-card p-5">
            <Row title="Chat model" description="Model used for AI Chat answers.">
              <span className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px]">
                gemini-2.5-flash
              </span>
            </Row>
            <Row title="Embeddings" description="Used for evidence retrieval and search.">
              <span className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px]">
                text-embedding-3-small
              </span>
            </Row>
            <Row title="Vision extraction" description="Reads scans, images, and PDFs.">
              <span className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px]">
                gemini-2.5-flash · vision
              </span>
            </Row>
          </TabsContent>

          <TabsContent value="security" className="mt-4 space-y-6 rounded-xl border border-border/60 bg-card p-5">
            <Row title="Two-factor authentication" description="Required for all workspace members.">
              <Switch defaultChecked />
            </Row>
            <Row title="Audit log" description="Full activity record retained for 365 days.">
              <Switch defaultChecked />
            </Row>
            <Row title="Data residency" description="Evidence stored in EU-West region.">
              <span className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px]">EU-WEST</span>
            </Row>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button size="sm" className="h-8">Save changes</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 sm:items-center sm:gap-4">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input defaultValue={defaultValue} className="sm:col-span-2 h-9 text-sm" />
    </div>
  );
}
function Row({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-[13px] font-medium">{title}</div>
        <div className="text-[11px] text-muted-foreground">{description}</div>
      </div>
      {children}
    </div>
  );
}
