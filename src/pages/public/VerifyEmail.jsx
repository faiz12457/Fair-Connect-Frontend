import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { MailCheck } from 'lucide-react'
import AuthLayout from '@/components/shared/AuthLayout'
import { Button, IconTile } from '@/components/ui'
import { actions, useStore, homeFor, toast } from '@/store/store'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const s = useStore()
  const navigate = useNavigate()
  const user = s.users.find((u) => u.id === params.get('u'))
  const [sent, setSent] = useState(false)
  return (
    <AuthLayout>
      <IconTile tone="brand" size="lg"><MailCheck className="size-5" /></IconTile>
      <h1 className="mt-5 text-[28px] font-bold">Check your inbox</h1>
      <p className="mt-2 text-[15px] text-ink-600">We sent a verification link to <span className="font-semibold text-ink-900">{user?.email || 'your email'}</span>. Open it to activate your account.</p>
      <div className="mt-8 space-y-3">
        {user && (
          <Button size="lg" className="w-full" onClick={() => (actions.verifyEmail(user.id), navigate(user.role === 'student' ? '/student/onboarding' : homeFor(user)))}>
            Continue (demo — simulate link click)
          </Button>
        )}
        <Button size="lg" variant="secondary" className="w-full" disabled={sent} onClick={() => (setSent(true), toast({ title: 'Verification email resent', tone: 'success' }))}>
          {sent ? 'Email resent' : 'Resend email'}
        </Button>
      </div>
      <p className="mt-6 text-[13px] text-ink-400">Didn't get it? Check spam, or make sure you used your university/company email.</p>
    </AuthLayout>
  )
}
