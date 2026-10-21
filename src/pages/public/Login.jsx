import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Mail, Lock } from 'lucide-react'
import AuthLayout from '@/components/shared/AuthLayout'
import { Button, Field, Input, Callout, Avatar } from '@/components/ui'
import { actions, homeFor } from '@/store/store'

const DEMO = [
  ['Ayesha Rehman', 'Student', 'ayesha.rehman@student.uol.edu.pk'],
  ['Usman Khalid', 'Recruiter · Arbisoft', 'usman.khalid@arbisoft.com'],
  ['Sana Tariq', 'Admin · Career Services', 'sana.tariq@uol.edu.pk'],
]

export default function Login() {
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo')
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const finish = (user) => {
    const ok = returnTo && (returnTo.startsWith('/c/') || returnTo.startsWith('/fair/') || returnTo.startsWith(`/${user.role}`))
    navigate(ok ? returnTo : homeFor(user), { replace: true })
  }
  const submit = (e) => {
    e.preventDefault()
    const r = actions.login(email, password)
    if (r.ok) finish(r.user)
    else setError(r)
  }

  return (
    <AuthLayout>
      <h1 className="text-[28px] font-bold">Sign in</h1>
      <p className="mt-1.5 text-[15px] text-ink-600">{returnTo?.startsWith('/c/') ? 'Sign in to share your profile with this company.' : 'Welcome back to FairConnect.'}</p>

      <div className="mt-6">
        <div className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">Demo accounts</div>
        <div className="grid gap-2">
          {DEMO.map(([n, r, em]) => (
            <button key={em} type="button" onClick={() => finish(actions.login(em, 'demo1234').user)} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/50">
              <Avatar name={n} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink-900">{n}</span>
                <span className="block text-xs text-ink-400">{r}</span>
              </span>
              <span className="text-xs font-semibold text-brand-600">Sign in</span>
            </button>
          ))}
        </div>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-ink-400"><span className="h-px flex-1 bg-line" />or use email<span className="h-px flex-1 bg-line" /></div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && (
          <Callout tone={error.code === 'unverified' ? 'warning' : 'danger'} title={error.message}>
            {error.code === 'unverified' && <Link className="font-semibold underline" to={`/verify-email?u=${error.user.id}`}>Open verification step</Link>}
          </Callout>
        )}
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" icon={Mail} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@student.uol.edu.pk" aria-invalid={!!error} />
        </Field>
        <Field label="Password" htmlFor="pw">
          <Input id="pw" type="password" icon={Lock} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" aria-invalid={!!error} />
        </Field>
        <div className="flex justify-end"><Link to="/forgot-password" className="text-[13px] font-semibold text-brand-600">Forgot password?</Link></div>
        <Button type="submit" size="lg" className="w-full">Sign in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-600">New to FairConnect? <Link to="/register" className="font-semibold text-brand-600">Create an account</Link></p>
    </AuthLayout>
  )
}
