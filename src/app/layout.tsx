import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { pickClientMessages } from "@/i18n/client-messages";
import { clientEnv } from "@/lib/env/client";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Site");

  return {
    // Base for resolving relative URLs in metadata (Open Graph images, canonical links).
    metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: t("description"),
  };
}

export const viewport: Viewport = {
  // Light only: keeps native UI (scrollbars, autofill, pickers) light on dark-mode devices.
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={cn("h-full antialiased", inter.variable)}>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={pickClientMessages(messages)}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
