"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type" | "ref">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hide the password again when its form submits: password managers only offer to
  // save fields that are type="password" at that moment. The DOM is updated directly
  // because the browser reads the field before React would re-render.
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
        ref={inputRef}
        type={isVisible ? "text" : "password"}
        // Room for the toggle; also hide Edge's built-in reveal button so there's only one.
        className={cn("pr-10 [&::-ms-reveal]:hidden", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Show password"
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
