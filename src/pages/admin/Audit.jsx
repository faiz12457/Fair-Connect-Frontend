import { useState } from "react"
import { Search, ScrollText } from "lucide-react"
import {
  PageHeader,
  Card,
  Table,
  th,
  td,
  Input,
  EmptyState,
} from "@/components/ui"
import { fmtDateTime, cx } from "@/lib/format"
import { useAdmin } from "./common"

export default function Audit() {
  const { s } = useAdmin()
  const [q, setQ] = useState("")
  const rows = s.audit.filter(
    (a) =>
      !q ||
      `${a.actor} ${a.action} ${a.target}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  )
  return (
    <div>
      <PageHeader
        title="Audit log"
        description="Every administrative change, newest first."
      />
      <Card>
        <div className="p-4">
          <Input
            icon={Search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search actions, people or targets"
            aria-label="Search audit log"
          />
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={ScrollText} title="No matching entries" />
        ) : (
          <Table>
            <thead className="border-y border-line">
              <tr>
                <th className={th}>When</th>
                <th className={th}>Who</th>
                <th className={th}>Action</th>
                <th className={cx(th, "hidden md:table-cell")}>Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((a) => (
                <tr key={a.id}>
                  <td
                    className={cx(td, "whitespace-nowrap text-ink-400 tabular")}
                  >
                    {fmtDateTime(a.at)}
                  </td>
                  <td className={cx(td, "font-semibold text-ink-900")}>
                    {a.actor}
                  </td>
                  <td className={cx(td, "text-ink-700")}>
                    {a.action}
                    <div className="text-xs text-ink-400 md:hidden">
                      {a.target}
                    </div>
                  </td>
                  <td className={cx(td, "hidden text-ink-700 md:table-cell")}>
                    {a.target}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
