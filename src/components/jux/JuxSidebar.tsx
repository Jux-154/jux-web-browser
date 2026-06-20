import { useState } from "react";
import {
  History,
  Layers,
  Plus,
  KeyRound,
  Home,
  Trash2,
  X,
  Globe,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useJux } from "@/lib/jux-store";
import { faviconOf, prettyUrl, hostnameOf, initialsOf } from "@/lib/jux-utils";

interface JuxSidebarProps {
  onHome: () => void;
  onSelectHistory: (url: string, title: string) => void;
  activeWorkspaceId: string | null;
  onSelectWorkspace: (id: string) => void;
  onOpenPasswords: () => void;
}

export function JuxSidebar({
  onHome,
  onSelectHistory,
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenPasswords,
}: JuxSidebarProps) {
  const history = useJux((s) => s.history);
  const removeHistory = useJux((s) => s.removeHistory);
  const clearHistory = useJux((s) => s.clearHistory);
  const workspaces = useJux((s) => s.workspaces);
  const addWorkspace = useJux((s) => s.addWorkspace);
  const removeWorkspace = useJux((s) => s.removeWorkspace);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const createWs = () => {
    const n = name.trim() || "Nouvel espace";
    const id = addWorkspace(n);
    setName("");
    setCreating(false);
    onSelectWorkspace(id);
  };

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <button
        onClick={onHome}
        className="flex items-center gap-2.5 px-5 py-4 text-left"
        aria-label="Accueil Jux-Web"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
          <Globe className="size-5" />
        </span>
        <span className="font-display text-xl font-bold tracking-tight">Jux-Web</span>
      </button>

      <ScrollArea className="flex-1">
        <div className="space-y-6 px-3 pb-4">
          {/* Espaces de travail */}
          <section>
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Layers className="size-3.5" /> Espaces de travail
              </span>
              <button
                onClick={() => setCreating((v) => !v)}
                className="grid size-5 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                aria-label="Nouvel espace"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {creating && (
              <div className="mb-2 flex gap-1.5 px-1">
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createWs();
                    if (e.key === "Escape") setCreating(false);
                  }}
                  placeholder="Nom de l'espace"
                  className="h-8 text-sm"
                />
                <Button size="sm" className="h-8" onClick={createWs}>
                  OK
                </Button>
              </div>
            )}

            <div className="space-y-0.5">
              {workspaces.length === 0 && !creating && (
                <p className="px-2 py-1 text-xs text-muted-foreground">
                  Créez un espace pour regrouper vos onglets.
                </p>
              )}
              {workspaces.map((w) => (
                <div key={w.id} className="group flex items-center">
                  <button
                    onClick={() => onSelectWorkspace(w.id)}
                    className={`flex flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors ${
                      activeWorkspaceId === w.id
                        ? "bg-sidebar-accent font-semibold"
                        : "hover:bg-sidebar-accent/60"
                    }`}
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: w.color }}
                    />
                    <span className="flex-1 truncate text-left">{w.name}</span>
                    <span className="rounded-full bg-secondary px-1.5 text-[10px] font-medium text-muted-foreground">
                      {w.tabs.length}
                    </span>
                  </button>
                  <button
                    onClick={() => removeWorkspace(w.id)}
                    className="ml-0.5 grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    aria-label="Supprimer l'espace"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Historique */}
          <section>
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <History className="size-3.5" /> Historique
              </span>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-[11px] text-muted-foreground hover:text-destructive"
                >
                  Effacer
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {history.length === 0 && (
                <p className="px-2 py-1 text-xs text-muted-foreground">
                  Vos recherches apparaîtront ici.
                </p>
              )}
              {history.slice(0, 60).map((h) => (
                <div key={h.id} className="group flex items-center">
                  <button
                    onClick={() => onSelectHistory(h.url, h.title)}
                    className="flex flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent/60"
                  >
                    <span className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-md bg-secondary text-[9px] font-bold">
                      <img
                        src={faviconOf(h.url, 32)}
                        alt=""
                        className="size-4"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          e.currentTarget.parentElement!.textContent = initialsOf(hostnameOf(h.url));
                        }}
                      />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs">{h.title || prettyUrl(h.url)}</span>
                  </button>
                  <button
                    onClick={() => removeHistory(h.id)}
                    className="ml-0.5 grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    aria-label="Retirer de l'historique"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>

      <div className="space-y-1 border-t border-sidebar-border p-3">
        <button
          onClick={onOpenPasswords}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent/60"
        >
          <KeyRound className="size-4 text-primary" />
          Mots de passe
          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
        </button>
        <button
          onClick={onHome}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent/60"
        >
          <Home className="size-4" />
          Accueil
        </button>
      </div>
    </aside>
  );
}
