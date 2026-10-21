import { useStore, useSession, currentFair, stallFor } from '@/store/store'
import { bestJobMatch } from '@/lib/match'

export function useStudent() {
  const s = useStore()
  const { student, user } = useSession()
  const fair = currentFair(s)
  return { s, student, user, fair }
}

/** Pre-fair "Companies You May Want to Visit" — visible only to the student. */
export function suggestionsFor(s, student, fair) {
  return fair.companyIds
    .map((cid) => s.companies.find((c) => c.id === cid))
    .filter((c) => c && c.status === 'approved')
    .map((company) => {
      const jobs = s.jobs.filter((j) => j.companyId === company.id && j.status === 'active')
      if (!jobs.length) return null
      const best = bestJobMatch(student, jobs, fair.weights)
      const stall = stallFor(s, fair.id, company.id)
      return { company, best, stall, jobs }
    })
    .filter(Boolean)
    .sort((a, b) => b.best.score - a.best.score)
}
