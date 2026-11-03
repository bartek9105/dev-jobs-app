import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-4 px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        {siteConfig.name}
      </h1>
      <p className="text-lg text-foreground/70">{siteConfig.description}</p>
    </main>
  );
}
