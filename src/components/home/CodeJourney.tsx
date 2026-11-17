"use client";

import { useEffect, useRef, useState } from "react";

// La scène signature de l'accueil : le trajet d'un code, de la recherche Google
// à la prime. Elle joue seule, déclenchée par le temps (pas par le défilement),
// s'arrête hors écran et quand l'onglet est caché, et se met en pause au clic
// (WCAG 2.2.2). Seuls transform et opacity sont animés ; le texte qui se tape
// est un simple changement de contenu.

export type JourneyData = {
  brand: string;
  slug: string;
  domain: string;
  bonus: string;
  code: string;
};

const STEPS = ["Recherche", "Copie", "Inscription", "Prime"] as const;

export default function CodeJourney({ data }: { data: JourneyData }) {
  const query = `code parrainage ${data.brand.toLowerCase()}`;
  const [step, setStep] = useState(0);
  const [typedQuery, setTypedQuery] = useState(query);
  const [typedCode, setTypedCode] = useState(data.code);
  const [showResult, setShowResult] = useState(true);
  const [copied, setCopied] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number; press: boolean; on: boolean }>({ x: 0, y: 0, press: false, on: false });
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLSpanElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);
  const fieldRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const running = !paused && visible && pageVisible && !reduced;

  useEffect(() => {
    if (!running) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    let t = 0;
    // Position d'un élément (son centre, un peu à gauche) dans le cadre.
    const aim = (el: HTMLElement | null) => {
      const f = frameRef.current;
      if (!el || !f) return { x: 0, y: 0 };
      const a = el.getBoundingClientRect(), b = f.getBoundingClientRect();
      return { x: a.left - b.left + Math.min(a.width * 0.4, 90), y: a.top - b.top + a.height * 0.45 };
    };
    const corner = () => {
      const f = frameRef.current;
      return f ? { x: f.clientWidth * 0.72, y: f.clientHeight * 0.82 } : { x: 0, y: 0 };
    };

    const cycle = () => {
      t = 0;
      timers.length = 0; // les minuteurs du tour précédent ont tous expiré
      // 1. La recherche se tape, le résultat apparaît, on clique dessus.
      at(t, () => { setStep(0); setShowResult(false); setCopied(false); setTypedQuery(""); setTypedCode(""); setCursor({ ...corner(), press: false, on: false }); });
      for (let i = 1; i <= query.length; i++) at((t += 55), () => setTypedQuery(query.slice(0, i)));
      at((t += 350), () => setShowResult(true));
      at((t += 500), () => setCursor({ ...aim(resultRef.current), press: false, on: true }));
      at((t += 750), () => setCursor((c) => ({ ...c, press: true })));
      at((t += 180), () => setCursor((c) => ({ ...c, press: false })));
      // 2. La fiche du code : on copie.
      at((t += 250), () => { setStep(1); setCursor({ ...corner(), press: false, on: true }); });
      at((t += 900), () => setCursor({ ...aim(copyRef.current), press: false, on: true }));
      at((t += 750), () => setCursor((c) => ({ ...c, press: true })));
      at((t += 180), () => { setCursor((c) => ({ ...c, press: false })); setCopied(true); });
      // 3. Le formulaire d'inscription : le code se colle dans le champ parrain.
      at((t += 1100), () => { setStep(2); setCursor({ ...aim(fieldRef.current), press: false, on: true }); });
      at((t += 600), () => setCursor((c) => ({ ...c, press: true })));
      at((t += 180), () => setCursor((c) => ({ ...c, press: false, on: false })));
      for (let i = 1; i <= data.code.length; i++) at((t += 70), () => setTypedCode(data.code.slice(0, i)));
      // 4. La prime.
      at((t += 900), () => setStep(3));
      at((t += 3200), cycle);
    };
    // Départ différé : on laisse la page finir de charger et le titre se lire.
    at(1500, cycle);
    return () => timers.forEach(clearTimeout);
  }, [running, query, data.code]);

  // Sans animation : on montre la fiche du code, l'étape la plus parlante.
  const shown = reduced ? 1 : step;

  return (
    <div className="cj" ref={rootRef}>
      <p className="cj-sr">
        Démonstration : on cherche « {query} », on copie le code sur la fiche {data.brand}, on le colle dans le champ
        code parrain du formulaire d&apos;inscription, et la prime de bienvenue est débloquée : {data.bonus}.
      </p>

      <div className="cj-frame" aria-hidden="true" ref={frameRef}>
        {/* 1. Recherche */}
        <div className={`cj-panel ${shown === 0 ? "on" : ""}`}>
          <div className="cj-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <span>{typedQuery}<span className="cj-caret" /></span>
          </div>
          <div className={`cj-result ${showResult ? "on" : ""}`}>
            <span className="cj-url">codedeparrainage.com › {data.slug}</span>
            <span className="cj-title" ref={resultRef}>Code parrainage {data.brand} 2026</span>
            <span className="cj-snippet">{data.bonus}. Codes publiés par des clients, avec la date de publication.</span>
          </div>
          <div className={`cj-result ghost ${showResult ? "on" : ""}`}>
            <span className="cj-line" /><span className="cj-line short" />
          </div>
        </div>

        {/* 2. La fiche du code */}
        <div className={`cj-panel ${shown === 1 ? "on" : ""}`}>
          <div className="cj-brand">
            <img src={`https://www.google.com/s2/favicons?domain=${data.domain}&sz=64`} alt="" width={28} height={28} />
            <span>{data.brand}</span>
          </div>
          <p className="cj-bonus">{data.bonus}</p>
          <div className="cj-ticket">
            <span className="cj-code code-str">{data.code}</span>
            <span className={`cj-copy ${copied ? "done" : ""}`} ref={copyRef}>
              <span className="a">Copier</span>
              <span className="b">Copié</span>
            </span>
          </div>
          <p className="cj-meta">Publié par un client de {data.brand}</p>
        </div>

        {/* 3. Inscription */}
        <div className={`cj-panel ${shown === 2 ? "on" : ""}`}>
          <p className="cj-form-title">Ouvrir un compte {data.brand}</p>
          <span className="cj-label">Adresse email</span>
          <span className="cj-input muted">toi@exemple.fr</span>
          <span className="cj-label">Code parrain</span>
          <span className="cj-input code-str focus" ref={fieldRef}>{typedCode}<span className="cj-caret" /></span>
          <span className="cj-submit">Valider l&apos;inscription</span>
        </div>

        {/* 4. Prime */}
        <div className={`cj-panel cj-prime ${shown === 3 ? "on" : ""}`}>
          <span className="cj-stamp">Prime débloquée</span>
          <p className="cj-prime-amount">{data.bonus}</p>
          <p className="cj-meta">Versée par {data.brand} une fois ses conditions remplies. Ton parrain est récompensé de son côté.</p>
        </div>

        <svg
          className={`cj-cursor ${cursor.on ? "on" : ""} ${cursor.press ? "press" : ""}`}
          style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }}
          width="22" height="22" viewBox="0 0 24 24"
        >
          <path d="M4 2l15 9.5-6.6 1.4L16 20l-2.8 1.4-3.6-7.2L4 19z" fill="#FAF8F3" stroke="#141414" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="cj-bar">
        <ol className="cj-steps" aria-hidden="true">
          {STEPS.map((s, i) => (
            <li key={s} className={i === shown ? "on" : ""}>{s}</li>
          ))}
        </ol>
        {!reduced && (
          <button type="button" className="cj-pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
            {paused ? (
              <><svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 1l9 5-9 5z" fill="currentColor" /></svg>Lecture</>
            ) : (
              <><svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" /></svg>Pause</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
