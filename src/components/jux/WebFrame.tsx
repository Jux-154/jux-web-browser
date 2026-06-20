import { useEffect, useRef, useState } from "react";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hostnameOf } from "@/lib/jux-utils";

interface WebFrameProps {
  url: string;
  reloadKey: number;
}

export function WebFrame({ url, reloadKey }: WebFrameProps) {
  const [loading, setLoading] = useState(true);
  const [blockedHint, setBlockedHint] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    setBlockedHint(false);
    if (timer.current) clearTimeout(timer.current);
    // Si la frame ne charge pas (site qui interdit l'intégration), on propose une alternative.
    timer.current = setTimeout(() => setBlockedHint(true), 3500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [url, reloadKey]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-card">
      {loading && (
        <div className="absolute left-0 right-0 top-0 z-10 h-0.5 overflow-hidden bg-transparent">
          <div className="h-full w-1/3 animate-[indeterminate_1.1s_ease-in-out_infinite] bg-primary" />
        </div>
      )}

      <iframe
        key={`${url}-${reloadKey}`}
        src={url}
        title={hostnameOf(url)}
        className="h-full w-full border-0 bg-white"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
        referrerPolicy="no-referrer"
        onLoad={() => {
          setLoading(false);
          if (timer.current) clearTimeout(timer.current);
        }}
      />

      {blockedHint && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 w-[min(90%,30rem)] -translate-x-1/2">
          <div className="glass pointer-events-auto flex items-center gap-3 rounded-xl border border-border px-4 py-3 shadow-glow">
            <ShieldAlert className="size-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Le site ne s'affiche pas ?</p>
              <p className="text-xs text-muted-foreground">
                Certains sites (Google, banques…) bloquent l'affichage intégré pour la sécurité.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="size-4" />
              Ouvrir
            </Button>
          </div>
        </div>
      )}

      <style>{`@keyframes indeterminate{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
    </div>
  );
}
