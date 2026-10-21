import { useEffect, useState } from "react"
import { useStore, useSession, currentFair, stallFor } from "@/store/store"

/** Shared recruiter context. Interactions are always scoped to the signed-in company. */
export function useRecruiter() {
  const s = useStore()
  const { user, company } = useSession()
  const fair = currentFair(s)
  const stall = company ? stallFor(s, fair.id, company.id) : null
  const jobs = company ? s.jobs.filter((j) => j.companyId === company.id) : []
  const interactions = company
    ? s.interactions.filter(
        (i) => i.companyId === company.id && i.fairId === fair.id,
      )
    : []
  return { s, user, company, fair, stall, jobs, interactions }
}

/** Re-renders periodically so relative times ("2 min ago") stay fresh. */
export function useTick(ms = 30000) {
  const [, set] = useState(0)
  useEffect(() => {
    const t = setInterval(() => set((n) => n + 1), ms)
    return () => clearInterval(t)
  }, [ms])
}

export const CGPA_BANDS = [
  ["< 2.5", 0, 2.5],
  ["2.5–2.99", 2.5, 3],
  ["3.0–3.49", 3, 3.5],
  ["3.5+", 3.5, 5],
]

export const CHART = {
  brand: "#2563eb",
  brandLight: "#93b4fb",
  ai: "#7c3aed",
  success: "#16a34a",
  warning: "#d97706",
  navy: "#0f1f45",
  grid: "#e5eaf2",
  ink: "#94a3b8",
}
export const axisProps = {
  tick: { fill: "#94a3b8", fontSize: 12 },
  axisLine: false,
  tickLine: false,
}
export const tooltipProps = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid #e5eaf2",
    fontSize: 13,
    boxShadow: "0 12px 40px -12px rgb(15 31 69 / 0.18)",
  },
  cursor: { fill: "#f4f7fc" },
}
