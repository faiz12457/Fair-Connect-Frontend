import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Save } from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  Chip,
  Switch,
  Callout,
} from "@/components/ui"
import SkillInput from "@/components/domain/SkillInput"
import ErrorPage from "@/pages/public/ErrorPage"
import { actions, toast } from "@/store/store"
import { useRecruiter } from "./common"

const DEPTS = ["BSCS", "BSSE", "BSAI", "BSIT", "BSDS"]
const CERTS = [
  "AWS",
  "Azure",
  "Google Data Analytics",
  "Power BI",
  "TensorFlow",
  "DeepLearning.AI",
  "Kubernetes",
  "Oracle",
  "ISTQB",
  "Google UX",
]
const EMPTY = {
  title: "",
  type: "Full-time",
  skills: [],
  minCgpa: "2.5",
  departments: ["BSCS", "BSSE"],
  description: "",
  certifications: [],
  capacity: "2",
  location: "",
  status: "active",
}

export default function JobEditor() {
  const { id } = useParams()
  const { jobs, company } = useRecruiter()
  const navigate = useNavigate()
  const existing = id ? jobs.find((j) => j.id === id) : null
  const [f, setF] = useState(() =>
    existing
      ? {
          ...existing,
          minCgpa: String(existing.minCgpa),
          capacity: String(existing.capacity),
        }
      : { ...EMPTY, location: company.city },
  )
  const [errors, setErrors] = useState({})
  if (id && !existing) return <ErrorPage code={404} />
  const set = (k) => (e) => setF({ ...f, [k]: e?.target ? e.target.value : e })

  const save = () => {
    const e = {}
    const cg = Number(f.minCgpa)
    const cap = Number(f.capacity)
    if (!f.title.trim()) e.title = "Give the role a title."
    if (f.skills.length < 1)
      e.skills = "Add at least one required skill — it drives the match score."
    if (Number.isNaN(cg) || cg < 0 || cg > 4)
      e.minCgpa = "Enter a CGPA between 0.0 and 4.0."
    if (!f.departments.length) e.departments = "Pick at least one department."
    if (f.description.trim().length < 30)
      e.description = "Describe the role in at least 30 characters."
    if (!Number.isInteger(cap) || cap < 1)
      e.capacity = "Capacity must be at least 1."
    setErrors(e)
    if (Object.keys(e).length)
      return toast({ title: "Check the highlighted fields", tone: "warning" })
    actions.saveJob({
      ...f,
      title: f.title.trim(),
      description: f.description.trim(),
      minCgpa: cg,
      capacity: cap,
    })
    toast({
      title: existing ? "Job updated" : "Job posted",
      description: existing ? undefined : "Students can see it now.",
      tone: "success",
    })
    navigate("/recruiter/jobs")
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        back={{ to: "/recruiter/jobs", label: "Jobs" }}
        title={existing ? "Edit job" : "New job"}
        actions={
          <>
            <Button variant="secondary" to="/recruiter/jobs">
              Cancel
            </Button>
            <Button icon={Save} onClick={save}>
              {existing ? "Save changes" : "Post job"}
            </Button>
          </>
        }
      />
      {existing && (
        <Callout tone="brand" className="mb-5">
          Edits apply to new visitors. Scores already computed for existing
          visitors are kept so rankings stay stable.
        </Callout>
      )}
      <div className="space-y-5">
        <Card>
          <CardHeader title="Basics" />
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Field
              label="Job title"
              required
              error={errors.title}
              className="sm:col-span-2"
            >
              <Input
                value={f.title}
                onChange={set("title")}
                placeholder="e.g. Backend Engineer (Python)"
                aria-invalid={!!errors.title}
              />
            </Field>
            <Field label="Type">
              <Select value={f.type} onChange={set("type")}>
                {["Full-time", "Internship", "Part-time", "Trainee"].map(
                  (t) => (
                    <option key={t}>{t}</option>
                  ),
                )}
              </Select>
            </Field>
            <Field label="Location">
              <Input value={f.location} onChange={set("location")} />
            </Field>
            <Field
              label="Description"
              required
              error={errors.description}
              className="sm:col-span-2"
            >
              <Textarea
                value={f.description}
                onChange={set("description")}
                className="min-h-28"
                placeholder="What will the hire work on? Which tools and teams?"
                aria-invalid={!!errors.description}
              />
            </Field>
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Matching criteria"
            description="Used by the AI match score: skills, CGPA, FYP relevance and certifications."
          />
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Field
              label="Required skills"
              required
              error={errors.skills}
              className="sm:col-span-2"
            >
              <SkillInput value={f.skills} onChange={set("skills")} />
            </Field>
            <Field
              label="Minimum CGPA"
              required
              error={errors.minCgpa}
              hint="Students below this get a proportionally lower CGPA factor, not an automatic rejection."
            >
              <Input
                type="number"
                step="0.1"
                min="0"
                max="4"
                value={f.minCgpa}
                onChange={set("minCgpa")}
                aria-invalid={!!errors.minCgpa}
              />
            </Field>
            <Field label="Openings" required error={errors.capacity}>
              <Input
                type="number"
                min="1"
                value={f.capacity}
                onChange={set("capacity")}
                aria-invalid={!!errors.capacity}
              />
            </Field>
            <Field
              label="Eligible departments"
              required
              error={errors.departments}
              className="sm:col-span-2"
            >
              <div className="flex flex-wrap gap-2">
                {DEPTS.map((d) => (
                  <Chip
                    key={d}
                    active={f.departments.includes(d)}
                    onClick={() =>
                      setF({
                        ...f,
                        departments: f.departments.includes(d)
                          ? f.departments.filter((x) => x !== d)
                          : [...f.departments, d],
                      })
                    }
                  >
                    {d}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field
              label="Preferred certifications"
              hint="Optional. Partial name matches count, e.g. “AWS”."
              className="sm:col-span-2"
            >
              <SkillInput
                value={f.certifications}
                onChange={set("certifications")}
                suggestions={CERTS}
                placeholder="Type a certification and press Enter"
              />
            </Field>
          </div>
        </Card>
        <Card className="p-5">
          <Switch
            checked={f.status === "active"}
            onChange={(v) => setF({ ...f, status: v ? "active" : "paused" })}
            label="Active"
            description="Paused roles are hidden from students and excluded from new match scores."
          />
        </Card>
      </div>
    </div>
  )
}
