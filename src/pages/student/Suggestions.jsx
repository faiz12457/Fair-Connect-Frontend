import { Link } from 'react-router'
import { Bookmark, Sparkles, ChevronRight } from 'lucide-react'
import { PageHeader, Card, CompanyLogo, MatchPill, Callout, Button, DecisionSupportNote } from '@/components/ui'
import { actions } from '@/store/store'
import { completeness } from '@/lib/match'
import { useStudent, suggestionsFor } from './common'
import { cx } from '@/lib/format'

export default function Suggestions() {
  const { s, student, fair } = useStudent()
  const list = suggestionsFor(s, student, fair)
  const pct = completeness(student)
  return (
    <div>
      <PageHeader eyebrow="Only visible to you" title="Companies you may want to visit" description="Ranked by how well your profile matches each company’s open roles. Companies can’t see this list." />
      {pct < 70 && <Callout tone="warning" title="Your profile is incomplete" className="mb-5" action={<Button size="sm" variant="secondary" to="/student/profile/edit">Complete profile</Button>}>Add skills, your FYP and a resume to make these suggestions more accurate.</Callout>}
      <DecisionSupportNote className="mb-5" />
      <div className="space-y-3">
        {list.map(({ company, best, stall }, i) => {
          const marked = student.bookmarks.includes(company.id)
          return (
            <Card key={company.id} className="p-4">
              <div className="flex items-start gap-3 sm:items-center">
                <span className="hidden w-6 text-center text-sm font-bold text-ink-300 tabular sm:block">{i + 1}</span>
                <CompanyLogo company={company} />
                <Link to={`/student/companies/${company.id}`} className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink-900">{company.name}</span>
                    {stall && <span className="text-[13px] font-semibold text-ink-400">Stall {stall.number}</span>}
                  </div>
                  <div className="text-[13px] text-ink-600">Best fit: {best.job.title}</div>
                  <div className="mt-1.5 flex items-start gap-1.5 text-[13px] text-ai-700">
                    <Sparkles className="mt-0.5 size-3.5 shrink-0" />
                    <span>{best.matchedSkills.length ? `You match ${best.matchedSkills.slice(0, 3).join(', ')}` : 'Few direct skill matches'}{best.missingSkills.length ? ` · missing ${best.missingSkills.slice(0, 2).join(', ')}` : ''}</span>
                  </div>
                </Link>
                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                  <MatchPill score={best.score} size="sm" />
                  <button onClick={() => actions.toggleBookmark(company.id)} aria-label={marked ? 'Remove bookmark' : 'Bookmark'} aria-pressed={marked} className={cx('grid size-9 place-items-center rounded-lg hover:bg-surface-muted', marked ? 'text-brand-600' : 'text-ink-300')}><Bookmark className="size-[18px]" fill={marked ? 'currentColor' : 'none'} /></button>
                  <ChevronRight className="hidden size-4 text-ink-300 sm:block" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
