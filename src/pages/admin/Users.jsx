import { useState } from "react"
import { Search, UserX, UserCheck } from "lucide-react"
import {
  PageHeader,
  Card,
  Table,
  th,
  td,
  Avatar,
  Badge,
  Button,
  Input,
  SegmentedControl,
  ConfirmDialog,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { cx } from "@/lib/format"
import { useAdmin } from "./common"

const ROLE = {
  student: ["Student", "brand"],
  recruiter: ["Recruiter", "ai"],
  admin: ["Admin", "navy"],
}

export default function Users() {
  const { s, user } = useAdmin()
  const [role, setRole] = useState("all")
  const [q, setQ] = useState("")
  const [confirm, setConfirm] = useState(null)
  const rows = s.users.filter(
    (u) =>
      (role === "all" || u.role === role) &&
      (!q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())),
  )
  const org = (u) =>
    u.role === "recruiter"
      ? s.companies.find((c) => c.id === u.companyId)?.name
      : u.role === "student"
        ? s.students.find((st) => st.id === u.studentId)?.department
        : u.title
  const apply = (u) => {
    const next = u.status === "suspended" ? "active" : "suspended"
    actions.setUserStatus(u.id, next)
    toast({
      title: `${u.name} ${next === "suspended" ? "suspended" : "reactivated"}`,
      tone: next === "suspended" ? "warning" : "success",
    })
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Everyone with a FairConnect account."
      />
      <Card>
        <div className="flex flex-wrap items-center gap-2 p-4">
          <div className="min-w-[200px] flex-1">
            <Input
              icon={Search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or email"
              aria-label="Search users"
            />
          </div>
          <SegmentedControl
            value={role}
            onChange={setRole}
            options={[
              { value: "all", label: "All", count: s.users.length },
              ...Object.entries(ROLE).map(([k, [l]]) => ({
                value: k,
                label: `${l}s`,
                count: s.users.filter((u) => u.role === k).length,
              })),
            ]}
          />
        </div>
        <Table>
          <thead className="border-y border-line">
            <tr>
              <th className={th}>User</th>
              <th className={th}>Role</th>
              <th className={cx(th, "hidden md:table-cell")}>Organisation</th>
              <th className={th}>Status</th>
              <th className={cx(th, "text-right")}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.slice(0, 80).map((u) => (
              <tr key={u.id}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-ink-900">
                        {u.name}
                      </div>
                      <div className="truncate text-xs text-ink-400">
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={td}>
                  <Badge tone={ROLE[u.role][1]}>{ROLE[u.role][0]}</Badge>
                </td>
                <td className={cx(td, "hidden text-ink-700 md:table-cell")}>
                  {org(u) || "—"}
                </td>
                <td className={td}>
                  <Badge
                    tone={
                      u.status === "active"
                        ? "success"
                        : u.status === "invited"
                          ? "warning"
                          : "danger"
                    }
                    dot
                  >
                    {u.status === "active"
                      ? "Active"
                      : u.status === "invited"
                        ? "Invited"
                        : "Suspended"}
                  </Badge>
                </td>
                <td className={cx(td, "text-right")}>
                  {u.id === user.id ? (
                    <span className="text-xs text-ink-400">You</span>
                  ) : u.status === "suspended" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={UserCheck}
                      onClick={() => apply(u)}
                    >
                      Reactivate
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={UserX}
                      onClick={() => setConfirm(u)}
                    >
                      Suspend
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {rows.length > 80 && (
          <div className="border-t border-line px-5 py-3 text-center text-xs text-ink-400">
            Showing 80 of {rows.length}. Search to narrow down.
          </div>
        )}
      </Card>
      {confirm && (
        <ConfirmDialog
          open
          onClose={() => setConfirm(null)}
          onConfirm={() => apply(confirm)}
          title={`Suspend ${confirm.name}?`}
          body="They are signed out and cannot log in until reactivated. Their data is kept."
          confirmLabel="Suspend"
          tone="danger"
        />
      )}
    </div>
  )
}
