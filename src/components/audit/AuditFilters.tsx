"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select } from "@/components/ui";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
} from "@/utils/constants";

export function AuditFilters({
  users,
}: {
  users: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Select
        value={params.get("action") ?? ""}
        onChange={(e) => update("action", e.target.value)}
      >
        <option value="">Todas las acciones</option>
        {Object.entries(AUDIT_ACTION_LABELS).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </Select>
      <Select
        value={params.get("entity") ?? ""}
        onChange={(e) => update("entity", e.target.value)}
      >
        <option value="">Todas las entidades</option>
        {Object.entries(AUDIT_ENTITY_LABELS).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </Select>
      <Select
        value={params.get("actorId") ?? ""}
        onChange={(e) => update("actorId", e.target.value)}
      >
        <option value="">Todos los usuarios</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
