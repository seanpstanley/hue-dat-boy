import { notFound } from "next/navigation";

/**
 * Catches every unknown path under a locale and renders the localized 404 page. Without this, unmatched paths fall
 * through to Next's default (English, unstyled) 404, since `[locale]/not-found.tsx` only renders for `notFound()`.
 */
export default function CatchAll() {
  notFound();
}
