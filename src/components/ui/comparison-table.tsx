"use client";

import { motion } from "framer-motion";

export type SupportLevel = "yes" | "partial" | "no";

export interface Product {
  id: string;
  name: string;
  logo?: string;
  isPrimary?: boolean;
}

export interface FeatureRow {
  feature: string;
  description?: string;
  support: Record<string, SupportLevel>;
}

interface ComparisonTableProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  rows: FeatureRow[];
  className?: string;
}

const supportMeta: Record<
  SupportLevel,
  { symbol: string; label: string; className: string }
> = {
  yes: {
    symbol: "✓",
    label: "Available",
    className: "text-emerald-400",
  },
  partial: {
    symbol: "◐",
    label: "Partial / via workaround",
    className: "text-amber-400",
  },
  no: {
    symbol: "✗",
    label: "Not available",
    className: "text-neutral-500",
  },
};

function ProductLogo({ product }: { product: Product }) {
  if (!product.logo) return null;

  return (
    <span
      className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-sm"
      aria-hidden="true"
    >
      {product.logo}
    </span>
  );
}

function SupportIcon({ value }: { value: SupportLevel }) {
  const meta = supportMeta[value];

  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold ${meta.className}`}
      aria-label={meta.label}
      title={meta.label}
    >
      {meta.symbol}
    </span>
  );
}

export function ComparisonTable({
  eyebrow = "COMPARISON",
  title,
  subtitle,
  products,
  rows,
  className = "",
}: ComparisonTableProps) {
  const primaryProduct = products.find((product) => product.isPrimary);

  return (
    <section className={`bg-[#050505] px-4 py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.28em] text-signal">
            {eyebrow}
          </p>
          <h2 className="font-display text-4xl font-bold tracking-[-0.04em] text-white md:text-5xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-neutral-400 md:text-lg">
              {subtitle}
            </p>
          )}
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_90px_rgba(0,0,0,0.35)] md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th
                  scope="col"
                  className="w-[28%] px-6 py-5 text-left text-sm font-semibold text-neutral-300"
                >
                  Feature
                </th>
                {products.map((product) => (
                  <th
                    key={product.id}
                    scope="col"
                    className={`px-4 py-5 text-center text-sm font-semibold ${
                      product.isPrimary
                        ? "bg-signal/10 text-signal"
                        : "text-neutral-300"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <ProductLogo product={product} />
                      {product.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.25 }}
                  className="border-b border-white/10 transition-colors duration-200 last:border-b-0 hover:bg-white/5"
                >
                  <th
                    scope="row"
                    title={row.description}
                    className="h-14 px-6 py-4 text-left align-middle"
                  >
                    <span className="block text-base font-semibold text-white">
                      {row.feature}
                    </span>
                    {row.description && (
                      <span className="mt-1 block text-xs leading-5 text-neutral-500">
                        {row.description}
                      </span>
                    )}
                  </th>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className={`h-14 px-4 py-4 text-center align-middle ${
                        product.isPrimary ? "bg-signal/5" : ""
                      }`}
                    >
                      <SupportIcon value={row.support[product.id] ?? "no"} />
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-5 md:hidden">
          {products.map((product) => (
            <div
              key={product.id}
              className={`rounded-2xl border p-5 ${
                product.isPrimary
                  ? "border-signal/30 bg-signal/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="mb-5 flex items-center gap-3">
                <ProductLogo product={product} />
                <h3
                  className={`text-base font-bold ${
                    product.isPrimary ? "text-signal" : "text-white"
                  }`}
                >
                  {product.name}
                </h3>
              </div>
              <div className="space-y-3">
                {rows.map((row) => (
                  <div
                    key={`${product.id}-${row.feature}`}
                    className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{row.feature}</p>
                      {row.description && (
                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          {row.description}
                        </p>
                      )}
                    </div>
                    <SupportIcon value={row.support[product.id] ?? "no"} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-neutral-500">
          <span>
            <span className="font-bold text-emerald-400">✓</span> Available
          </span>
          <span>
            <span className="font-bold text-amber-400">◐</span> Partial / via workaround
          </span>
          <span>
            <span className="font-bold text-neutral-500">✗</span> Not available
          </span>
          {primaryProduct && (
            <span className="text-signal/70">
              {primaryProduct.name} 為本產品
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
