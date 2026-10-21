import { Check, ArrowRight, ScanLine } from 'lucide-react'
import { Button, IconTile } from '@/components/ui'

function HeroMock() {
  return (
    <div className="relative rounded-[20px] border border-line bg-white p-5 shadow-raised before:absolute before:inset-x-0 before:-top-px before:h-1.5 before:rounded-t-[20px] before:bg-brand-600">
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <IconTile tone="brand">FC</IconTile>
          <div>
            <div className="text-[15px] font-semibold text-ink-900">Student dashboard</div>
            <div className="text-xs text-ink-400">Your career fair workspace</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700"><span className="size-1.5 rounded-full bg-success-600" /> Profile verified</span>
      </div>
      <div className="mt-5 rounded-2xl bg-navy-950 p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.12em] text-white/60 uppercase">Fair is live</div>
            <div className="mt-2 text-xl font-bold">Your next step starts here.</div>
            <div className="mt-1 text-[13px] text-white/70">Scan a company's stall QR to share your profile.</div>
          </div>
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-navy-800"><ScanLine className="size-6" /></span>
        </div>
        <div className="mt-5 flex justify-between text-xs"><span className="text-white/70">Profile completion</span><span className="font-semibold">85%</span></div>
        <div className="mt-2 h-1.5 rounded-full bg-white/15"><div className="h-full w-[85%] rounded-full bg-brand-400" /></div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[['Companies to visit', '12', 'Based on your skills'], ['Profiles shared', '03', 'Today']].map(([l, v, h]) => (
          <div key={l} className="rounded-xl border border-line p-4">
            <div className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">{l}</div>
            <div className="mt-1 flex items-baseline gap-3"><span className="text-2xl font-bold text-ink-900 tabular">{v}</span><span className="text-xs text-success-600">{h}</span></div>
          </div>
        ))}
      </div>
      <div className="mt-5 text-[13px] font-semibold text-ink-900">Companies you may want to visit</div>
      <div className="mt-2.5 space-y-2">
        {[['A', 'Arbisoft', 'Backend Engineer · Stall 14', '92% match', 'ai', 'success'], ['N', 'NETSOL Technologies', 'Software Engineer · Stall 7', '86% match', 'orange', 'brand']].map(([m, n, r, s, t, st]) => (
          <div key={n} className="flex items-center gap-3 rounded-xl bg-surface-muted px-3 py-2.5">
            <IconTile tone={t} size="sm">{m}</IconTile>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-ink-900">{n}</div>
              <div className="text-xs text-ink-400">{r}</div>
            </div>
            <span className={st === 'success' ? 'rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700' : 'rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700'}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StudentMock() {
  return (
    <div className="rounded-[20px] border border-line bg-white p-6 shadow-raised">
      <div className="flex items-center gap-3">
        <IconTile tone="brand" size="lg">S</IconTile>
        <div>
          <div className="text-[15px] font-semibold text-ink-900">Your career profile</div>
          <div className="text-xs text-ink-400">One link. Your whole story.</div>
        </div>
      </div>
      <div className="mt-6 text-[11px] font-semibold tracking-wider text-ink-400 uppercase">Skills & experience</div>
      <div className="mt-2 h-1.5 rounded-full bg-line"><div className="h-full w-3/4 rounded-full bg-brand-600" /></div>
      <div className="mt-4 flex flex-wrap gap-2">
        {['React', 'Django', 'Problem solving'].map((s) => <span key={s} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{s}</span>)}
      </div>
      <div className="mt-5 rounded-xl bg-surface-muted p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-400"><ScanLine className="size-3.5" /> Scan company QR</div>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-white p-3">
          <span className="grid size-11 place-items-center rounded-[10px] bg-[#1D4ED8] text-xs font-bold text-white">SL</span>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-ink-900">Systems Limited</div>
            <div className="text-xs text-ink-400">Stall 3 · UOL Career Fair</div>
          </div>
        </div>
        <div className="mt-3 rounded-[10px] bg-brand-600 py-2.5 text-center text-[13px] font-semibold text-white">Share My Profile</div>
        <div className="mt-2 text-center text-[11px] text-ink-400">Scanning doesn't book an interview.</div>
      </div>
    </div>
  )
}

function RecruiterMock() {
  return (
    <div className="rounded-[20px] border border-line bg-white p-6 shadow-raised">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[15px] font-semibold text-ink-900">Candidate overview
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success-700"><span className="size-1.5 animate-pulse rounded-full bg-success-600" /> Live</span>
          </div>
          <div className="text-xs text-ink-400">Students who scanned your stall</div>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-brand-700 uppercase">Backend Engineer</span>
      </div>
      <div className="mt-5 space-y-2.5">
        {[['AR', 'Ayesha R.', 'BS Computer Science · Final year', 92, 'brand', true], ['HM', 'Hamza M.', 'BS Software Engineering · Final year', 87, 'ai'], ['SK', 'Sara K.', 'BS Computer Science · 7th semester', 82, 'orange']].map(([i, n, d, s, t, top]) => (
          <div key={n} className={top ? 'flex items-center gap-3 rounded-xl bg-surface-muted px-3 py-3' : 'flex items-center gap-3 rounded-xl border border-line px-3 py-3'}>
            <span className={`grid size-9 place-items-center rounded-full text-[11px] font-bold ${t === 'brand' ? 'bg-brand-50 text-brand-700' : t === 'ai' ? 'bg-ai-50 text-ai-700' : 'bg-orange-50 text-orange-600'}`}>{i}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-ink-900">{n}</div>
              <div className="truncate text-xs text-ink-400">{d}</div>
            </div>
            <span className={top ? 'rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700' : 'rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700'}>{s}% match</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center text-[11px] text-ink-400">Illustrative candidates and scores — not real hiring data</div>
    </div>
  )
}

const ITEM = ({ children }) => (
  <li className="flex items-start gap-2.5 text-[15px] text-ink-700">
    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-50 text-success-600"><Check className="size-3" strokeWidth={3} /></span>
    {children}
  </li>
)

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[78%] bg-surface-muted" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 pt-14 pb-16 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <div>
            <div className="eyebrow">The smarter university career fair</div>
            <h1 className="mt-4 text-[40px] leading-[1.05] font-extrabold tracking-[-0.02em] sm:text-[56px]">
              Your talent deserves <span className="text-brand-600">to be discovered.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">Students scan a company's stall QR to share a verified profile; recruiters see a live, AI-assisted shortlist.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" to="/register/student" className="min-w-[180px]">I'm a student</Button>
              <Button size="lg" variant="secondary" to="/register/recruiter" className="min-w-[180px]">I'm a recruiter</Button>
            </div>
            <div className="mt-6 grid max-w-md grid-cols-2 gap-x-6 gap-y-2 text-[13px] text-ink-600">
              {['Digital student profiles', 'Company stall QR scans', 'AI-assisted matching', 'Live recruiter shortlist'].map((t) => (
                <span key={t} className="flex items-center gap-2"><Check className="size-3.5 text-ink-400" /> {t}</span>
              ))}
            </div>
          </div>
          <HeroMock />
        </div>
      </section>

      {/* Value strip */}
      <section className="mx-auto grid max-w-[1200px] gap-6 px-5 py-10 sm:grid-cols-3">
        {[['01', 'Built for students', 'Make your first impression count', 'brand'], ['02', 'Designed for recruiters', 'Find relevant candidates faster', 'brand'], ['03', 'A more organized fair', 'Less paper, easier connections', 'success']].map(([n, t, d, tone]) => (
          <div key={n} className="flex items-center gap-4">
            <IconTile tone={tone} size="lg">{n}</IconTile>
            <div>
              <div className="font-semibold text-ink-900">{t}</div>
              <div className="text-[13px] text-ink-400">{d}</div>
            </div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-[1200px] scroll-mt-24 px-5 py-14 sm:py-24">
        <div className="text-center">
          <div className="eyebrow">How it works</div>
          <h2 className="mt-3 text-[28px] font-bold sm:text-[36px]">A simpler process. Better connections.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[17px] text-ink-600">Bring your career fair experience into one organized digital platform — before, during, and after the event.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            ['ID', 'brand', '01', 'One digital profile', 'Keep your resume, skills, education, and projects in one profile — verified by your university.'],
            ['AI', 'ai', '02', 'Smarter resume matching', 'AI compares your skills, CGPA, FYP and certifications with each job and suggests companies worth visiting.'],
            ['QR', 'brand', '03', 'Scan a stall, share your profile', 'Scan the company\u2019s QR at its stall and confirm sharing. No paper CV, no repeated pitch.'],
          ].map(([m, tone, n, t, d]) => (
            <div key={n} className="rounded-2xl border border-line bg-white p-7 transition-shadow hover:shadow-raised">
              <div className="flex items-start justify-between"><IconTile tone={tone} size="lg">{m}</IconTile><span className="text-[13px] font-semibold text-ink-400">{n}</span></div>
              <h3 className="mt-6 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{d}</p>
              <a href="#students" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">Explore feature <ArrowRight className="size-4" /></a>
            </div>
          ))}
        </div>
      </section>

      {/* For students */}
      <section id="students" className="scroll-mt-16 bg-surface-muted">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-14 sm:py-24 lg:grid-cols-2">
          <StudentMock />
          <div>
            <div className="eyebrow">For students</div>
            <h2 className="mt-3 text-[28px] leading-tight font-bold sm:text-[36px]">Spend less time handing out resumes. More time making connections.</h2>
            <p className="mt-4 text-[17px] text-ink-600">Build a profile that brings your education, projects, and skills together. At the fair, scan a company's stall QR and confirm exactly what you share.</p>
            <ul className="mt-6 space-y-3">
              <ITEM>Build a digital career profile</ITEM>
              <ITEM>Upload and manage your resume</ITEM>
              <ITEM>Discover companies you may want to visit</ITEM>
              <ITEM>Share your profile by scanning a company's stall QR</ITEM>
            </ul>
            <Button size="lg" to="/register/student" className="mt-8">Create student profile</Button>
          </div>
        </div>
      </section>

      {/* For recruiters */}
      <section id="recruiters" className="mx-auto grid max-w-[1200px] scroll-mt-16 items-center gap-12 px-5 py-14 sm:py-24 lg:grid-cols-2">
        <div>
          <div className="eyebrow">For recruiters</div>
          <h2 className="mt-3 text-[28px] leading-tight font-bold sm:text-[36px]">Meet relevant talent without getting buried in paperwork.</h2>
          <p className="mt-4 text-[17px] text-ink-600">Review candidate profiles in one place and use AI-assisted matching to help prioritize resumes against the requirements of each role.</p>
          <div className="mt-8 space-y-5">
            {[['S', 'brand', 'Search with purpose', 'Review skills, education, and projects from one view.'], ['AI', 'ai', 'AI-assisted shortlisting', 'Use match scores as decision support, not a final hiring decision.'], ['QR', 'brand', 'Live stall feed', 'Students who scan your stall QR appear instantly, ranked by match.']].map(([m, t, h, d]) => (
              <div key={h} className="flex gap-4">
                <IconTile tone={t}>{m}</IconTile>
                <div>
                  <div className="font-semibold text-ink-900">{h}</div>
                  <div className="text-[14px] text-ink-400">{d}</div>
                </div>
              </div>
            ))}
          </div>
          <Button size="lg" variant="secondary" to="/register/recruiter" className="mt-8">Register your company</Button>
        </div>
        <RecruiterMock />
      </section>

      {/* CTA */}
      <section className="bg-navy-900">
        <div className="mx-auto max-w-[1200px] px-5 py-16 text-center sm:py-20">
          <div className="text-xs font-semibold tracking-[0.12em] text-brand-300 uppercase">The future of career fairs</div>
          <h2 className="mt-3 text-[28px] font-bold text-white sm:text-[36px]">A handshake can start with one scan.</h2>
          <p className="mt-3 text-[17px] text-white/70">Student profiles, company opportunities, and recruiter workflows — all in one connected experience.</p>
          <Button size="lg" to="/register" className="mt-8">Get started today</Button>
        </div>
      </section>
    </>
  )
}
