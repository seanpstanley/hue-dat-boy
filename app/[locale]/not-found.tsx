import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";

/** The 404 page for unknown paths under a locale. */
export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-start justify-center gap-4 p-4">
      <h1 className="font-display-tight text-7xl font-extrabold">
        {t("title")}
      </h1>
      <p className="text-lg">{t("description")}</p>
      <Link
        href="/"
        className="text-lg underline underline-offset-4 focus-ring"
      >
        {t("home")}
      </Link>
    </main>
  );
}
