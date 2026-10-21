import { Slider } from "@/components/ui"
import { cx } from "@/lib/format"

export const WEIGHT_FIELDS = [
  ["skills", "Skills match", "Overlap between student skills and the role"],
  [
    "cgpa",
    "CGPA vs requirement",
    "How the CGPA compares to the minimum (skipped when hidden)",
  ],
  ["fyp", "FYP relevance", "Final-year project stack vs required skills"],
  ["certs", "Certifications", "Matching or preferred certifications"],
]

export const weightTotal = (w) => w.skills + w.cgpa + w.fyp + w.certs

/** Four sliders with a live total that must equal 100. */
export default function WeightsEditor({ value, onChange, disabled }) {
  const total = weightTotal(value)
  return (
    <div className="space-y-5">
      {WEIGHT_FIELDS.map(([k, label, hint]) => (
        <div key={k}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-ink-900">{label}</div>
              <div className="text-xs text-ink-400">{hint}</div>
            </div>
            <span className="w-12 text-right text-lg font-bold text-ink-900 tabular">
              {value[k]}%
            </span>
          </div>
          <Slider
            label={label}
            value={value[k]}
            step={5}
            onChange={(v) => !disabled && onChange({ ...value, [k]: v })}
          />
        </div>
      ))}
      <div
        className={cx(
          "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold",
          total === 100
            ? "bg-success-50 text-success-700"
            : "bg-danger-50 text-danger-700",
        )}
      >
        <span>Total</span>
        <span className="tabular">
          {total}%{" "}
          {total === 100
            ? ""
            : `· ${total > 100 ? "remove" : "add"} ${Math.abs(100 - total)}`}
        </span>
      </div>
    </div>
  )
}
