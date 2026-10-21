import { useParams } from "react-router"
import { useStore, useSession, currentFair } from "@/store/store"

export {
  CHART,
  axisProps,
  tooltipProps,
  CGPA_BANDS,
} from "@/pages/recruiter/common"

export function useAdmin() {
  const s = useStore()
  const { user } = useSession()
  return { s, user, fair: currentFair(s) }
}

/** Fair from the `:id` route param (falls back to the current fair). */
export function useFairParam() {
  const ctx = useAdmin()
  const { id } = useParams()
  const fair = ctx.s.fairs.find((f) => f.id === id) || null
  return { ...ctx, fair, missing: !fair }
}

export const FAIR_TONE = {
  upcoming: "warning",
  live: "success",
  ended: "gray",
  archived: "neutral",
}
export const FAIR_LABEL = {
  upcoming: "Upcoming",
  live: "Live",
  ended: "Ended",
  archived: "Archived",
}
