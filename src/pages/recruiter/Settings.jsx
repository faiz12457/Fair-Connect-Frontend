import { useState } from "react"
import {
  PageHeader,
  Card,
  CardHeader,
  Field,
  Input,
  Switch,
  Button,
  Callout,
} from "@/components/ui"
import { toast } from "@/store/store"
import { useRecruiter } from "./common"

export default function Settings() {
  const { user } = useRecruiter()
  const [prefs, setPrefs] = useState({
    visitor: true,
    interview: true,
    digest: false,
    sound: false,
  })
  const set = (k) => (v) => setPrefs({ ...prefs, [k]: v })
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        description="Your account and notification preferences."
      />
      <div className="space-y-5">
        <Card>
          <CardHeader title="Account" />
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Field label="Name">
              <Input value={user.name} disabled />
            </Field>
            <Field label="Title">
              <Input value={user.title || ""} disabled />
            </Field>
            <Field label="Email" className="sm:col-span-2">
              <Input value={user.email} disabled />
            </Field>
          </div>
          <div className="px-5 pb-5">
            <Callout tone="brand">
              Contact Career Services to change your name or email in this demo.
            </Callout>
          </div>
        </Card>
        <Card>
          <CardHeader title="Notifications" />
          <div className="space-y-5 p-5">
            <Switch
              checked={prefs.visitor}
              onChange={set("visitor")}
              label="New visitor alerts"
              description="Notify me whenever a student shares at our stall."
            />
            <Switch
              checked={prefs.interview}
              onChange={set("interview")}
              label="Interview updates"
              description="Slot picks, proposals and declines."
            />
            <Switch
              checked={prefs.digest}
              onChange={set("digest")}
              label="End-of-day email digest"
              description="A summary of visitors and shortlists after the fair."
            />
            <Switch
              checked={prefs.sound}
              onChange={set("sound")}
              label="Sound on live dashboard"
              description="Play a short chime for new visitors."
            />
          </div>
          <div className="flex justify-end border-t border-line px-5 py-4">
            <Button
              onClick={() =>
                toast({
                  title: "Preferences saved",
                  tone: "success",
                  duration: 2500,
                })
              }
            >
              Save preferences
            </Button>
          </div>
        </Card>
        <Card>
          <CardHeader title="Password" />
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Field label="New password">
              <Input type="password" placeholder="At least 8 characters" />
            </Field>
            <Field label="Confirm password">
              <Input type="password" />
            </Field>
          </div>
          <div className="flex justify-end border-t border-line px-5 py-4">
            <Button
              variant="secondary"
              onClick={() =>
                toast({
                  title: "Password updated",
                  tone: "success",
                  duration: 2500,
                })
              }
            >
              Update password
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
