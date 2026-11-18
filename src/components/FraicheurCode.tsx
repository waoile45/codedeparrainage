"use client";

import { useEffect, useState } from "react";

/**
 * Badge de fraîcheur d'un code : « Testé il y a 3 h, 9 réussites sur 10 ».
 *
 * C'est le seul contenu du site qu'un moteur génératif ne peut ni connaître ni
 * inventer : il périme. Un code, l'IA le restitue de mémoire ; son état actuel,
 * non. D'où un affichage factuel et daté.
 *
 * Le délai (« il y a 3 h ») est calculé dans le navigateur : les pages marque
 * sont mises en cache plusieurs heures, un délai calculé au rendu serveur
 * serait faux. Avant l'hydratation, on affiche la date absolue.
 */

export type StatsTest = {
  tests_ok?: number | null;
  tests_ko?: number | null;
  last_tested_at?: string | null;
};

/** « il y a 3 h », « il y a 2 jours »… null si aucune date exploitable. */
export function depuis(iso: string | null | undefined, now = Date.now()): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const minutes = Math.floor((now - t) / 60000);
  if (minutes < 0) return null;
  if (minutes < 2) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  if (jours < 31) return `il y a ${jours} jour${jours > 1 ? "s" : ""}`;
  return `il y a ${Math.floor(jours / 30)} mois`;
}

export function FraicheurCode({ stats, compact = false }: { stats: StatsTest; compact?: boolean }) {
  const ok = stats.tests_ok ?? 0;
  const ko = stats.tests_ko ?? 0;
  const total = ok + ko;
  const [quand, setQuand] = useState<string | null>(() =>
    stats.last_tested_at ? `le ${new Date(stats.last_tested_at).toLocaleDateString("fr-FR")}` : null
  );

  useEffect(() => {
    setQuand(depuis(stats.last_tested_at));
  }, [stats.last_tested_at]);

  if (total === 0 || !stats.last_tested_at) {
    return (
      <span className="fc">
        <span className="fc-dot" style={{ background: "var(--text-faint)" }} aria-hidden="true" />
        <span className="fc-dim">Pas encore testé</span>
        <style>{FC_CSS}</style>
      </span>
    );
  }

  const taux = ok / total;
  const couleur = taux >= 0.8 ? "var(--ok)" : taux >= 0.5 ? "var(--accent)" : "var(--danger)";

  return (
    <span className="fc">
      <span className="fc-dot" style={{ background: couleur }} aria-hidden="true" />
      <span className="fc-strong">Testé {quand ?? ""}</span>
      {!compact && (
        <span className="fc-dim tnum">
          {ok} réussite{ok > 1 ? "s" : ""} sur {total} essai{total > 1 ? "s" : ""}
        </span>
      )}
      <style>{FC_CSS}</style>
    </span>
  );
}

const FC_CSS = `
  .fc { display: inline-flex; align-items: center; flex-wrap: wrap; gap: .2rem .55rem; font-size: .9rem; line-height: 1.35; }
  .fc-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .fc-strong { font-weight: 700; color: var(--text-strong); }
  .fc-dim { color: var(--text-dim); }
`;
