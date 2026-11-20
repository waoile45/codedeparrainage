import { redirect } from "next/navigation";

// L'ancienne messagerie plein écran est remplacée par l'onglet Messages du
// profil. Cette adresse reste valable : les e-mails déjà envoyés et les
// anciens liens « Contacter » y pointent. On ne transmet que des identifiants
// au bon format.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function MessagesRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams({ tab: "messages" });
  const to = typeof sp.to === "string" ? sp.to : "";
  const annonce = typeof sp.annonce === "string" ? sp.annonce : "";
  if (UUID.test(to) && UUID.test(annonce)) {
    params.set("to", to);
    params.set("annonce", annonce);
  }
  redirect(`/profil?${params}`);
}
