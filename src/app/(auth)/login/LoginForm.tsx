"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { loginAction, type LoginState } from "./actions";
import { Button, Input, Label } from "@/components/ui";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [showPassword, setShowPassword] = React.useState(false);
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  // Redirección tras login exitoso.
  const [submitted, setSubmitted] = React.useState(false);
  React.useEffect(() => {
    if (submitted && !pending && !state.error) {
      const callback = params.get("callbackUrl") || "/dashboard";
      router.replace(callback);
      router.refresh();
    }
  }, [submitted, pending, state.error, params, router]);

  return (
    <form
      action={formAction}
      onSubmit={() => setSubmitted(true)}
      className="flex flex-col gap-5"
    >
      <div>
        <Label htmlFor="email" required>
          Email
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            defaultValue=""
            className="pl-10"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="password" required>
          Contraseña
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="px-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {state.error && (
        <div className="animate-fade-in rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        loading={pending}
        className={cn("mt-1 w-full")}
      >
        {!pending && (
          <>
            Ingresar
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
