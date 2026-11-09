import { Logo } from "@/components/logo";
import { SidePanel } from "./_components/side-panel";
import type { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="relative flex min-h-dvh">
      <Logo className="absolute top-6 left-6 z-10" />
      <SidePanel />
      <main className="flex min-w-0 flex-1 items-center justify-center px-6 pt-20 pb-10 lg:py-10">
        <div className="w-full max-w-[327px] md:max-w-[540px]">{children}</div>
      </main>
    </div>
  );
}
