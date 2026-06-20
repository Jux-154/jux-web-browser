import { useState, useEffect, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  ExternalLink,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebFrame } from "./WebFrame";
import { useJux } from "@/lib/jux-store";
import { hostnameOf } from "@/lib/jux-utils";
import { toast } from "sonner";

interface BrowseViewProps {
  url: string;
  reloadKey: number;
  canBack: boolean;
  canForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
  onNavigate: (input: string) => void;
}

export function BrowseView({
  url,
  reloadKey,
  canBack,
  canForward,
  onBack,
  onForward,
  onRefresh,
  onHome,
  onNavigate,
}: BrowseViewProps) {
  const [address, setAddress] = useState(url);
  const addShortcut = useJux((s) => s.addShortcut);

  useEffect(() => setAddress(url), [url]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (address.trim()) onNavigate(address);
  };

  const bookmark = () => {
    addShortcut({
      label: hostnameOf(url),
      url,
      color: "oklch(0.72 0.15 230)",
    });
    toast.success("Raccourci ajouté");
  };

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={onBack} disabled={!canBack} aria-label="Précédent">
          <ArrowLeft className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onForward} disabled={!canForward} aria-label="Suivant">
          <ArrowRight className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Rafraîchir">
          <RotateCw className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onHome} aria-label="Accueil">
          <Home className="size-5" />
        </Button>

        <form onSubmit={submit} className="flex-1">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            spellCheck={false}
            className="h-10 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none transition-colors focus:border-primary/60"
          />
        </form>

        <Button variant="ghost" size="icon" onClick={bookmark} aria-label="Ajouter aux raccourcis">
          <Star className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          aria-label="Ouvrir dans un nouvel onglet"
        >
          <ExternalLink className="size-5" />
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <WebFrame url={url} reloadKey={reloadKey} />
      </div>
    </div>
  );
}
