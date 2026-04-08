import type { Metadata } from "next";
import { createAnonSupabase } from "@/lib/supabase-server";
import PublicProfilClient from "./PublicProfilClient";

type Props = { params: Promise<{ pseudo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pseudo: rawPseudo } = await params;
  const pseudo = decodeURIComponent(rawPseudo);
  const supabase = createAnonSupabase();

  const { data: user } = await supabase
    .from("users")
    .select("pseudo, bio, xp, level")
    .eq("pseudo", pseudo)
    .single();

  if (!user) {
    return {
      title: "Profil introuvable — codedeparrainage.com",
    };
  }

  const title = `${user.pseudo} — Codes de parrainage | codedeparrainage.com`;
  const description = user.bio
    ? `${user.bio} — Découvrez les codes de parrainage de ${user.pseudo} sur codedeparrainage.com.`
    : `Découvrez les codes de parrainage de ${user.pseudo} (${user.level}) sur codedeparrainage.com.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.codedeparrainage.com/u/${encodeURIComponent(pseudo)}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.codedeparrainage.com/u/${encodeURIComponent(pseudo)}`,
      type: "profile",
    },
  };
}

export default function Page() {
  return <PublicProfilClient />;
}
