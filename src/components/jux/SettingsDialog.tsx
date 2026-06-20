import { Settings as SettingsIcon, Trash2, Moon, Sun } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEARCH_ENGINES, useJux, type SearchEngineId } from "@/lib/jux-store";

export function SettingsDialog({ children }: { children?: React.ReactNode }) {
  const settings = useJux((s) => s.settings);
  const setSettings = useJux((s) => s.setSettings);
  const clearHistory = useJux((s) => s.clearHistory);
  const historyCount = useJux((s) => s.history.length);

  const setTheme = (theme: "dark" | "light") => {
    setSettings({ theme });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      try {
        localStorage.setItem("jux-theme", theme);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="ghost" size="icon" aria-label="Paramètres">
            <SettingsIcon className="size-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paramètres</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Moteur de recherche</Label>
            <Select
              value={settings.searchEngine}
              onValueChange={(v) => setSettings({ searchEngine: v as SearchEngineId })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SEARCH_ENGINES).map(([id, e]) => (
                  <SelectItem key={id} value={id}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Apparence</Label>
            <div className="flex gap-2">
              <Button
                variant={settings.theme === "dark" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setTheme("dark")}
              >
                <Moon className="size-4" /> Sombre
              </Button>
              <Button
                variant={settings.theme === "light" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setTheme("light")}
              >
                <Sun className="size-4" /> Clair
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="ext">Ouvrir les liens en externe</Label>
              <p className="text-xs text-muted-foreground">
                Ouvre dans un nouvel onglet du système plutôt que dans Jux-Web.
              </p>
            </div>
            <Switch
              id="ext"
              checked={settings.openLinksExternally}
              onCheckedChange={(c) => setSettings({ openLinksExternally: c })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Historique</Label>
              <p className="text-xs text-muted-foreground">{historyCount} entrée(s) enregistrée(s).</p>
            </div>
            <Button variant="outline" onClick={clearHistory} disabled={historyCount === 0}>
              <Trash2 className="size-4" /> Effacer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
