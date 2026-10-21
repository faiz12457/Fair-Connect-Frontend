import { useState } from "react"
import { MapPin, Globe, Users, Save, Eye } from "lucide-react"
import {
  PageHeader,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  CompanyLogo,
  Badge,
} from "@/components/ui"
import SkillInput from "@/components/domain/SkillInput"
import { actions, toast } from "@/store/store"
import { cx } from "@/lib/format"
import { useRecruiter } from "./common"

const SWATCHES = [
  "#2563EB",
  "#1D4ED8",
  "#7C3AED",
  "#0F766E",
  "#16A34A",
  "#DB2777",
  "#DC2626",
  "#EA580C",
  "#B45309",
  "#0F1F45",
  "#475569",
]
const PERKS = [
  "Market-competitive stipend",
  "Mentorship programme",
  "Hybrid work",
  "Remote friendly",
  "Health insurance",
  "Learning budget",
  "Free lunch",
  "Transport",
  "Return offer for interns",
]
const SIZES = [
  "1–50",
  "50–200",
  "200–500",
  "500–1,000",
  "1,000–5,000",
  "5,000+",
]

export default function StallProfile() {
  const { company, stall } = useRecruiter()
  const [f, setF] = useState({
    industry: company.industry,
    city: company.city,
    website: company.website,
    size: company.size,
    color: company.color,
    about: company.about,
    perks: company.perks || [],
  })
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setF({ ...f, [k]: e?.target ? e.target.value : e })
  const dirty =
    JSON.stringify(f) !==
    JSON.stringify({
      industry: company.industry,
      city: company.city,
      website: company.website,
      size: company.size,
      color: company.color,
      about: company.about,
      perks: company.perks || [],
    })

  const save = () => {
    const e = {}
    if (!f.industry.trim()) e.industry = "Add your industry."
    if (!f.city.trim()) e.city = "Add a city."
    if (f.about.trim().length < 40)
      e.about = "Write at least 40 characters so students know what you do."
    setErrors(e)
    if (Object.keys(e).length) return
    actions.updateCompany({
      ...f,
      industry: f.industry.trim(),
      city: f.city.trim(),
      website: f.website.trim(),
      about: f.about.trim(),
    })
    toast({
      title: "Stall profile saved",
      description: "Students see the update immediately.",
      tone: "success",
    })
  }

  const preview = { ...company, ...f }
  return (
    <div>
      <PageHeader
        title="Stall profile"
        description="This is what students see when they browse companies before and during the fair."
        actions={
          <Button icon={Save} onClick={save} disabled={!dirty}>
            Save changes
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card className="p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Company name"
              hint="Contact Career Services to change your registered name."
              className="sm:col-span-2"
            >
              <Input value={company.name} disabled />
            </Field>
            <Field label="Industry" required error={errors.industry}>
              <Input
                value={f.industry}
                onChange={set("industry")}
                aria-invalid={!!errors.industry}
              />
            </Field>
            <Field label="Head office city" required error={errors.city}>
              <Input
                value={f.city}
                onChange={set("city")}
                aria-invalid={!!errors.city}
              />
            </Field>
            <Field label="Website">
              <Input
                value={f.website}
                onChange={set("website")}
                placeholder="company.com"
              />
            </Field>
            <Field label="Company size">
              <Select value={f.size} onChange={set("size")}>
                {[...new Set([f.size, ...SIZES])].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </Select>
            </Field>
            <Field
              label="About"
              required
              error={errors.about}
              hint={`${f.about.length} characters`}
              className="sm:col-span-2"
            >
              <Textarea
                value={f.about}
                onChange={set("about")}
                className="min-h-32"
                aria-invalid={!!errors.about}
              />
            </Field>
            <Field label="Perks & benefits" className="sm:col-span-2">
              <SkillInput
                value={f.perks}
                onChange={set("perks")}
                suggestions={PERKS}
                placeholder="Type a perk and press Enter"
              />
            </Field>
            <Field label="Brand colour" className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Colour ${c}`}
                    aria-pressed={f.color.toLowerCase() === c.toLowerCase()}
                    onClick={() => setF({ ...f, color: c })}
                    className={cx(
                      "size-9 rounded-[10px] ring-offset-2 transition",
                      f.color.toLowerCase() === c.toLowerCase()
                        ? "ring-2 ring-ink-900"
                        : "hover:scale-105",
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </Field>
          </div>
        </Card>

        <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">
            <Eye className="size-3.5" /> Student preview
          </div>
          <Card className="overflow-hidden">
            <div className="h-16" style={{ background: preview.color }} />
            <div className="-mt-7 px-5 pb-5">
              <CompanyLogo
                company={preview}
                size="lg"
                className="ring-4 ring-white"
              />
              <div className="mt-3 text-lg font-semibold text-ink-900">
                {company.name}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-ink-400">
                <span>{preview.industry}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {preview.city}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" />
                  {preview.size}
                </span>
                {preview.website && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="size-3.5" />
                    {preview.website}
                  </span>
                )}
              </div>
              <p className="mt-3 line-clamp-5 text-sm text-ink-600">
                {preview.about || "Your description will appear here."}
              </p>
              {preview.perks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {preview.perks.map((p) => (
                    <Badge key={p}>{p}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 bg-navy-950 px-5 py-3 text-white">
              <span className="grid size-9 place-items-center rounded-lg bg-navy-800 text-sm font-bold tabular">
                {stall?.number ?? "—"}
              </span>
              <span className="text-[13px]">
                {stall
                  ? `Visit at Stall ${stall.number}`
                  : "Stall not assigned yet"}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
