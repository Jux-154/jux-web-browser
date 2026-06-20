import { useState, useEffect, type FormEvent } from "react";
import { Plus, X, RotateCw, ExternalLink, Search, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebFrame } from "./WebFrame";
import { SearchBar } from "./SearchBar";
import { useJux, resolveQuery } from "@/lib/jux-store";
import { faviconOf, hostnameOf, initialsOf, prettyUrl } from "@/lib/jux-utils";

export function WorkspaceView({ workspaceId }: { workspaceId: string }) {
  const workspace = useJux((s) => s.workspaces.find((w) => w.id === workspaceId));
  const addTab = useJux((s) => s.addTab);
  const removeTab = useJux((s) => s.removeTab);
  const setActiveTab = useJux((s) => s.setActiveTab);
  const updateTab = useJux((s) => s.updateTab);
  const addHistory = useJux((s) => s.addHistory);
  const engine = useJux((s) => s.settings.searchEngine);

  const [reloadKey, setReloadKey] = useState(0);
  const [address, setAddress] = useState("");

  const active = workspace?.tabs.find((t) => t.id === workspace?.activeTabId) ?? null;

  useEffect(() => setAddress(active?.url ?? ""), [active?.id, active?.url]);

  if (!workspace) {
    return (
      <div className="grid h-full place-items-center text-muted-foreground">Espace introuvable</div>
    );
  }

  const openInActive = (input: string) => {
    const { url } = resolveQuery(input, engine);
    if (!url || !active) return;
    const title = prettyUrl(url);
    updateTab(workspace.id, active.id, { url, title });
    addHistory({ title, url });
    setReloadKey((k) => k + 1);
  };

  const submitAddress = (e: FormEvent) => {
    e.preventDefault();
    if (address.trim()) openInActive(address);
  };

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      {/* Tab strip */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: workspace.color }} />
          <span className="max-w-32 truncate">{workspace.name}</span>
        </div>
        <div className="mx-1 h-5 w-px bg-border" />
        <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
          {workspace.tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(workspace.id, t.id)}
              className={`group flex h-9 max-w-52 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${
                workspace.activeTabId === t.id
                  ? "border-primary/50 bg-card font-medium shadow-sm"
                  : "border-transparent bg-secondary/60 hover:bg-secondary"
              }`}
            >
              {t.url ? (
                <img
                  src={faviconOf(t.url, 32)}
                  alt=""
                  className="size-4 shrink-0"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
                />
              ) : (
                <Search className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0 flex-1 truncate">
                {t.url ? hostnameOf(t.url) : "Nouvel onglet"}
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(workspace.id, t.id);
                }}
                className="grid size-4 shrink-0 place-items-center rounded text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="size-3" />
              </span>
            </button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={() => addTab(workspace.id, "", "Nouvel onglet")}
            aria-label="Nouvel onglet"
          >
            <Plus className="size-5" />
          </Button>
        </div>
      </div>

      {/* Address bar for active tab */}
      {active && active.url && (
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={() => setReloadKey((k) => k + 1)} aria-label="Rafraîchir">
            <RotateCw className="size-5" />
          </Button>
          <form onSubmit={submitAddress} className="flex-1">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              spellCheck={false}
              className="h-10 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none transition-colors focus:border-primary/60"
            />
          </form>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(active.url, "_blank", "noopener,noreferrer")}
            aria-label="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="size-5" />
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="min-h-0 flex-1">
        {!active ? (
          <div className="grid h-full place-items-center rounded-xl border border-dashed border-border">
            <div className="text-center">
              <Layers className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-3 font-medium">Aucun onglet ouvert</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ouvrez un onglet pour démarrer dans cet espace.
              </p>
              <Button className="mt-4" onClick={() => addTab(workspace.id, "", "Nouvel onglet")}>
                <Plus className="size-4" /> Nouvel onglet
              </Button>
            </div>
          </div>
        ) : !active.url ? (
          <div className="grid h-full place-items-center rounded-xl border border-border bg-aurora">
            <div className="w-full max-w-xl px-6 text-center">
              <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                <Search className="size-7" />
              </span>
              <h2 className="font-display mb-5 text-2xl font-bold">Nouvel onglet</h2>
              <SearchBar large autoFocus onSubmit={openInActive} />
            </div>
          </div>
        ) : (
          <WebFrame url={active.url} reloadKey={reloadKey} />
        )}
      </div>
    </div>
  );
}
