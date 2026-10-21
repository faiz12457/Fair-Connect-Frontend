import { useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { X, Sparkles, ShieldCheck, Check, LoaderCircle, ArrowLeft, Info, CircleCheck, TriangleAlert, CircleX } from 'lucide-react'
import { cx, initials, scoreTone, statusLabel, STATUS } from '@/lib/format'
import { useToasts, dismissToast } from '@/store/store'

// ---------- Brand ----------
export function Logo({ dark = false, to = '/', size = 'md' }) {
  const box = size === 'sm' ? 'size-7 text-[11px]' : 'size-9 text-[13px]'
  return (
    <Link to={to} className="inline-flex items-center gap-2.5 rounded-lg">
      <span className={cx('grid place-items-center rounded-[10px] bg-brand-600 font-bold text-white', box)}>FC</span>
      <span className={cx('font-bold tracking-tight', size === 'sm' ? 'text-base' : 'text-lg', dark ? 'text-white' : 'text-ink-900')}>FairConnect</span>
    </Link>
  )
}

// ---------- Buttons ----------
const BTN = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-[0_1px_2px_rgb(37_99_235/0.3)]',
  secondary: 'bg-white text-ink-900 border border-line hover:border-ink-300 hover:bg-surface-muted',
  ghost: 'text-ink-700 hover:bg-surface-muted',
  danger: 'bg-danger-600 text-white hover:bg-danger-700',
  'danger-outline': 'bg-white text-danger-600 border border-danger-600/30 hover:bg-danger-50',
  success: 'bg-success-600 text-white hover:bg-success-700',
  dark: 'bg-navy-950 text-white hover:bg-navy-900',
  white: 'bg-white text-navy-950 hover:bg-brand-50',
  ai: 'bg-ai-600 text-white hover:bg-ai-700',
}
const SIZE = { sm: 'h-8 px-3 text-[13px] gap-1.5', md: 'h-10 px-4 text-sm gap-2', lg: 'h-12 px-6 text-[15px] gap-2' }

export function Button({ variant = 'primary', size = 'md', to, href, icon: Icon, iconRight: IconRight, loading, className, children, disabled, ...rest }) {
  const cls = cx(
    'inline-flex shrink-0 items-center justify-center rounded-[10px] font-semibold whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
    BTN[variant],
    SIZE[size],
    className,
  )
  const content = (
    <>
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : Icon && <Icon className="size-4" strokeWidth={2} />}
      {children}
      {IconRight && <IconRight className="size-4" strokeWidth={2} />}
    </>
  )
  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{content}</a>
  return <button type="button" className={cls} disabled={disabled || loading} {...rest}>{content}</button>
}

export function IconButton({ icon: Icon, label, className, size = 'md', ...rest }) {
  return (
    <button type="button" aria-label={label} title={label} className={cx('grid place-items-center rounded-[10px] text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900', size === 'sm' ? 'size-8' : 'size-10', className)} {...rest}>
      <Icon className="size-[18px]" strokeWidth={1.75} />
    </button>
  )
}

// ---------- Surfaces ----------
export function Card({ className, children, as: As = 'div', ...rest }) {
  return <As className={cx('rounded-2xl border border-line bg-white shadow-card', className)} {...rest}>{children}</As>
}

export function CardHeader({ title, description, actions, className }) {
  return (
    <div className={cx('flex items-start justify-between gap-4 px-5 pt-5', className)}>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-ink-900">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] text-ink-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

const TILE = {
  brand: 'bg-brand-50 text-brand-600',
  ai: 'bg-ai-50 text-ai-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  danger: 'bg-danger-50 text-danger-600',
  orange: 'bg-orange-50 text-orange-600',
  navy: 'bg-navy-800 text-white',
  gray: 'bg-surface-muted text-ink-600',
}
export function IconTile({ children, tone = 'brand', size = 'md', className }) {
  return (
    <span className={cx('grid shrink-0 place-items-center rounded-[10px] font-bold', TILE[tone], size === 'sm' ? 'size-8 text-[11px]' : size === 'lg' ? 'size-12 text-sm' : 'size-10 text-xs', className)}>
      {children}
    </span>
  )
}

// ---------- Badges & pills ----------
const BADGE = {
  neutral: 'bg-surface-muted text-ink-600 ring-line',
  gray: 'bg-surface-muted text-ink-400 ring-line',
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  success: 'bg-success-50 text-success-700 ring-success-600/15',
  warning: 'bg-warning-50 text-warning-700 ring-warning-600/15',
  danger: 'bg-danger-50 text-danger-700 ring-danger-600/15',
  ai: 'bg-ai-50 text-ai-700 ring-ai-600/15',
  navy: 'bg-navy-900 text-white ring-navy-900',
}
export function Badge({ tone = 'neutral', children, dot, icon: Icon, className }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset', BADGE[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {Icon && <Icon className="size-3.5" strokeWidth={2} />}
      {children}
    </span>
  )
}

export function StatusPill({ status, audience = 'recruiter' }) {
  return <Badge tone={STATUS[status]?.tone || 'neutral'} dot>{statusLabel(status, audience)}</Badge>
}

export function MatchPill({ score, size = 'md', hideLabel }) {
  const tone = scoreTone(score)
  const cls = { success: 'bg-success-50 text-success-700', warning: 'bg-warning-50 text-warning-700', gray: 'bg-surface-muted text-ink-600' }[tone]
  return (
    <span className={cx('inline-flex items-center rounded-full font-semibold tabular whitespace-nowrap', cls, size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-[13px]')}>
      {score}%{!hideLabel && ' match'}
    </span>
  )
}

export function ScoreRing({ score, size = 72, stroke = 7, label = 'match' }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const tone = scoreTone(score)
  const color = { success: 'var(--color-success-600)', warning: 'var(--color-warning-600)', gray: 'var(--color-ink-400)' }[tone]
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${score}% ${label}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * score) / 100} style={{ transition: 'stroke-dashoffset 600ms ease-out' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <div>
          <div className="font-bold text-ink-900 tabular" style={{ fontSize: size * 0.26 }}>{score}</div>
          <div className="mt-0.5 text-[10px] font-medium text-ink-400 uppercase">{label}</div>
        </div>
      </div>
    </div>
  )
}

const FACTORS = [
  ['skills', 'Skills match'],
  ['cgpa', 'CGPA vs requirement'],
  ['fyp', 'FYP relevance'],
  ['certs', 'Certifications'],
]
export function ScoreBreakdown({ breakdown, weights, cgpaHidden }) {
  return (
    <div className="space-y-3">
      {FACTORS.map(([k, label]) => {
        const hidden = k === 'cgpa' && cgpaHidden
        return (
          <div key={k}>
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span className="font-medium text-ink-700">
                {label} <span className="text-ink-400">· {weights[k]}%</span>
              </span>
              <span className="font-semibold text-ink-900 tabular">{hidden ? <span className="font-medium text-ink-400">Hidden by student</span> : `${breakdown[k]}%`}</span>
            </div>
            <ProgressBar value={hidden ? 0 : breakdown[k]} tone={hidden ? 'gray' : 'brand'} />
          </div>
        )
      })}
    </div>
  )
}

export function ProgressBar({ value, tone = 'brand', className, size = 'md' }) {
  const bar = { brand: 'bg-brand-600', success: 'bg-success-600', warning: 'bg-warning-600', ai: 'bg-ai-600', gray: 'bg-ink-300', light: 'bg-brand-400' }[tone]
  return (
    <div className={cx('w-full overflow-hidden rounded-full bg-line', size === 'sm' ? 'h-1.5' : 'h-2', className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cx('h-full rounded-full transition-[width] duration-500 ease-out', bar)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

const AV = {
  brand: 'bg-brand-50 text-brand-700',
  ai: 'bg-ai-50 text-ai-700',
  success: 'bg-success-50 text-success-700',
  orange: 'bg-orange-50 text-orange-600',
}
export function Avatar({ name, tint = 'brand', size = 'md', className }) {
  const s = { xs: 'size-7 text-[10px]', sm: 'size-8 text-[11px]', md: 'size-10 text-xs', lg: 'size-14 text-base', xl: 'size-20 text-xl' }[size]
  return <span className={cx('grid shrink-0 place-items-center rounded-full font-bold', AV[tint] || AV.brand, s, className)} aria-hidden>{initials(name)}</span>
}

export function CompanyLogo({ company, size = 'md', className }) {
  const s = { sm: 'size-8 text-[11px] rounded-lg', md: 'size-10 text-xs rounded-[10px]', lg: 'size-14 text-base rounded-xl', xl: 'size-20 text-2xl rounded-2xl' }[size]
  return (
    <span className={cx('grid shrink-0 place-items-center font-bold text-white', s, className)} style={{ background: company?.color || 'var(--color-brand-600)' }} aria-hidden>
      {initials(company?.name || '?')}
    </span>
  )
}

// ---------- Form controls ----------
export function Field({ label, hint, error, children, required, className, htmlFor }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-ink-900">
          {label} {required && <span className="text-danger-600">*</span>}
        </label>
      )}
      {children}
      {error ? <p className="mt-1.5 text-[13px] font-medium text-danger-600">{error}</p> : hint && <p className="mt-1.5 text-[13px] text-ink-400">{hint}</p>}
    </div>
  )
}
const inputCls = 'w-full rounded-[10px] border border-line bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition-colors hover:border-ink-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted aria-[invalid=true]:border-danger-600'
export function Input({ className, icon: Icon, ...rest }) {
  if (Icon)
    return (
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
        <input className={cx(inputCls, 'h-10 pl-9', className)} {...rest} />
      </div>
    )
  return <input className={cx(inputCls, 'h-10', className)} {...rest} />
}
export function Textarea({ className, ...rest }) {
  return <textarea className={cx(inputCls, 'min-h-24 py-2.5 leading-relaxed', className)} {...rest} />
}
export function Select({ className, children, ...rest }) {
  return (
    <select className={cx(inputCls, 'h-10 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 fill=%27none%27 stroke=%27%2394a3b8%27 stroke-width=%272%27%3E%3Cpath d=%27m4 6 4 4 4-4%27/%3E%3C/svg%3E")] bg-[position:right_12px_center] bg-no-repeat pr-9', className)} {...rest}>
      {children}
    </select>
  )
}
export function Checkbox({ checked, onChange, label, description, className }) {
  const id = useId()
  return (
    <label htmlFor={id} className={cx('flex cursor-pointer items-start gap-3', className)}>
      <span className="relative mt-0.5 grid size-[18px] shrink-0 place-items-center">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer size-[18px] cursor-pointer appearance-none rounded-[5px] border border-ink-300 bg-white checked:border-brand-600 checked:bg-brand-600" />
        <Check className="pointer-events-none absolute size-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
      </span>
      {(label || description) && (
        <span>
          <span className="block text-sm font-medium text-ink-900">{label}</span>
          {description && <span className="block text-[13px] text-ink-400">{description}</span>}
        </span>
      )}
    </label>
  )
}
export function Switch({ checked, onChange, label, description, disabled }) {
  return (
    <div className="flex items-start justify-between gap-4">
      {(label || description) && (
        <div>
          <div className="text-sm font-semibold text-ink-900">{label}</div>
          {description && <div className="mt-0.5 text-[13px] text-ink-400">{description}</div>}
        </div>
      )}
      <button type="button" role="switch" aria-checked={checked} aria-label={typeof label === 'string' ? label : undefined} disabled={disabled} onClick={() => onChange(!checked)} className={cx('relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50', checked ? 'bg-brand-600' : 'bg-ink-300')}>
        <span className={cx('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-5')} />
      </button>
    </div>
  )
}
export function Slider({ value, onChange, min = 0, max = 100, step = 1, label }) {
  return <input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-2 w-full cursor-pointer accent-brand-600" />
}
export function Chip({ children, onRemove, active, onClick, tone, className }) {
  const base = cx(
    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium transition-colors',
    tone === 'success' ? 'bg-success-50 text-success-700' : tone === 'missing' ? 'bg-white text-ink-400 ring-1 ring-line ring-inset line-through decoration-ink-300' : active ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700',
    onClick && !active && 'hover:bg-brand-100',
    className,
  )
  const inner = (
    <>
      {children}
      {onRemove && (
        <span role="button" tabIndex={0} aria-label={`Remove ${children}`} onClick={(e) => (e.stopPropagation(), onRemove())} onKeyDown={(e) => e.key === 'Enter' && onRemove()} className="-mr-1 grid size-4 place-items-center rounded-full hover:bg-brand-200">
          <X className="size-3" />
        </span>
      )}
    </>
  )
  return onClick ? <button type="button" onClick={onClick} aria-pressed={active} className={base}>{inner}</button> : <span className={base}>{inner}</span>
}

// ---------- Data display ----------
export function StatCard({ label, value, hint, icon: Icon, tone = 'brand', trend, className }) {
  return (
    <Card className={cx('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-semibold tracking-wide text-ink-400 uppercase">{label}</div>
        {Icon && <IconTile tone={tone} size="sm"><Icon className="size-4" strokeWidth={1.75} /></IconTile>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-[28px] leading-none font-bold text-ink-900 tabular">{value}</div>
        {trend && <span className="text-xs font-semibold text-success-600">{trend}</span>}
      </div>
      {hint && <div className="mt-2 text-[13px] text-ink-400">{hint}</div>}
    </Card>
  )
}

export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div role="tablist" className={cx('flex gap-1 overflow-x-auto border-b border-line', className)}>
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)} className={cx('relative -mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors', value === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-400 hover:text-ink-700')}>
          {t.label}
          {t.count != null && <span className={cx('rounded-full px-1.5 text-[11px] tabular', value === t.id ? 'bg-brand-50 text-brand-700' : 'bg-surface-muted text-ink-400')}>{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function SegmentedControl({ options, value, onChange, className, size = 'md' }) {
  return (
    <div className={cx('inline-flex rounded-[10px] bg-surface-muted p-1 ring-1 ring-line ring-inset', className)}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} className={cx('rounded-[7px] px-3 font-semibold whitespace-nowrap transition-all', size === 'sm' ? 'py-1 text-xs' : 'py-1.5 text-[13px]', value === o.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-400 hover:text-ink-700')}>
          {o.label}
          {o.count != null && <span className="ml-1.5 text-ink-400 tabular">{o.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Stepper({ steps, current, onStep, vertical }) {
  return (
    <ol className={cx(vertical ? 'space-y-1' : 'flex items-center gap-2')}>
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s} className={cx(!vertical && 'flex flex-1 items-center gap-2')}>
            <button type="button" disabled={!onStep || i > current} onClick={() => onStep?.(i)} className={cx('flex w-full items-center gap-3 rounded-[10px] text-left', vertical && 'px-3 py-2.5', vertical && active && 'bg-brand-50')}>
              <span className={cx('grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold tabular', done ? 'bg-brand-600 text-white' : active ? 'bg-white text-brand-700 ring-2 ring-brand-600' : 'bg-surface-muted text-ink-400')}>
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cx('text-sm font-semibold', active ? 'text-ink-900' : done ? 'text-ink-700' : 'text-ink-400', !vertical && 'hidden lg:inline')}>{s}</span>
            </button>
            {!vertical && i < steps.length - 1 && <span className={cx('h-0.5 flex-1 rounded-full', done ? 'bg-brand-600' : 'bg-line')} />}
          </li>
        )
      })}
    </ol>
  )
}

export function Timeline({ items }) {
  return (
    <ol className="relative space-y-5 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-0.5 before:bg-line">
      {items.map((it, i) => (
        <li key={i} className="relative">
          <span className={cx('absolute top-1 -left-6 size-4 rounded-full ring-4 ring-white', it.active ? 'bg-brand-600' : it.done ? 'bg-success-600' : 'bg-ink-300')} />
          <div className="text-sm font-semibold text-ink-900">{it.title}</div>
          {it.meta && <div className="text-[13px] text-ink-400">{it.meta}</div>}
          {it.body && <div className="mt-1 text-[13px] text-ink-600">{it.body}</div>}
        </li>
      ))}
    </ol>
  )
}

export function LiveIndicator({ status = 'live', className }) {
  if (status !== 'live')
    return <Badge tone={status === 'upcoming' ? 'warning' : 'gray'} className={className}>{status === 'upcoming' ? 'Upcoming' : status === 'ended' ? 'Ended' : 'Archived'}</Badge>
  return (
    <span className={cx('inline-flex items-center gap-2 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-semibold text-success-700 ring-1 ring-success-600/15 ring-inset', className)}>
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping-slow rounded-full bg-success-600 opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-success-600" />
      </span>
      Live
    </span>
  )
}

export function DecisionSupportNote({ className, compact }) {
  return (
    <div className={cx('flex items-start gap-2 rounded-[10px] bg-ai-50 text-ai-700', compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2.5 text-[13px]', className)}>
      <Sparkles className="mt-0.5 size-3.5 shrink-0" />
      <span><span className="font-semibold">Decision support — you decide.</span>{!compact && ' AI scores rank candidates; they never change a status on their own.'}</span>
    </div>
  )
}

export function PrivacyNote({ children, className }) {
  return (
    <div className={cx('flex items-start gap-2 rounded-[10px] bg-surface-muted px-3 py-2.5 text-[13px] text-ink-600', className)}>
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success-600" />
      <span>{children}</span>
    </div>
  )
}

export function Callout({ tone = 'brand', title, children, icon, action, className }) {
  const map = {
    brand: ['bg-brand-50 text-brand-700 ring-brand-100', Info],
    success: ['bg-success-50 text-success-700 ring-success-600/15', CircleCheck],
    warning: ['bg-warning-50 text-warning-700 ring-warning-600/20', TriangleAlert],
    danger: ['bg-danger-50 text-danger-700 ring-danger-600/15', CircleX],
    ai: ['bg-ai-50 text-ai-700 ring-ai-600/15', Sparkles],
  }
  const [cls, DefaultIcon] = map[tone]
  const Ico = icon || DefaultIcon
  return (
    <div className={cx('flex items-start gap-3 rounded-xl px-4 py-3 ring-1 ring-inset', cls, className)}>
      <Ico className="mt-0.5 size-[18px] shrink-0" />
      <div className="min-w-0 flex-1 text-[13px]">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {children && <div className={cx(title && 'mt-0.5', 'opacity-90')}>{children}</div>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ icon: Icon, tile, title, body, action, className }) {
  return (
    <div className={cx('flex flex-col items-center px-6 py-12 text-center', className)}>
      {tile ? <IconTile tone="brand" size="lg">{tile}</IconTile> : Icon && <IconTile tone="brand" size="lg"><Icon className="size-5" strokeWidth={1.75} /></IconTile>}
      <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-ink-400">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cx('animate-pulse rounded-lg bg-line/70', className)} />
}

export function PageHeader({ eyebrow, title, description, actions, back, className }) {
  return (
    <div className={cx('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-400 hover:text-ink-700">
            <ArrowLeft className="size-4" /> {back.label}
          </Link>
        )}
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h1 className="text-2xl font-bold sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[15px] text-ink-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

// ---------- Overlays ----------
function useEscape(open, onClose) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  useEscape(open, onClose)
  const ref = useRef(null)
  useEffect(() => {
    if (open) setTimeout(() => ref.current?.querySelector('input,textarea,select,button:not([aria-label="Close"])')?.focus(), 50)
  }, [open])
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div ref={ref} role="dialog" aria-modal="true" aria-label={title} initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.18, ease: 'easeOut' }} className={cx('relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-pop sm:rounded-2xl', { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }[size])}>
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && <p className="mt-0.5 text-[13px] text-ink-400">{description}</p>}
              </div>
              <IconButton icon={X} label="Close" size="sm" onClick={onClose} className="-mr-2" />
            </div>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = 'Confirm', tone = 'primary', children }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant={tone} onClick={() => (onConfirm(), onClose())}>{confirmLabel}</Button></>}>
      {body && <p className="text-sm text-ink-600">{body}</p>}
      {children}
    </Modal>
  )
}

export function Drawer({ open, onClose, children, width = 520, label = 'Details' }) {
  useEscape(open, onClose)
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-navy-950/30" onClick={onClose} />
          <motion.aside role="dialog" aria-modal="true" aria-label={label} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.22, ease: 'easeOut' }} className="absolute top-0 right-0 bottom-0 flex w-full flex-col bg-white shadow-pop" style={{ maxWidth: width }}>
            {children}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function Toaster() {
  const toasts = useToasts()
  const icons = { success: [CircleCheck, 'text-success-600'], danger: [CircleX, 'text-danger-600'], warning: [TriangleAlert, 'text-warning-600'], ai: [Sparkles, 'text-ai-600'], default: [Info, 'text-brand-600'] }
  return createPortal(
    <div className="pointer-events-none fixed top-4 right-4 left-4 z-[80] flex flex-col items-center gap-2 sm:left-auto sm:items-end" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const [Ico, c] = icons[t.tone] || icons.default
          return (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.18 }} className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-raised">
              <Ico className={cx('mt-0.5 size-[18px] shrink-0', c)} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink-900">{t.title}</div>
                {t.description && <div className="mt-0.5 text-[13px] text-ink-600">{t.description}</div>}
              </div>
              {t.action && (
                <button className="text-[13px] font-semibold text-brand-600 hover:text-brand-700" onClick={() => (t.action.onClick(), dismissToast(t.id))}>
                  {t.action.label}
                </button>
              )}
              <button aria-label="Dismiss" onClick={() => dismissToast(t.id)} className="text-ink-400 hover:text-ink-700"><X className="size-4" /></button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>,
    document.body,
  )
}

export function Table({ children, className }) {
  return (
    <div className={cx('overflow-x-auto', className)}>
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  )
}
export const th = 'px-4 py-3 text-xs font-semibold tracking-wide text-ink-400 uppercase whitespace-nowrap'
export const td = 'px-4 py-3 align-middle'
