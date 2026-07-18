import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { CanalBadge } from "./CanalBadge";
import { formatMoney } from "@/lib/utils";

export interface FilaVendedor {
  id: string;
  vendedor: string;
  cantidad: number;
  monto: number;
  ganancia: number;
  ventasMes: number;
}

export interface FilaCanal {
  canal: string;
  cantidad: number;
  facturacion: number;
  ganancia: number;
}

export function ReporteVendedores({ data }: { data: FilaVendedor[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporte por vendedor</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-[var(--border)] text-left text-xs text-muted">
                <th className="px-6 py-2.5 font-medium">Vendedor</th>
                <th className="px-6 py-2.5 text-right font-medium">Cantidad</th>
                <th className="px-6 py-2.5 text-right font-medium">Vendido</th>
                <th className="px-6 py-2.5 text-right font-medium">Ganancia</th>
                <th className="px-6 py-2.5 text-right font-medium">Del mes</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-muted">
                    Sin ventas registradas.
                  </td>
                </tr>
              ) : (
                data.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-6 py-3 font-medium">{v.vendedor}</td>
                    <td className="px-6 py-3 text-right text-muted">{v.cantidad}</td>
                    <td className="px-6 py-3 text-right">{formatMoney(v.monto)}</td>
                    <td className="px-6 py-3 text-right text-emerald-600 dark:text-emerald-400">
                      {formatMoney(v.ganancia)}
                    </td>
                    <td className="px-6 py-3 text-right text-muted">{v.ventasMes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReporteCanales({ data }: { data: FilaCanal[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporte por canal</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-[var(--border)] text-left text-xs text-muted">
                <th className="px-6 py-2.5 font-medium">Canal</th>
                <th className="px-6 py-2.5 text-right font-medium">Cantidad</th>
                <th className="px-6 py-2.5 text-right font-medium">Facturación</th>
                <th className="px-6 py-2.5 text-right font-medium">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr
                  key={c.canal}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-6 py-3">
                    <CanalBadge canal={c.canal} />
                  </td>
                  <td className="px-6 py-3 text-right text-muted">{c.cantidad}</td>
                  <td className="px-6 py-3 text-right">
                    {formatMoney(c.facturacion)}
                  </td>
                  <td className="px-6 py-3 text-right text-emerald-600 dark:text-emerald-400">
                    {formatMoney(c.ganancia)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
