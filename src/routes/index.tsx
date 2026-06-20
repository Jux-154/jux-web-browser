import { createFileRoute } from "@tanstack/react-router";
import { JuxApp } from "@/components/jux/JuxApp";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jux-Web — Votre navigateur personnel" },
      {
        name: "description",
        content:
          "Jux-Web : recherche Google, historique, raccourcis, espaces de travail multi-onglets et gestionnaire de mots de passe, sans serveur.",
      },
      { property: "og:title", content: "Jux-Web — Votre navigateur personnel" },
      {
        property: "og:description",
        content: "Recherche, raccourcis, espaces de travail et mots de passe, le tout au même endroit.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <JuxApp />
      <Toaster position="bottom-right" />
    </>
  );
}
