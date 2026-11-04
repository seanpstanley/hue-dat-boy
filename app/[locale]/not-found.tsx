import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-start justify-center gap-4 p-4">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-lg">Could not find requested resource.</p>
      <Link
        href="/"
        className="text-lg underline underline-offset-4 focus-ring"
      >
        Return home
      </Link>
    </main>
  );
}
