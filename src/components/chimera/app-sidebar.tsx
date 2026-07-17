import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Clock,
  Network,
  Sparkles,
  AlertTriangle,
  BarChart3,
  FileBarChart,
  Settings,
  HelpCircle,
  Pin,
  HardDrive,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cases } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";

const nav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Cases", url: "/cases", icon: FolderOpen },
  { title: "Evidence", url: "/evidence", icon: FileText },
  { title: "Timeline", url: "/timeline", icon: Clock },
  { title: "Knowledge Graph", url: "/graph", icon: Network },
  { title: "AI Chat", url: "/chat", icon: Sparkles },
  { title: "Contradictions", url: "/contradictions", icon: AlertTriangle },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileBarChart },
] as const;

const secondaryNav = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pinned = cases.filter((c) => c.pinned);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/40 shadow-[0_8px_24px_-8px] shadow-primary/40">
            <div className="absolute inset-0.5 rounded-[7px] bg-sidebar" />
            <span className="relative font-display text-sm font-semibold tracking-tight text-foreground">
              χ
            </span>
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] font-semibold tracking-tight">Chimera</span>
              <span className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Evidence intelligence
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.14em]">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const active =
                  item.url === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && pinned.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.14em]">
              Pinned cases
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pinned.map((c) => (
                  <SidebarMenuItem key={c.id}>
                    <SidebarMenuButton asChild>
                      <Link to="/cases">
                        <Pin className="h-3.5 w-3.5" />
                        <span className="truncate">{c.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="space-y-2.5 px-2 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <HardDrive className="h-3.5 w-3.5" />
                Storage
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">42.1 / 100 GB</span>
            </div>
            <Progress value={42} className="h-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2 py-1.5 text-left outline-none hover:bg-sidebar-accent transition-colors cursor-pointer">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-medium text-primary">
                    EM
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">Elena Márquez</div>
                    <div className="truncate text-[10px] text-muted-foreground">Lead investigator</div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" side="top">
                <DropdownMenuItem 
                  onClick={async () => {
                    try {
                      await supabase.auth.signOut();
                      toast.success("Signed out successfully");
                      window.location.href = "/";
                    } catch (e) {
                      toast.error("Failed to sign out");
                    }
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-medium text-primary outline-none hover:ring-2 hover:ring-primary transition-all cursor-pointer">
                  EM
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56" side="right">
                <DropdownMenuItem 
                  onClick={async () => {
                    try {
                      await supabase.auth.signOut();
                      toast.success("Signed out successfully");
                      window.location.href = "/";
                    } catch (e) {
                      toast.error("Failed to sign out");
                    }
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
