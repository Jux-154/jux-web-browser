import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJux } from "@/lib/jux-store";
import { faviconOf, hostnameOf, initialsOf } from "@/lib/jux-utils";

interface ShortcutsBarProps {
  onOpen: (url: string, title: string) => void;
}

export function ShortcutsBar({ onOpen }: ShortcutsBarProps) {
  const shortcuts = useJux((s) => s.shortcuts);
  const removeShortcut = useJux((s) => s.removeShortcut);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {shortcuts.map((sc) => (
        <div key={sc.id} className="group relative">
          <button
            onClick={() => onOpen(sc.url, sc.label)}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow"
          >
            <span
              className="grid size-6 place-items-center overflow-hidden rounded-md text-[10px] font-bold text-primary-foreground"
              style={{ backgroundColor: sc.color }}
            >
              <img
                src={faviconOf(sc.url, 32)}
                alt=""
                className="size-4"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  e.currentTarget.parentElement!.textContent = initialsOf(sc.label);
                }}
              />
            </span>
            {sc.label}
          </button>
          <button
            onClick={() => removeShortcut(sc.id)}
            aria-label="Supprimer le raccourci"
            className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
      <AddShortcutDialog />
    </div>
  );
}

function AddShortcutDialog() {
  const addShortcut = useJux((s) => s.addShortcut);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const ACCENTS = [
    "oklch(0.72 0.15 230)",
    "oklch(0.7 0.16 300)",
    "oklch(0.75 0.14 190)",
    "oklch(0.8 0.15 90)",
    "oklch(0.72 0.18 30)",
  ];

  const save = () => {
    if (!url.trim()) return;
    const fullUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    addShortcut({
      label: label.trim() || hostnameOf(fullUrl),
      url: fullUrl,
      color: ACCENTS[Math.floor(Math.random() * ACCENTS.length)],
    });
    setLabel("");
    setUrl("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-transparent px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground">
          <Plus className="size-4" />
          Raccourci
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau raccourci</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="sc-label">Nom</Label>
            <Input
              id="sc-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex : YouTube"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sc-url">Adresse</Label>
            <Input
              id="sc-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="youtube.com"
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={save}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
