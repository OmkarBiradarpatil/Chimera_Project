import { useRouterState } from "@tanstack/react-router";
import { Search, Bell, Upload, Command as CmdIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useCommandPalette } from "./command-palette";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LABELS: Record<string, string> = {
  "": "Dashboard",
  cases: "Cases",
  evidence: "Evidence",
  timeline: "Timeline",
  graph: "Knowledge Graph",
  chat: "AI Chat",
  contradictions: "Contradictions",
  analytics: "Analytics",
  reports: "Reports",
  settings: "Settings",
  help: "Help",
};

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setOpen } = useCommandPalette();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="glass sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 px-3 md:px-4">
      <SidebarTrigger className="h-8 w-8" />
      <Separator orientation="vertical" className="h-5" />

      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Chimera
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.length === 0 ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            segments.map((seg, i) => (
              <span key={seg + i} className="flex items-center gap-1.5">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {i === segments.length - 1 ? (
                    <BreadcrumbPage>{LABELS[seg] ?? seg}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={`/${segments.slice(0, i + 1).join("/")}`}>
                      {LABELS[seg] ?? seg}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="hidden md:flex h-8 items-center gap-2 rounded-md border border-border bg-surface/60 px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search everything…</span>
          <kbd className="ml-6 inline-flex items-center gap-0.5 rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px]">
            <CmdIcon className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button size="sm" variant="ghost" className="h-8 gap-1.5">
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Upload</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="relative h-8 w-8" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary/60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <span className="text-[10px] font-normal text-muted-foreground">3 new</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <div className="text-xs font-medium">Contradiction detected — Meridian</div>
              <div className="text-[11px] text-muted-foreground">Location conflict 12 Apr · confidence 0.87</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <div className="text-xs font-medium">Extraction complete</div>
              <div className="text-[11px] text-muted-foreground">Wire transfers — Merkava Q2.csv</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <div className="text-xs font-medium">Timeline updated</div>
              <div className="text-[11px] text-muted-foreground">Halcyon Ledger Discrepancy</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
