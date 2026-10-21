import { useState } from "react"
import { Link } from "react-router"
import {
  Plus,
  Briefcase,
  Pencil,
  Trash2,
  Users,
  GraduationCap,
  Pause,
  Play,
} from "lucide-react"
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Chip,
  EmptyState,
  ConfirmDialog,
  IconButton,
  Callout,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { useRecruiter } from "./common"

export default function Jobs() {
  const { company, jobs, interactions } = useRecruiter()
  const [del, setDel] = useState(null)
  const active = jobs.filter((j) => j.status === "active").length
  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Every visitor is scored against all your active roles; the best fit is shown on the dashboard."
        actions={
          <Button icon={Plus} to="/recruiter/jobs/new">
            New job
          </Button>
        }
      />
      {jobs.length > 0 && active === 0 && (
        <Callout tone="warning" className="mb-4" title="No active roles">
          Visitors will get a 0% score until at least one job is active.
        </Callout>
      )}
      {jobs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="Post your first role"
            body="Students see your roles before the fair, and AI match scores are computed against them."
            action={
              <Button icon={Plus} to="/recruiter/jobs/new">
                New job
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((j) => {
            const visitors = interactions.filter((i) => i.jobId === j.id)
            return (
              <Card key={j.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/recruiter/jobs/${j.id}`}
                      className="font-semibold text-ink-900 hover:text-brand-700"
                    >
                      {j.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge tone={j.type === "Internship" ? "ai" : "brand"}>
                        {j.type}
                      </Badge>
                      <Badge
                        tone={j.status === "active" ? "success" : "gray"}
                        dot
                      >
                        {j.status === "active" ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  </div>
                  <div className="-mr-2 -mt-1 flex">
                    <IconButton
                      size="sm"
                      icon={j.status === "active" ? Pause : Play}
                      label={j.status === "active" ? "Pause" : "Activate"}
                      onClick={() => (
                        actions.saveJob({
                          id: j.id,
                          status: j.status === "active" ? "paused" : "active",
                        }),
                        toast({
                          title:
                            j.status === "active"
                              ? "Job paused"
                              : "Job activated",
                          tone: "success",
                          duration: 2500,
                        })
                      )}
                    />
                    <IconButton
                      size="sm"
                      icon={Trash2}
                      label="Delete"
                      onClick={() => setDel(j)}
                      className="hover:text-danger-600"
                    />
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-ink-600">
                  {j.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {j.skills.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-[13px] text-ink-400">
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="size-4" />
                    Min CGPA {Number(j.minCgpa).toFixed(1)}
                  </span>
                  <span>{j.departments.join(", ")}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-4" />
                    {visitors.length} best-fit visitor
                    {visitors.length === 1 ? "" : "s"}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Pencil}
                    to={`/recruiter/jobs/${j.id}`}
                    className="ml-auto"
                  >
                    Edit
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={() => (
          actions.deleteJob(del.id),
          toast({ title: "Job deleted", tone: "success" })
        )}
        title={`Delete “${del?.title}”?`}
        body={`Students will no longer see this role at ${company.name}. Existing visitor scores are kept.`}
        confirmLabel="Delete job"
        tone="danger"
      />
    </div>
  )
}
