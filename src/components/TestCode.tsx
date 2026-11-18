"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { createClient } from "@/lib/supabase";
import { FraicheurCode, type StatsTest } from "./FraicheurCode";
import { Check, Cross } from "./Pictos";

/**
 * « Ce code a marché ? » sous chaque code : c'est ce qui alimente le badge de
 * fraîcheur. Placé juste sous le code, au moment où le visiteur vient de
 * l'utiliser.
 *
 * L'anti-robot (Turnstile) n'est chargé qu'au clic, pour ne pas peser sur
 * chaque visite. Les garde-fous sont aussi en base (scripts/code-tests.sql) :
 * un test par membre et par code, jamais sur son propre code, compteurs
 * verrouillés.
 */
export default function TestCode({ announcementId, stats }: { announcementId: string; stats: StatsTest }) {
  const pathname = usePathname();
  const [etat, setEtat] = useState<StatsTest>(stats);
  const [pending, setPending] = useState<boolean | null>(null); // choix en attente du jeton
  const [choix, setChoix] = useState<boolean | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<{ texte: string; lien?: boolean } | null>(null);

  async function cliquer(worked: boolean) {
    setMessage(null);
    const { data: { user } } = await createClient().auth.getUser();
    if (!user) {
      setMessage({ texte: "Connecte-toi pour dire si ce code a marché.", lien: true });
      return;
    }
    setPending(worked); // affiche Turnstile ; l'envoi part dès que le jeton arrive
  }

  async function envoyer(worked: boolean, turnstileToken: string) {
    setEnvoi(true);
    try {
      const res = await fetch("/api/codes/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId, worked, turnstileToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ texte: data.error ?? "L'enregistrement a échoué." });
        return;
      }
      setChoix(worked);
      setEtat({ tests_ok: data.tests_ok, tests_ko: data.tests_ko, last_tested_at: data.last_tested_at });
      setMessage({ texte: "Merci, c'est noté." });
    } catch {
      setMessage({ texte: "Connexion impossible. Réessaie." });
    } finally {
      setEnvoi(false);
      setPending(null);
    }
  }

  return (
    <div className="tc">
      <FraicheurCode stats={etat} />
      <div className="tc-row">
        <span className="tc-q">Ce code a marché ?</span>
        <button type="button" className={`tc-btn${choix === true ? " is-yes" : ""}`} onClick={() => cliquer(true)} disabled={envoi || pending !== null} aria-pressed={choix === true}>
          <Check size={15} /> Oui
        </button>
        <button type="button" className={`tc-btn${choix === false ? " is-no" : ""}`} onClick={() => cliquer(false)} disabled={envoi || pending !== null} aria-pressed={choix === false}>
          <Cross size={15} /> Non
        </button>
      </div>

      {pending !== null && (
        <div className="tc-captcha">
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            options={{ appearance: "interaction-only", size: "flexible" }}
            onSuccess={(token) => envoyer(pending, token)}
            onError={() => { setPending(null); setMessage({ texte: "Vérification anti-robot impossible. Réessaie." }); }}
          />
        </div>
      )}

      {message && (
        <p className="tc-msg" role="status">
          {message.texte}{" "}
          {message.lien && <a href={`/login?next=${encodeURIComponent(pathname ?? "/")}`}>Se connecter</a>}
        </p>
      )}

      <style>{`
        .tc { display: flex; flex-direction: column; gap: .55rem; margin-top: 1rem; }
        .tc-row { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
        .tc-q { font-size: .92rem; color: var(--text-muted); margin-right: .2rem; }
        .tc-btn {
          display: inline-flex; align-items: center; gap: 6px; min-height: 38px; padding: 0 .85rem; border-radius: 9px;
          background: transparent; color: var(--text-strong); border: 0; box-shadow: inset 0 0 0 1.5px var(--border-lg);
          font: inherit; font-size: .9rem; font-weight: 700; cursor: pointer; transition: box-shadow .15s ease, background-color .15s ease;
        }
        .tc-btn:hover:not(:disabled) { box-shadow: inset 0 0 0 1.5px var(--text-dim); }
        .tc-btn:disabled { opacity: .55; cursor: default; }
        .tc-btn.is-yes { background: var(--ok); color: #0B2016; box-shadow: none; opacity: 1; }
        .tc-btn.is-no { background: var(--danger); color: #2A0A07; box-shadow: none; opacity: 1; }
        .tc-captcha { min-height: 0; }
        .tc-msg { margin: 0; font-size: .88rem; color: var(--text-muted); }
        .tc-msg a { color: var(--text-strong); font-weight: 700; text-decoration: underline; text-decoration-color: var(--accent); text-underline-offset: 3px; }
      `}</style>
    </div>
  );
}
