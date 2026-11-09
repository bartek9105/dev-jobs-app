import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import messages from "../../messages/en.json";
import { defaultLocale } from "@/i18n/config";

/** Renders with the real English messages, for components that use translations. */
export function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale={defaultLocale} messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}
