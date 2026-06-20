import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SearchEngineId = "google" | "bing" | "duckduckgo";

export interface HistoryEntry {
  id: string;
  title: string;
  url: string;
  query?: string;
  timestamp: number;
}

export interface Shortcut {
  id: string;
  label: string;
  url: string;
  color: string;
}

export interface WorkspaceTab {
  id: string;
  url: string;
  title: string;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  tabs: WorkspaceTab[];
  activeTabId: string | null;
}

export interface PasswordEntry {
  id: string;
  site: string;
  username: string;
  password: string;
  updatedAt: number;
}

export interface Settings {
  searchEngine: SearchEngineId;
  theme: "dark" | "light";
  openLinksExternally: boolean;
}

interface JuxState {
  history: HistoryEntry[];
  shortcuts: Shortcut[];
  workspaces: Workspace[];
  passwords: PasswordEntry[];
  settings: Settings;

  addHistory: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;

  addShortcut: (s: Omit<Shortcut, "id">) => void;
  removeShortcut: (id: string) => void;

  addWorkspace: (name: string) => string;
  removeWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  addTab: (workspaceId: string, url: string, title: string) => void;
  removeTab: (workspaceId: string, tabId: string) => void;
  setActiveTab: (workspaceId: string, tabId: string) => void;
  updateTab: (workspaceId: string, tabId: string, patch: Partial<WorkspaceTab>) => void;

  addPassword: (p: Omit<PasswordEntry, "id" | "updatedAt">) => void;
  updatePassword: (id: string, patch: Partial<Omit<PasswordEntry, "id">>) => void;
  removePassword: (id: string) => void;

  setSettings: (patch: Partial<Settings>) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const ACCENTS = [
  "oklch(0.72 0.15 230)",
  "oklch(0.7 0.16 300)",
  "oklch(0.75 0.14 190)",
  "oklch(0.8 0.15 90)",
  "oklch(0.72 0.18 30)",
  "oklch(0.68 0.18 150)",
];
const randomAccent = () => ACCENTS[Math.floor(Math.random() * ACCENTS.length)];

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useJux = create<JuxState>()(
  persist(
    (set) => ({
      history: [],
      shortcuts: [
        { id: uid(), label: "YouTube", url: "https://www.youtube.com", color: ACCENTS[4] },
        { id: uid(), label: "GitHub", url: "https://github.com", color: ACCENTS[1] },
        { id: uid(), label: "Wikipedia", url: "https://www.wikipedia.org", color: ACCENTS[2] },
      ],
      workspaces: [],
      passwords: [],
      settings: { searchEngine: "google", theme: "dark", openLinksExternally: false },

      addHistory: (entry) =>
        set((s) => ({
          history: [{ ...entry, id: uid(), timestamp: Date.now() }, ...s.history].slice(0, 200),
        })),
      removeHistory: (id) => set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
      clearHistory: () => set({ history: [] }),

      addShortcut: (sc) =>
        set((s) => ({ shortcuts: [...s.shortcuts, { ...sc, id: uid() }] })),
      removeShortcut: (id) =>
        set((s) => ({ shortcuts: s.shortcuts.filter((x) => x.id !== id) })),

      addWorkspace: (name) => {
        const id = uid();
        set((s) => ({
          workspaces: [
            ...s.workspaces,
            { id, name, color: randomAccent(), tabs: [], activeTabId: null },
          ],
        }));
        return id;
      },
      removeWorkspace: (id) =>
        set((s) => ({ workspaces: s.workspaces.filter((w) => w.id !== id) })),
      renameWorkspace: (id, name) =>
        set((s) => ({
          workspaces: s.workspaces.map((w) => (w.id === id ? { ...w, name } : w)),
        })),
      addTab: (workspaceId, url, title) =>
        set((s) => ({
          workspaces: s.workspaces.map((w) => {
            if (w.id !== workspaceId) return w;
            const tab = { id: uid(), url, title };
            return { ...w, tabs: [...w.tabs, tab], activeTabId: tab.id };
          }),
        })),
      removeTab: (workspaceId, tabId) =>
        set((s) => ({
          workspaces: s.workspaces.map((w) => {
            if (w.id !== workspaceId) return w;
            const tabs = w.tabs.filter((t) => t.id !== tabId);
            const activeTabId =
              w.activeTabId === tabId ? (tabs[tabs.length - 1]?.id ?? null) : w.activeTabId;
            return { ...w, tabs, activeTabId };
          }),
        })),
      setActiveTab: (workspaceId, tabId) =>
        set((s) => ({
          workspaces: s.workspaces.map((w) =>
            w.id === workspaceId ? { ...w, activeTabId: tabId } : w,
          ),
        })),
      updateTab: (workspaceId, tabId, patch) =>
        set((s) => ({
          workspaces: s.workspaces.map((w) =>
            w.id === workspaceId
              ? { ...w, tabs: w.tabs.map((t) => (t.id === tabId ? { ...t, ...patch } : t)) }
              : w,
          ),
        })),

      addPassword: (p) =>
        set((s) => ({
          passwords: [{ ...p, id: uid(), updatedAt: Date.now() }, ...s.passwords],
        })),
      updatePassword: (id, patch) =>
        set((s) => ({
          passwords: s.passwords.map((x) =>
            x.id === id ? { ...x, ...patch, updatedAt: Date.now() } : x,
          ),
        })),
      removePassword: (id) =>
        set((s) => ({ passwords: s.passwords.filter((x) => x.id !== id) })),

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: "jux-web-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (noopStorage as Storage),
      ),
    },
  ),
);

export const SEARCH_ENGINES: Record<
  SearchEngineId,
  { label: string; search: (q: string) => string; home: string }
> = {
  google: {
    label: "Google",
    search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    home: "https://www.google.com",
  },
  bing: {
    label: "Bing",
    search: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    home: "https://www.bing.com",
  },
  duckduckgo: {
    label: "DuckDuckGo",
    search: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
    home: "https://duckduckgo.com",
  },
};

/** Decide whether the input is a URL or a search query, returns a navigable URL. */
export function resolveQuery(input: string, engine: SearchEngineId): { url: string; isSearch: boolean } {
  const trimmed = input.trim();
  if (!trimmed) return { url: "", isSearch: false };
  const looksLikeUrl =
    /^https?:\/\//i.test(trimmed) ||
    /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(trimmed);
  if (looksLikeUrl) {
    const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return { url, isSearch: false };
  }
  return { url: SEARCH_ENGINES[engine].search(trimmed), isSearch: true };
}
