export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function faviconOf(url: string, size = 64): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=${size}`;
  } catch {
    return "";
  }
}

export function prettyUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("google.com") && u.searchParams.get("q")) {
      return `Recherche : ${u.searchParams.get("q")}`;
    }
    return u.hostname.replace(/^www\./, "") + (u.pathname !== "/" ? u.pathname : "");
  } catch {
    return url;
  }
}

export function initialsOf(label: string): string {
  return label.trim().slice(0, 2).toUpperCase() || "??";
}
