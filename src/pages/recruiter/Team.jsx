import { useState } from "react"
import { UserPlus, Mail } from "lucide-react"
import {
  PageHeader,
  Card,
  Table,
  th,
  td,
  Avatar,
  Badge,
  Button,
  Modal,
  Field,
  Input,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { useRecruiter } from "./common"

export default function Team() {
  const { s, user, company } = useRecruiter()
  const team = s.users.filter((u) => u.companyId === company.id)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [err, setErr] = useState("")
  const invite = () => {
    if (!name.trim()) return setErr("Enter a name.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setErr("Enter a valid work email.")
    if (s.users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
      return setErr("Someone with this email already has an account.")
    actions.inviteTeammate(name.trim(), email.trim())
    toast({ title: `Invite sent to ${name.trim()}`, tone: "success" })
    setOpen(false)
    setName("")
    setEmail("")
    setErr("")
  }
  return (
    <div>
      <PageHeader
        title="Team"
        description={`Everyone at ${company.name} who can see your stall's candidates and notes.`}
        actions={
          <Button icon={UserPlus} onClick={() => setOpen(true)}>
            Invite teammate
          </Button>
        }
      />
      <Card>
        <Table>
          <thead className="border-b border-line">
            <tr>
              <th className={th}>Member</th>
              <th className={th}>Title</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {team.map((u) => (
              <tr key={u.id}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <div className="min-w-0">
                      <div className="font-semibold text-ink-900">
                        {u.name}{" "}
                        {u.id === user.id && (
                          <span className="text-xs font-medium text-ink-400">
                            (you)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className={`${td} text-ink-700`}>
                  {u.title || "Recruiter"}
                </td>
                <td className={td}>
                  <Badge
                    tone={
                      u.status === "active"
                        ? "success"
                        : u.status === "invited"
                          ? "warning"
                          : "gray"
                    }
                    dot
                  >
                    {u.status === "invited"
                      ? "Invite sent"
                      : u.status === "active"
                        ? "Active"
                        : "Suspended"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite a teammate"
        description="They'll get an email to set a password and join your stall."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button icon={Mail} onClick={invite}>
              Send invite
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full name">
            <Input
              value={name}
              onChange={(e) => (setName(e.target.value), setErr(""))}
            />
          </Field>
          <Field label="Work email" error={err}>
            <Input
              type="email"
              value={email}
              onChange={(e) => (setEmail(e.target.value), setErr(""))}
              placeholder={`name@${company.website || "company.com"}`}
              aria-invalid={!!err}
            />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
