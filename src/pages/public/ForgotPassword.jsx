import { useState } from 'react'
import { Link } from 'react-router'
import { Mail } from 'lucide-react'
import AuthLayout from '@/components/shared/AuthLayout'
import { Button, Field, Input, Callout } from '@/components/ui'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <AuthLayout>
      <h1 className="text-[28px] font-bold">Reset password</h1>
      <p className="mt-1.5 text-[15px] text-ink-600">Enter your account email and we'll send a reset link.</p>
      {sent ? (
        <Callout tone="success" title="Reset link sent" className="mt-6">If an account exists for {email}, you'll get an email in a minute.</Callout>
      ) : (
        <form onSubmit={(e) => (e.preventDefault(), email.includes('@') && setSent(true))} className="mt-6 space-y-4">
          <Field label="Email" htmlFor="fe"><Input id="fe" type="email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Button type="submit" size="lg" className="w-full">Send reset link</Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm"><Link to="/login" className="font-semibold text-brand-600">Back to sign in</Link></p>
    </AuthLayout>
  )
}
