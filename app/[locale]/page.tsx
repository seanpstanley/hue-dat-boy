import { setRequestLocale } from "next-intl/server";

import { ContrastChecker } from "@/components/contrast-checker";
import { parseUrlState } from "@/lib/url-state";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Parsing the state on the server means the very first paint already uses the shared colors (no flash)
  const initial = parseUrlState(await searchParams);

  return <ContrastChecker initial={initial} />;
}
