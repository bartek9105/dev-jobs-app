import { getRequestConfig } from "next-intl/server";
import { defaultLocale } from "./config";

// One fixed locale, so nothing here reads the request and pages stay statically rendered.
export default getRequestConfig(async () => {
  const locale = defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
