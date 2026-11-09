import type messages from "../messages/en.json";
import type { locales } from "./i18n/config";

// Makes translation keys type-safe: t("missing.key") is a compile error.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: typeof messages;
  }
}
