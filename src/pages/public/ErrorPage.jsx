import { Logo, Button } from '@/components/ui'
import { useSession, homeFor } from '@/store/store'

export default function ErrorPage({ code = 404 }) {
  const { user } = useSession()
  const forbidden = code === 403
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted px-5 py-6">
      <Logo />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="text-[96px] leading-none font-extrabold tracking-tight text-brand-100 tabular">{code}</div>
        <h1 className="mt-4 text-2xl font-bold">{forbidden ? 'You don\u2019t have access to this page' : 'Page not found'}</h1>
        <p className="mt-2 max-w-md text-[15px] text-ink-600">{forbidden ? 'This area belongs to a different role, or the record isn\u2019t shared with your account.' : 'The link may be broken, or the page may have moved.'}</p>
        <div className="mt-8 flex gap-3">
          <Button to={user ? homeFor(user) : '/'}>{user ? 'Go to my dashboard' : 'Go home'}</Button>
          {forbidden && <Button variant="secondary" to="/login">Switch account</Button>}
        </div>
      </div>
    </div>
  )
}
