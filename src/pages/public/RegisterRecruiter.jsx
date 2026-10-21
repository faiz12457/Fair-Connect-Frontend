import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import AuthLayout from '@/components/shared/AuthLayout'
import { Button, Field, Input, Select, Callout } from '@/components/ui'
import { actions } from '@/store/store'

export default function RegisterRecruiter() {
  const navigate = useNavigate()
  const [f, setF] = useState({ companyName: '', industry: 'Software Engineering', city: 'Lahore', website: '', name: '', title: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    ;['companyName', 'website', 'name', 'title'].forEach((k) => !f[k].trim() && (errs[k] = 'Required'))
    if (!f.email.includes('@')) errs.email = 'Enter a valid work email.'
    else if (/@(gmail|yahoo|hotmail|outlook)\./i.test(f.email)) errs.email = 'Use your company email address.'
    if (f.password.length < 8) errs.password = 'At least 8 characters.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    const r = actions.registerRecruiter(f)
    if (!r.ok) return setErrors({ email: r.message })
    navigate(`/verify-email?u=${r.user.id}`)
  }
  return (
    <AuthLayout aside={{ title: 'Meet students who chose your stall.', points: ['Career Services approves every company', 'Print your stall QR and post your roles', 'See visitors live, ranked by AI match — you decide'] }}>
      <Link to="/register" className="text-[13px] font-semibold text-ink-400 hover:text-ink-700">← Back</Link>
      <h1 className="mt-3 text-[28px] font-bold">Register your company</h1>
      <p className="mt-1.5 text-[15px] text-ink-600">Accounts are reviewed by UOL Career Services before activation.</p>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <div className="text-xs font-semibold tracking-wide text-ink-400 uppercase">Company</div>
        <Field label="Company name" error={errors.companyName} htmlFor="cn"><Input id="cn" value={f.companyName} onChange={set('companyName')} aria-invalid={!!errors.companyName} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Industry" htmlFor="in"><Select id="in" value={f.industry} onChange={set('industry')}>{['Software Engineering', 'IT Services & Consulting', 'FinTech', 'Telecom & Digital', 'AI / Machine Learning', 'Banking', 'FMCG'].map((x) => <option key={x}>{x}</option>)}</Select></Field>
          <Field label="City" htmlFor="ci"><Select id="ci" value={f.city} onChange={set('city')}>{['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad'].map((x) => <option key={x}>{x}</option>)}</Select></Field>
        </div>
        <Field label="Website" error={errors.website} htmlFor="w"><Input id="w" value={f.website} onChange={set('website')} placeholder="company.com" aria-invalid={!!errors.website} /></Field>
        <div className="pt-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">You</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name" error={errors.name} htmlFor="nm"><Input id="nm" value={f.name} onChange={set('name')} aria-invalid={!!errors.name} /></Field>
          <Field label="Job title" error={errors.title} htmlFor="t"><Input id="t" value={f.title} onChange={set('title')} placeholder="HR Lead" aria-invalid={!!errors.title} /></Field>
        </div>
        <Field label="Work email" error={errors.email} htmlFor="em"><Input id="em" type="email" value={f.email} onChange={set('email')} aria-invalid={!!errors.email} placeholder="you@company.com" /></Field>
        <Field label="Password" error={errors.password} htmlFor="pw"><Input id="pw" type="password" value={f.password} onChange={set('password')} aria-invalid={!!errors.password} /></Field>
        <Callout tone="brand">You won't see any student data until the fair goes Live — and then only students who chose to share with you.</Callout>
        <Button type="submit" size="lg" className="w-full">Submit for approval</Button>
      </form>
    </AuthLayout>
  )
}
