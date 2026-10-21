import { Link } from 'react-router'
import { ArrowRight, GraduationCap, Building, ShieldCheck } from 'lucide-react'
import AuthLayout from '@/components/shared/AuthLayout'
import { IconTile } from '@/components/ui'

export default function ChooseRole() {
  return (
    <AuthLayout>
      <h1 className="text-[28px] font-bold">Create your account</h1>
      <p className="mt-1.5 text-[15px] text-ink-600">Choose how you'll use FairConnect.</p>
      <div className="mt-8 space-y-3">
        {[
          ['/register/student', GraduationCap, 'brand', 'I\u2019m a student', 'Sign up with your university email, build one profile, and scan company stalls at the fair.'],
          ['/register/recruiter', Building, 'ai', 'I\u2019m a recruiter', 'Register your company. Career Services approves it before your stall QR is issued.'],
        ].map(([to, Icon, tone, t, d]) => (
          <Link key={to} to={to} className="group flex items-center gap-4 rounded-2xl border border-line p-5 transition-all hover:border-brand-300 hover:shadow-raised">
            <IconTile tone={tone} size="lg"><Icon className="size-5" strokeWidth={1.75} /></IconTile>
            <div className="flex-1">
              <div className="font-semibold text-ink-900">{t}</div>
              <div className="mt-0.5 text-[13px] text-ink-600">{d}</div>
            </div>
            <ArrowRight className="size-5 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
          </Link>
        ))}
      </div>
      <div className="mt-6 flex items-start gap-3 rounded-xl bg-surface-muted p-4 text-[13px] text-ink-600">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink-400" />
        <span><span className="font-semibold text-ink-900">Career Services staff?</span> Admin accounts are invite-only and created by your university.</span>
      </div>
      <p className="mt-6 text-center text-sm text-ink-600">Already have an account? <Link to="/login" className="font-semibold text-brand-600">Sign in</Link></p>
    </AuthLayout>
  )
}
