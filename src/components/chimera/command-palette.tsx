import { useEffect, createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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
  Upload,
  Plus,
  Search,
} from "lucide-react";
import { cases } from "@/lib/mock-data";

interface Ctx {
  open: boolean;
  setOpen: (v: boolean) => void;
}
const CommandPaletteCtx = createContext<Ctx>({ open: false, setOpen: () => {} });
export const useCommandPalette = () => useContext(CommandPaletteCtx);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  return (
    <CommandPaletteCtx.Provider value={{ open, setOpen }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search cases, evidence, entities, or type a command…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => go("/dashboard")}>
              <LayoutDashboard /> Dashboard
            </CommandItem>
            <CommandItem onSelect={() => go("/cases")}>
              <FolderOpen /> Cases
            </CommandItem>
            <CommandItem onSelect={() => go("/evidence")}>
              <FileText /> Evidence library
            </CommandItem>
            <CommandItem onSelect={() => go("/timeline")}>
              <Clock /> Timeline
            </CommandItem>
            <CommandItem onSelect={() => go("/graph")}>
              <Network /> Knowledge graph
            </CommandItem>
            <CommandItem onSelect={() => go("/chat")}>
              <Sparkles /> AI chat
            </CommandItem>
            <CommandItem onSelect={() => go("/contradictions")}>
              <AlertTriangle /> Contradictions
            </CommandItem>
            <CommandItem onSelect={() => go("/analytics")}>
              <BarChart3 /> Analytics
            </CommandItem>
            <CommandItem onSelect={() => go("/reports")}>
              <FileBarChart /> Reports
            </CommandItem>
            <CommandItem onSelect={() => go("/settings")}>
              <Settings /> Settings
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick actions">
            <CommandItem onSelect={() => go("/evidence")}>
              <Upload /> Upload evidence
            </CommandItem>
            <CommandItem onSelect={() => go("/cases")}>
              <Plus /> Create new case
            </CommandItem>
            <CommandItem onSelect={() => go("/chat")}>
              <Search /> Ask the AI
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recent cases">
            {cases.slice(0, 5).map((c) => (
              <CommandItem key={c.id} onSelect={() => go("/cases")}>
                <FolderOpen />
                <span className="truncate">{c.title}</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {c.code}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CommandPaletteCtx.Provider>
  );
}
