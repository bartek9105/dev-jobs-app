"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "../../actions";

type GoogleSignInButtonProps = {
  label: string;
  pendingLabel: string;
};

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  return (
    <form action={signInWithGoogle}>
      <SubmitButton {...props} />
    </form>
  );
}

function SubmitButton({ label, pendingLabel }: GoogleSignInButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      variant="outline"
      className="w-full"
      type="submit"
      disabled={pending}
    >
      <Image
        src="/icons/google.svg"
        alt=""
        width={16}
        height={16}
        data-icon="inline-start"
      />
      {pending ? pendingLabel : label}
    </Button>
  );
}
