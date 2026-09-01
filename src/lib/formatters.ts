
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function getPeriodBadge(period: string): { label: string; bgClass: string; textClass: string } {
  switch (period) {
    case "Antiquity":
      return {
        label: "Antiquity (c. 800 BCE – 500 CE)",
        bgClass: "bg-amber-100/70 border border-amber-300",
        textClass: "text-amber-900",
      };
    case "Medieval":
      return {
        label: "Medieval Era (500 – 1500 CE)",
        bgClass: "bg-stone-200/80 border border-stone-400",
        textClass: "text-stone-900",
      };
    case "Early Modern":
      return {
        label: "Early Modern (1500 – 1900 CE)",
        bgClass: "bg-orange-100/70 border border-orange-300",
        textClass: "text-orange-950",
      };
    case "20th Century":
      return {
        label: "20th Century (1900 – 2000 CE)",
        bgClass: "bg-red-100/60 border border-red-300",
        textClass: "text-red-950",
      };
    default:
      return {
        label: period,
        bgClass: "bg-neutral-100 border border-neutral-300",
        textClass: "text-neutral-900",
      };
  }
}

