import { useState } from "react"
import { Plus, Save } from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  Field,
  Input,
  Button,
  Chip,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { useAdmin } from "./common"

export default function UniversitySettings() {
  const { s } = useAdmin()
  const [u, setU] = useState(s.university)
  const [domain, setDomain] = useState("")
  const [err, setErr] = useState("")
  const set = (k) => (e) => setU({ ...u, [k]: e.target.value })
  const addDomain = () => {
    const d = domain.trim().toLowerCase().replace(/^@/, "")
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d))
      return setErr("Enter a domain like student.uol.edu.pk")
    if (u.domains.includes(d)) return setErr("Already added.")
    setU({ ...u, domains: [...u.domains, d] })
    setDomain("")
    setErr("")
  }
  const save = () => {
    if (!u.name.trim() || !u.short.trim())
      return toast({
        title: "Name and short name are required",
        tone: "warning",
      })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.contactEmail))
      return toast({ title: "Enter a valid contact email", tone: "warning" })
    if (!u.domains.length)
      return toast({
        title: "Add at least one student email domain",
        tone: "warning",
      })
    actions.updateUniversity(u)
    toast({ title: "Settings saved", tone: "success", duration: 2500 })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="University settings"
        description="Institution profile and who can register as a student."
      />
      <Card>
        <CardHeader title="Profile" />
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <Field label="University name" required>
            <Input value={u.name} onChange={set("name")} />
          </Field>
          <Field label="Short name" required>
            <Input value={u.short} onChange={set("short")} />
          </Field>
          <Field label="Campus" className="sm:col-span-2">
            <Input value={u.campus} onChange={set("campus")} />
          </Field>
          <Field label="Career office">
            <Input value={u.careerOffice} onChange={set("careerOffice")} />
          </Field>
          <Field label="Contact email" required>
            <Input
              type="email"
              value={u.contactEmail}
              onChange={set("contactEmail")}
            />
          </Field>
        </div>
      </Card>
      <Card>
        <CardHeader
          title="Student email domains"
          description="Only addresses on these domains can register as students."
        />
        <div className="space-y-3 p-5">
          <div className="flex flex-wrap gap-2">
            {u.domains.map((d) => (
              <Chip
                key={d}
                onRemove={() =>
                  setU({ ...u, domains: u.domains.filter((x) => x !== d) })
                }
              >
                @{d}
              </Chip>
            ))}
          </div>
          <Field error={err}>
            <div className="flex gap-2">
              <Input
                value={domain}
                onChange={(e) => (setDomain(e.target.value), setErr(""))}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addDomain())
                }
                placeholder="student.uol.edu.pk"
                aria-label="New domain"
              />
              <Button variant="secondary" icon={Plus} onClick={addDomain}>
                Add
              </Button>
            </div>
          </Field>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button icon={Save} onClick={save}>
          Save settings
        </Button>
      </div>
    </div>
  )
}
