import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { formatValue, type BiResult } from "../engine/bi";

export function BiPreview({ bi, accentHex = "1F2937" }: { bi: BiResult; accentHex?: string }) {
  const color = `#${accentHex}`;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {bi.kpis.map((k, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">{k.label}</div>
            <div className="mt-1.5 text-2xl font-semibold tabular-nums text-neutral-900">
              {formatValue(k.value, k.fmt)}
            </div>
          </div>
        ))}
      </div>

      {bi.groupBy && bi.groupBy.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-medium text-neutral-700">
            {bi.measure} por {bi.dimension}
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bi.groupBy} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatValue(v, bi.fmt)} />
                <Tooltip formatter={(v: number) => formatValue(v, bi.fmt)} />
                <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {bi.timeSeries && bi.timeSeries.length > 1 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-medium text-neutral-700">Evolução no tempo · {bi.measure}</div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bi.timeSeries} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatValue(v, bi.fmt)} />
                <Tooltip formatter={(v: number) => formatValue(v, bi.fmt)} />
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
