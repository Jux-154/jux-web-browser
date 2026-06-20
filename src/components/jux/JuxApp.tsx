import { useState, useCallback } from "react";
import { PanelLeftClose, PanelLeft, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JuxSidebar } from "./JuxSidebar";
import { SearchBar } from "./SearchBar";
import { ShortcutsBar } from "./ShortcutsBar";
import { BrowseView } from "./BrowseView";
import { WorkspaceView } from "./WorkspaceView";
import { SettingsDialog } from "./SettingsDialog";
import { PasswordManager } from "./PasswordManager";
import { useJux, resolveQuery } from "@/lib/jux-store";
import { prettyUrl } from "@/lib/jux-utils";

type View = "home" | "browse" | "workspace";

export function JuxApp() {
  const engine = useJux((s) => s.settings.searchEngine);
  const openExternally = useJux((s) => s.settings.openLinksExternally);
  const addHistory = useJux((s) => s.addHistory);

  const [view, setView] = useState<View>("home");
  const [stack, setStack] = useState<string[]>([]);
  const [index, setIndex] = useState(-1);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pwOpen, setPwOpen] = useState(false);

  const currentUrl = index >= 0 ? stack[index] : "";

  const goToUrl = useCallback(
    (url: string, title: string) => {
      if (openExternally) {
        window.open(url, "_blank", "noopener,noreferrer");
        addHistory({ title, url });
        return;
      }
      setStack((prev) => {
        const next = prev.slice(0, index + 1);
        next.push(url);
        setIndex(next.length - 1);
        return next;
      });
      addHistory({ title, url });
      setView("browse");
    },
    [index, openExternally, addHistory],
  );

  const navigate = useCallback(
    (input: string) => {
      const { url } = resolveQuery(input, engine);
      if (!url) return;
      goToUrl(url, prettyUrl(url));
    },
    [engine, goToUrl],
  );

  const back = () => index > 0 && setIndex((i) => i - 1);
  const forward = () => index < stack.length - 1 && setIndex((i) => i + 1);
  const refresh = () => setReloadKey((k) => k + 1);

  const goHome = () => setView("home");

  const selectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    setView("workspace");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {sidebarOpen && (
        <JuxSidebar
          onHome={goHome}
          onSelectHistory={(url, title) => goToUrl(url, title)}
          activeWorkspaceId={view === "workspace" ? activeWorkspaceId : null}
          onSelectWorkspace={selectWorkspace}
          onOpenPasswords={() => setPwOpen(true)}
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top utility bar */}
        <header className="flex items-center gap-2 px-3 pt-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Masquer la barre latérale" : "Afficher la barre latérale"}
          >
            {sidebarOpen ? <PanelLeftClose className="size-5" /> : <PanelLeft className="size-5" />}
          </Button>

          <div className="flex-1" />

          <SettingsDialog>
            <Button variant="ghost" size="icon" aria-label="Paramètres">
              <SettingsIcon className="size-5" />
            </Button>
          </SettingsDialog>
        </header>

        {view === "home" && (
          <HomeView onSearch={navigate} onOpenShortcut={(url, title) => goToUrl(url, title)} />
        )}

        {view === "browse" && currentUrl && (
          <div className="min-h-0 flex-1">
            <BrowseView
              url={currentUrl}
              reloadKey={reloadKey}
              canBack={index > 0}
              canForward={index < stack.length - 1}
              onBack={back}
              onForward={forward}
              onRefresh={refresh}
              onHome={goHome}
              onNavigate={navigate}
            />
          </div>
        )}

        {view === "workspace" && activeWorkspaceId && (
          <div className="min-h-0 flex-1">
            <WorkspaceView workspaceId={activeWorkspaceId} />
          </div>
        )}
      </main>

      <PasswordManager open={pwOpen} onOpenChange={setPwOpen} />
    </div>
  );
}

function HomeView({
  onSearch,
  onOpenShortcut,
}: {
  onSearch: (v: string) => void;
  onOpenShortcut: (url: string, title: string) => void;
}) {
  return (
    <div className="bg-aurora flex min-h-0 flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl animate-fade-up">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" /> Votre navigateur, à votre façon
          </span>
          <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
            Jux<span className="text-primary">-</span>Web
          </h1>
          <p className="mt-3 text-muted-foreground">
            Cherchez, naviguez et organisez votre web.
          </p>
        </div>

        <SearchBar large autoFocus onSubmit={onSearch} />

        <div className="mt-8">
          <ShortcutsBar onOpen={onOpenShortcut} />
        </div>
      </div>
    </div>
  );
}
