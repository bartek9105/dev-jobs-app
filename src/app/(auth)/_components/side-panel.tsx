import { PauseIcon, PlayIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const bubbles = [
  "top-[12%] left-[18%] size-20 bg-primary/10 [--bubble-delay:-4s] [--bubble-duration:26s] [--bubble-x:22cqw] [--bubble-y:14cqh]",
  "top-[30%] left-[62%] size-10 bg-primary/20 [--bubble-delay:-11s] [--bubble-duration:19s] [--bubble-x:-26cqw] [--bubble-y:18cqh]",
  "top-[52%] left-[24%] size-14 bg-white/50 [--bubble-delay:-7s] [--bubble-duration:23s] [--bubble-x:30cqw] [--bubble-y:-16cqh]",
  "top-[68%] left-[70%] size-24 bg-primary/10 [--bubble-delay:-15s] [--bubble-duration:31s] [--bubble-x:-20cqw] [--bubble-y:-12cqh]",
  "top-[84%] left-[12%] size-8 bg-primary/25 [--bubble-delay:-2s] [--bubble-duration:17s] [--bubble-x:34cqw] [--bubble-y:-20cqh]",
  "top-[8%] left-[78%] size-6 bg-white/60 [--bubble-delay:-9s] [--bubble-duration:21s] [--bubble-x:-38cqw] [--bubble-y:22cqh]",
];

function SidePanelBubbles() {
  return (
    <div aria-hidden className="absolute inset-0">
      {bubbles.map((bubble) => (
        <span
          key={bubble}
          className={`absolute animate-bubble-drift rounded-full group-has-checked/panel:[animation-play-state:paused] motion-reduce:animate-none ${bubble}`}
        />
      ))}
    </div>
  );
}

// WCAG 2.2.2: endless motion needs a way to pause it. A checkbox plus CSS :has(:checked)
// does that with no JavaScript, so the panel stays a Server Component.
function PauseAnimationToggle() {
  const t = useTranslations("SidePanel");

  return (
    <label className="absolute right-4 bottom-4 flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/70 text-muted-foreground hover:text-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring motion-reduce:hidden">
      <input type="checkbox" className="peer sr-only" />
      <span className="sr-only">{t("pauseAnimation")}</span>
      <PauseIcon aria-hidden className="size-4 peer-checked:hidden" />
      <PlayIcon aria-hidden className="hidden size-4 peer-checked:block" />
    </label>
  );
}

export function SidePanel() {
  return (
    <div className="group/panel @container-size relative hidden w-[30%] shrink-0 overflow-hidden rounded-r-2xl bg-linear-to-br from-primary/5 via-primary/10 to-primary/25 lg:block">
      <SidePanelBubbles />
      <PauseAnimationToggle />
    </div>
  );
}
