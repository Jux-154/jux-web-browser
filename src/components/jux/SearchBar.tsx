import { useState, type FormEvent } from "react";
import { Search, ArrowRight } from "lucide-react";
import { SEARCH_ENGINES, useJux } from "@/lib/jux-store";

interface SearchBarProps {
  onSubmit: (value: string) => void;
  large?: boolean;
  autoFocus?: boolean;
  defaultValue?: string;
}

export function SearchBar({ onSubmit, large = false, autoFocus, defaultValue = "" }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const engine = useJux((s) => s.settings.searchEngine);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value);
  };

  return (
    <form onSubmit={submit} className="w-full">
      <div
        className={`group flex items-center gap-3 rounded-2xl border border-border bg-card px-5 shadow-sm transition-all focus-within:border-primary/60 focus-within:shadow-glow ${
          large ? "h-16" : "h-12"
        }`}
      >
        <Search className={`shrink-0 text-muted-foreground ${large ? "size-6" : "size-5"}`} />
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Rechercher sur ${SEARCH_ENGINES[engine].label} ou saisir une adresse`}
          className={`flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground ${
            large ? "text-lg" : "text-sm"
          }`}
          spellCheck={false}
          autoComplete="off"
        />
        <button
          type="submit"
          aria-label="Lancer la recherche"
          className={`grid shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 ${
            large ? "size-11" : "size-8"
          }`}
        >
          <ArrowRight className={large ? "size-5" : "size-4"} />
        </button>
      </div>
    </form>
  );
}
