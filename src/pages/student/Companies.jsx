import { useState } from 'react'
import { Link } from 'react-router'
import { Search, Bookmark, MapPin } from 'lucide-react'
import { PageHeader, Card, Input, Select, CompanyLogo, EmptyState, Chip, Badge, Button } from '@/components/ui'
import { actions, stallFor } from '@/store/store'
import { useStudent } from './common'
import { cx } from '@/lib/format'

export default function Companies() {
  const { s, student, fair } = useStudent()
  const [q, setQ] = useState('')
  const [industry, setIndustry] = useState('all')
  const [type, setType] = useState('all')
  const [saved, setSaved] = useState(false)
  const companies = s.companies.filter((c) => c.status === 'approved' && fair.companyIds.includes(c.id))
  const industries = [...new Set(companies.map((c) => c.industry))]
  const list = companies.filter((c) => {
    const jobs = s.jobs.filter((j) => j.companyId === c.id && j.status === 'active')
    const text = `${c.name} ${c.industry} ${jobs.map((j) => j.title + ' ' + j.skills.join(' ')).join(' ')}`.toLowerCase()
    return (!q || text.includes(q.toLowerCase())) && (industry === 'all' || c.industry === industry) && (type === 'all' || jobs.some((j) => j.type === type)) && (!saved || student.bookmarks.includes(c.id))
  })
  return (
    <div>
      <PageHeader eyebrow={fair.name} title="Companies" description={`${companies.length} companies are taking part. Bookmark the ones you want to visit.`} />
      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <Input icon={Search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies, roles or skills" className="sm:w-80" aria-label="Search companies" />
        <div className="flex gap-2">
          <Select value={industry} onChange={(e) => setIndustry(e.target.value)} aria-label="Industry"><option value="all">All industries</option>{industries.map((i) => <option key={i}>{i}</option>)}</Select>
          <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Role type" className="w-40"><option value="all">All roles</option><option>Full-time</option><option>Internship</option></Select>
        </div>
        <Chip active={saved} onClick={() => setSaved(!saved)} className="h-10 self-start px-4">Saved ({student.bookmarks.length})</Chip>
      </div>
      {list.length === 0 ? (
        <Card><EmptyState icon={Search} title="No companies match" body="Try a different search or clear the filters." action={<Button variant="secondary" onClick={() => (setQ(''), setIndustry('all'), setType('all'), setSaved(false))}>Clear filters</Button>} /></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((c) => {
            const jobs = s.jobs.filter((j) => j.companyId === c.id && j.status === 'active')
            const stall = stallFor(s, fair.id, c.id)
            const marked = student.bookmarks.includes(c.id)
            return (
              <Card key={c.id} className="relative p-4 transition-shadow hover:shadow-raised">
                <Link to={`/student/companies/${c.id}`} className="absolute inset-0 rounded-2xl" aria-label={c.name} />
                <div className="flex items-start gap-3">
                  <CompanyLogo company={c} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink-900">{c.name}</div>
                    <div className="truncate text-[13px] text-ink-400">{c.industry}</div>
                  </div>
                  <button onClick={() => actions.toggleBookmark(c.id)} aria-pressed={marked} aria-label={marked ? `Remove ${c.name} bookmark` : `Bookmark ${c.name}`} className={cx('relative z-10 grid size-9 place-items-center rounded-lg hover:bg-surface-muted', marked ? 'text-brand-600' : 'text-ink-300')}>
                    <Bookmark className="size-[18px]" fill={marked ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {jobs.slice(0, 2).map((j) => <Badge key={j.id} tone="brand">{j.title}</Badge>)}
                  {jobs.length > 2 && <Badge>+{jobs.length - 2}</Badge>}
                </div>
                <div className="mt-3 flex items-center gap-3 text-[13px] text-ink-400">
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {c.city}</span>
                  {stall ? <span className="font-semibold text-ink-700">Stall {stall.number}</span> : <span>Stall TBA</span>}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
