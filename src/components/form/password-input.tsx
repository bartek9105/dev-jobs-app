"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { mergeRefs } from "@/lib/merge-refs";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type">;

export function PasswordInput({
  className,
  ref,
  ...props
}: PasswordInputProps) {
  const t = useTranslations("PasswordInput");
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    const form = input?.form;
    if (!input || !form) return;

    const hide = () => {
      input.type = "password";
      setIsVisible(false);
    };
    form.addEventListener("submit", hide);
    return () => form.removeEventListener("submit", hide);
  }, []);

  return (
    <div className="relative">
      <Input
        {...props}
        ref={mergeRefs(inputRef, ref)}
        type={isVisible ? "text" : "password"}
        // Room for the toggle; also hide Edge's built-in reveal button so there's only one.
        className={cn("pr-10 [&::-ms-reveal]:hidden", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t("show")}
        aria-pressed={isVisible}
        aria-controls={props.id}
        disabled={props.disabled}
        onClick={() => setIsVisible((visible) => !visible)}
        className="absolute inset-y-0 right-1 my-auto text-muted-foreground hover:text-foreground"
      >
        {isVisible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
      </Button>
    </div>
  );
}
