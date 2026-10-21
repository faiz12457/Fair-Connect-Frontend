import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import AuthLayout from '@/components/shared/AuthLayout'
import { Button, Field, Input, Select, Checkbox } from '@/components/ui'
import { actions, useStore } from '@/store/store'

export default function RegisterStudent() {
  const s = useStore()
  const navigate = useNavigate()
  const [f, setF] = useState({ name: '', email: '', rollNo: '', department: 'BSCS', password: '' })
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!f.name.trim()) errs.name = 'Enter your full name.'
    const domain = f.email.split('@')[1]?.toLowerCase()
    if (!f.email.includes('@')) errs.email = 'Enter a valid email.'
    else if (!s.university.domains.includes(domain)) errs.email = `Use your university email — ${s.university.domains.map((d) => '@' + d).join(' or ')}. Personal emails aren\u2019t accepted.`
    if (!/^[A-Z]{3,5}-[FS]\d{2}-\d{3}$/i.test(f.rollNo)) errs.rollNo = 'Format: BSCS-F21-118'
    if (f.password.length < 8) errs.password = 'At least 8 characters.'
    if (!agree) errs.agree = 'Please accept to continue.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    const r = actions.registerStudent({ ...f, rollNo: f.rollNo.toUpperCase() })
    if (!r.ok) return setErrors({ email: r.message })
    navigate(`/verify-email?u=${r.user.id}`)
  }

  return (
    <AuthLayout aside={{ title: 'One verified profile for every stall.', points: ['Sign up with your @uol.edu.pk email', 'Career Services verifies your academic record', 'Decide what recruiters can see — CGPA can be hidden'] }}>
      <Link to="/register" className="text-[13px] font-semibold text-ink-400 hover:text-ink-700">← Back</Link>
      <h1 className="mt-3 text-[28px] font-bold">Student sign-up</h1>
      <p className="mt-1.5 text-[15px] text-ink-600">{s.university.name}</p>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <Field label="Full name" error={errors.name} htmlFor="n"><Input id="n" value={f.name} onChange={set('name')} aria-invalid={!!errors.name} placeholder="Ayesha Rehman" /></Field>
        <Field label="University email" error={errors.email} hint="We’ll send a verification link." htmlFor="e"><Input id="e" type="email" value={f.email} onChange={set('email')} aria-invalid={!!errors.email} placeholder="name@student.uol.edu.pk" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Roll number" error={errors.rollNo} htmlFor="r"><Input id="r" value={f.rollNo} onChange={set('rollNo')} aria-invalid={!!errors.rollNo} placeholder="BSCS-F21-118" /></Field>
          <Field label="Programme" htmlFor="d">
            <Select id="d" value={f.department} onChange={set('department')}>{['BSCS', 'BSSE', 'BSAI', 'BSIT', 'BSDS'].map((d) => <option key={d}>{d}</option>)}</Select>
          </Field>
        </div>
        <Field label="Password" error={errors.password} htmlFor="p"><Input id="p" type="password" value={f.password} onChange={set('password')} aria-invalid={!!errors.password} placeholder="At least 8 characters" /></Field>
        <Field error={errors.agree}><Checkbox checked={agree} onChange={setAgree} label="I agree that Career Services may verify my academic record." /></Field>
        <Button type="submit" size="lg" className="w-full">Create account</Button>
      </form>
    </AuthLayout>
  )
}
