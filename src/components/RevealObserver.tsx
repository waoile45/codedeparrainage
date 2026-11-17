"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Apparitions au défilement : ajoute .in aux éléments .reveal quand ils entrent
// à l'écran. Sans JavaScript (ou avant hydratation), html n'a pas la classe
// .js et tout est visible : aucun contenu n'est caché aux robots.
// Les pages qui chargent leurs données après coup (classement, annuaire)
// ajoutent des .reveal plus tard : un MutationObserver les rattrape.
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = reduce
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                e.target.classList.add("in");
                io?.unobserve(e.target);
              }
            }
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
        );

    const watch = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((el) => {
        if (io) io.observe(el);
        else el.classList.add("in");
      });
    };
    watch(document);

    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; watch(document); });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io?.disconnect(); mo.disconnect(); };
  }, [pathname]);

  return null;
}
