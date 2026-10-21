import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { DoorOpen, Search, UserCheck, ExternalLink, Users } from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  Input,
  Avatar,
  StatCard,
  EmptyState,
  LiveIndicator,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { checkinUrl } from "@/lib/qr"
import { fmtTime } from "@/lib/format"
import ErrorPage from "@/pages/public/ErrorPage"
import { useFairParam } from "./common"

export default function CheckIn() {
  const { s, fair, missing } = useFairParam()
  const [q, setQ] = useState("")
  if (missing) return <ErrorPage />
  const list = s.checkins
    .filter((c) => c.fairId === fair.id)
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((c) => ({ c, st: s.students.find((x) => x.id === c.studentId) }))
  const inIds = new Set(list.map((x) => x.st.id))
  const matches =
    q.trim().length >= 2
      ? s.students
          .filter(
            (st) =>
              !inIds.has(st.id) &&
              `${st.name} ${st.rollNo}`.toLowerCase().includes(q.toLowerCase()),
          )
          .slice(0, 6)
      : []
  const closed = fair.status === "ended" || fair.status === "archived"
  const checkIn = (st) => {
    actions.adminCheckIn(fair.id, st.id)
    toast({ title: `${st.name} checked in`, tone: "success", duration: 2000 })
    setQ("")
  }

  return (
    <div className="space-y-5">
      <PageHeader
        back={{ to: `/admin/fairs/${fair.id}`, label: fair.name }}
        title="Gate check-in"
        description="Display this QR at the entrance. Students scan it to record attendance."
        actions={<LiveIndicator status={fair.status} />}
      />
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <Card className="p-6 text-center lg:self-start">
          <div className="mx-auto w-full max-w-[260px] rounded-2xl bg-white p-4 ring-1 ring-line">
            <QRCodeSVG
              value={checkinUrl(fair.id)}
              size={240}
              level="M"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <div className="mt-4 text-sm font-semibold text-ink-900">
            {fair.name}
          </div>
          <div className="text-xs text-ink-400">
            Scan to check in · {fair.venue}
          </div>
          <Button
            variant="secondary"
            icon={ExternalLink}
            className="mt-4 w-full"
            href={checkinUrl(fair.id)}
            target="_blank"
            rel="noreferrer"
          >
            Open check-in page
          </Button>
        </Card>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Checked in"
              value={list.length}
              icon={DoorOpen}
              tone="success"
            />
            <StatCard
              label="Registered"
              value={s.students.length}
              icon={Users}
              hint={`${Math.round((list.length / s.students.length) * 100)}% attendance`}
            />
          </div>
          <Card>
            <CardHeader
              title="Manual check-in"
              description="For students without a phone or with scanning trouble."
            />
            <div className="p-5">
              <Input
                icon={Search}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or roll number"
                aria-label="Search student"
                disabled={closed}
              />
              {closed && (
                <p className="mt-2 text-xs text-ink-400">
                  Check-in is closed for this fair.
                </p>
              )}
              {matches.length > 0 && (
                <ul className="mt-2 divide-y divide-line rounded-xl ring-1 ring-line">
                  {matches.map((st) => (
                    <li
                      key={st.id}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <Avatar name={st.name} tint={st.tint} size="xs" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-ink-900">
                          {st.name}
                        </div>
                        <div className="text-xs text-ink-400">{st.rollNo}</div>
                      </div>
                      <Button
                        size="sm"
                        icon={UserCheck}
                        onClick={() => checkIn(st)}
                      >
                        Check in
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {q.trim().length >= 2 && matches.length === 0 && (
                <p className="mt-2 text-xs text-ink-400">
                  No matching students who are not already checked in.
                </p>
              )}
            </div>
          </Card>
          <Card>
            <CardHeader
              title="Attendance"
              description={`${list.length} students`}
            />
            {list.length === 0 ? (
              <EmptyState icon={DoorOpen} title="No check-ins yet" />
            ) : (
              <ul className="max-h-[420px] divide-y divide-line overflow-y-auto p-2">
                {list.map(({ c, st }) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <Avatar name={st.name} tint={st.tint} size="xs" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-900">
                        {st.name}
                      </div>
                      <div className="text-xs text-ink-400">
                        {st.rollNo} · {st.department}
                      </div>
                    </div>
                    <span className="text-xs text-ink-400 tabular">
                      {fmtTime(c.at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
