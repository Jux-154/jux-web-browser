import { useState } from "react";
import { KeyRound, Plus, Eye, EyeOff, Copy, Trash2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useJux } from "@/lib/jux-store";
import { faviconOf, hostnameOf, initialsOf } from "@/lib/jux-utils";
import { toast } from "sonner";

export function PasswordManager({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const passwords = useJux((s) => s.passwords);
  const addPassword = useJux((s) => s.addPassword);
  const removePassword = useJux((s) => s.removePassword);

  const [adding, setAdding] = useState(false);
  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const generate = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let out = "";
    const arr = new Uint32Array(16);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 16; i++) out += chars[arr[i] % chars.length];
    setPassword(out);
  };

  const save = () => {
    if (!site.trim() || !password) return;
    const full = /^https?:\/\//i.test(site) ? site : `https://${site}`;
    addPassword({ site: full, username: username.trim(), password });
    setSite("");
    setUsername("");
    setPassword("");
    setAdding(false);
    toast.success("Mot de passe enregistré");
  };

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" /> Gestionnaire de mots de passe
          </DialogTitle>
        </DialogHeader>

        <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          Vos mots de passe sont stockés uniquement sur cet appareil (aucun serveur). Pensez à les
          sauvegarder ailleurs.
        </p>

        {adding ? (
          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="space-y-1.5">
              <Label htmlFor="pw-site">Site</Label>
              <Input id="pw-site" value={site} onChange={(e) => setSite(e.target.value)} placeholder="exemple.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw-user">Identifiant / e-mail</Label>
              <Input id="pw-user" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="vous@mail.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw-pass">Mot de passe</Label>
              <div className="flex gap-2">
                <Input id="pw-pass" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                <Button type="button" variant="outline" onClick={generate}>
                  Générer
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => setAdding(false)}>
                Annuler
              </Button>
              <Button onClick={save}>Enregistrer</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setAdding(true)} className="w-full">
            <Plus className="size-4" /> Ajouter un mot de passe
          </Button>
        )}

        <ScrollArea className="max-h-72">
          <div className="space-y-2 pr-2">
            {passwords.length === 0 && !adding && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucun mot de passe enregistré pour l'instant.
              </p>
            )}
            {passwords.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-secondary text-xs font-bold">
                  <img
                    src={faviconOf(p.site, 32)}
                    alt=""
                    className="size-5"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      e.currentTarget.parentElement!.textContent = initialsOf(hostnameOf(p.site));
                    }}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{hostnameOf(p.site)}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.username || "—"}</p>
                  <p className="mt-0.5 font-mono text-xs">
                    {reveal[p.id] ? p.password : "•".repeat(Math.min(p.password.length, 12))}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => setReveal((r) => ({ ...r, [p.id]: !r[p.id] }))}
                    aria-label="Afficher / masquer"
                  >
                    {reveal[p.id] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => copy(p.id, p.password)}
                    aria-label="Copier"
                  >
                    {copied === p.id ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => removePassword(p.id)}
                    aria-label="Supprimer"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
