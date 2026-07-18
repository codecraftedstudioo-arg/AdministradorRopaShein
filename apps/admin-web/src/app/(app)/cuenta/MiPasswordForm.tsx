"use client";

import * as React from "react";
import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { cambiarMiPassword, type FormResult } from "./actions";
import { useToast } from "@/components/ui/Toast";
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";

export function MiPasswordForm() {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<FormResult, FormData>(
    cambiarMiPassword,
    {},
  );

  React.useEffect(() => {
    if (state.ok) {
      toast("Contraseña actualizada", "success");
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          Cambiar mi contraseña
        </CardTitle>
        <CardDescription>
          Ingresá tu contraseña actual y elegí una nueva de al menos 8
          caracteres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="passwordActual" required>
              Contraseña actual
            </Label>
            <Input
              id="passwordActual"
              name="passwordActual"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <Label htmlFor="passwordNueva" required>
              Nueva contraseña
            </Label>
            <Input
              id="passwordNueva"
              name="passwordNueva"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <Label htmlFor="passwordConfirmacion" required>
              Confirmar nueva contraseña
            </Label>
            <Input
              id="passwordConfirmacion"
              name="passwordConfirmacion"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={pending}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
