import { useState } from "react"
import { RotateCcw, Save } from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  Select,
  Callout,
  DecisionSupportNote,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { DEFAULT_WEIGHTS } from "@/lib/match"
import { useAdmin } from "./common"
import WeightsEditor, { weightTotal } from "./WeightsEditor"

export default function AISettings() {
  const { s, fair: current } = useAdmin()
  const editable = s.fairs.filter((f) => f.status !== "archived")
  const [fairId, setFairId] = useState(current.id)
  const fair = s.fairs.find((f) => f.id === fairId)
  const [w, setW] = useState(fair.weights)
  const dirty = ["skills", "cgpa", "fyp", "certs"].some(
    (k) => w[k] !== fair.weights[k],
  )
  const switchFair = (id) => (
    setFairId(id), setW(s.fairs.find((f) => f.id === id).weights)
  )
  const save = () => {
    const res = actions.updateWeights(fair.id, w)
    if (!res.ok)
      return toast({
        title: "Cannot save",
        description: res.message,
        tone: "danger",
      })
    toast({
      title: "AI weights saved",
      description: "New scans use these weights. Existing scores are kept.",
      tone: "success",
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="AI match settings"
        description="Choose how much each factor counts toward a student's match score."
        actions={
          <Select
            value={fairId}
            onChange={(e) => switchFair(e.target.value)}
            className="w-auto"
            aria-label="Fair"
          >
            {editable.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
        }
      />
      <Card>
        <CardHeader
          title="Scoring weights"
          description={fair.name}
          actions={
            <Button
              size="sm"
              variant="ghost"
              icon={RotateCcw}
              onClick={() => setW({ ...DEFAULT_WEIGHTS })}
            >
              Defaults
            </Button>
          }
        />
        <div className="p-5">
          <WeightsEditor value={w} onChange={setW} />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
          <span className="text-xs text-ink-400">
            {dirty ? "Unsaved changes" : "Saved"}
          </span>
          <Button
            icon={Save}
            disabled={!dirty || weightTotal(w) !== 100}
            onClick={save}
          >
            Save weights
          </Button>
        </div>
      </Card>
      <Callout tone="warning" title="Existing scores are kept">
        Changing weights only affects profiles shared after you save. Students
        already in a recruiter's list keep the score they were shown.
      </Callout>
      <DecisionSupportNote />
    </div>
  )
}
