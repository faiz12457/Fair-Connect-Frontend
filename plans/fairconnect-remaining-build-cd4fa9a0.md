# FairConnect — Remaining Build

## Where things stand

**Done and wired in `src/app/router.jsx`:**
- **Foundation:** tokens (`src/index.css`), UI library (`src/components/ui/index.jsx`), seed data, store and libs.
- **Store:** includes every recruiter and admin action already, e.g. `setInteractionStatus`, `inviteInterview`, `saveJob`, `approveCompany`, `assignStall`, `generateQR`, `setFairStatus`, `updateWeights`, `runRegistrarMatch`.
- **Shared pieces:** `DashboardShell`, `DemoPanel`, `Toaster`, `NotificationsList`, `StudentProfileView`, `RequireRole`.
- **Pages:** all public pages (P01–P09) and 19 of 21 student pages.
- **Build:** `pnpm build` exits 0.

**Still placeholders (they render `ComingSoon`):**
- Student: S06 Fair detail, S21 Interview prep.
- Recruiter: everything under `/recruiter` (R01–R16).
- Admin: everything under `/admin` (A01–A15).

So the remaining work is **UI only**. No new store actions or seed data are needed. If a screen turns out to need a small missing selector, add it to `src/store/store.js` and don't add page-local state copies.

---

## Remaining screens (33)

### Student (2)
| ID | Route | File | Content |
|---|---|---|---|
| S06 | `/student/fairs/:fairId` | `pages/student/FairDetail.jsx` | Fair name, date, venue, status (upcoming/live/ended variants). Participating companies plus stall list (stall #, company, link to S08). "Scan a stall" CTA when live. Check-in hint. |
| S21 | `/student/interviews/:id/prep` | `pages/student/InterviewPrep.jsx` | Static tips for the interview's company and role: what to bring, matched/missing skills from the interaction, questions to expect. Link back to S15. |

### Recruiter (16) — `src/pages/recruiter/`
**Layout:** `RecruiterShell.jsx` uses `DashboardShell` with this sidebar order: Overview, Live dashboard, Pipeline, Interviews, Jobs, Stall & QR, Pool stats, Analytics, Team, Settings. It is wrapped in `RequireRole role="recruiter"`. If the company's `status` is `pending` or `rejected`, every route renders R01 instead.

| ID | Route | File | Key behaviour |
|---|---|---|---|
| R01 | (gate) | `Pending.jsx` | Pending vs rejected (with reason). Sign-out. |
| R02 | `/recruiter` | `Overview.jsx` | Fair phase card (pre/live/post). Setup checklist: profile → jobs → QR. Stat cards. |
| R03 | `/recruiter/stall` | `StallProfile.jsx` | Company profile form → `updateCompany`. |
| R04 | `/recruiter/jobs` | `Jobs.jsx` | Job list, empty state, delete → `deleteJob`. |
| R05 | `/recruiter/jobs/new`, `/recruiter/jobs/:id` | `JobEditor.jsx` | Title, type, skills (`SkillInput`), min CGPA, departments, description, certs, capacity. Validation. Saves with `saveJob`. |
| R06 | `/recruiter/qr` | `StallQR.jsx` | Poster preview using `qrcode.react` with `stallUrl()`. Download PNG and Print. States: no stall assigned, revoked (→ `requestQrRegeneration`). |
| R07 | `/recruiter/pool` | `PoolStats.jsx` | Aggregates only (departments, skills, CGPA bands) using recharts. Explicit "no candidate lists" notice. |
| R08 | `/recruiter/live` | `LiveDashboard.jsx` | Stats strip. Filters (role, search, dept, CGPA, skill). Ranked leaderboard of **only this company's interactions on the current fair**. Live feed column with motion highlight and `aria-live`. Skills heatmap. States: pre-fair locked, waiting for first scan, ended. `?open=<id>` opens the drawer. |
| R09 | drawer + `/recruiter/candidates/:interactionId` | `CandidatePanel.jsx`, `Candidate.jsx` | `StudentProfileView`, ScoreRing, `ScoreBreakdown` (CGPA hidden case), AI summary with `DecisionSupportNote`, private notes (`addNote`). Action bar: Shortlist, Skip, Invite, Interview now, Schedule. Opening the drawer moves pending → reviewed. |
| R10 | modal | `ScheduleModal.jsx` | Slot picker (taken slots disabled) → `inviteInterview` / `scheduleInterview`. "Interview now" → `completeInterview`. |
| R11 | `/recruiter/interviews` | `Interviews.jsx` | Slots config (`addSlot` / `removeSlot`) plus agenda of scheduled interviews. |
| R12 | `/recruiter/pipeline` | `Pipeline.jsx` | Tabs by status. Bulk select → `bulkStatus`. Export CSV with `downloadCSV`. |
| R13 | `/recruiter/analytics` | `Analytics.jsx` | Scans over time, funnel, top skills (recharts). |
| R14 | `/recruiter/team` | `Team.jsx` | Teammates list plus invite (`inviteTeammate`). |
| R15 | `/recruiter/settings` | `Settings.jsx` | Simple account and notification prefs (static). |
| R16 | `/recruiter/notifications` | `Notifications.jsx` | `NotificationsList to="company:<id>"`. |

### Admin (15) — `src/pages/admin/`
**Layout:** `AdminShell.jsx` uses `DashboardShell` with this sidebar order: Overview, Fairs, Companies (badge = pending count), Students (badge = pending verifications), Stalls, Live monitor, Check-in, Analytics, Reports, AI settings, Users, Settings, Audit. It is wrapped in `RequireRole role="admin"`. The Stalls, Live monitor and Check-in nav items point at the current fair's sub-routes.

| ID | Route | File | Key behaviour |
|---|---|---|---|
| A01 | `/admin` | `Overview.jsx` | Current fair status card, KPIs, to-dos (approvals, verifications). |
| A02 | `/admin/fairs` | `Fairs.jsx` | Fair list with status pills. |
| A03 | `/admin/fairs/new` | `FairWizard.jsx` | `Stepper` with these steps: details → registration window → sharing policy → AI weights (must total 100) → review. Calls `createFair`. |
| A04 | `/admin/fairs/:id` | `FairDetail.jsx` | Status control Upcoming/Live/Ended/Archived, each with a `ConfirmDialog` → `setFairStatus`. Companies tab plus links to stalls, live and check-in. |
| A05 | `/admin/companies` | `Companies.jsx` | Approval queue plus detail. `approveCompany` / `rejectCompany(reason)`. |
| A06 | `/admin/students` | `Students.jsx` | Simulated CSV upload → `runRegistrarMatch`. Mismatch queue → `verifyStudent` / `flagStudent`. |
| A07 | `/admin/fairs/:id/stalls` | `Stalls.jsx` | Floor grid plus assignment panel → `assignStall` (conflict handling), `generateQR` / `revokeQR`, QR preview. |
| A08 | `/admin/fairs/:id/live` | `LiveMonitor.jsx` | Interaction ticker, stall heat grid, counters. "Not live" state. |
| A09 | `/admin/fairs/:id/checkin` | `CheckIn.jsx` | Gate QR from `checkinUrl()`, attendance list, manual `adminCheckIn`. |
| A10 | `/admin/analytics` | `Analytics.jsx` | Funnel, by department, skills demand vs supply, peak times. Defaults to the 2024 ended fair. |
| A11 | `/admin/reports` | `Reports.jsx` | HEC report preview plus CSV export (static). |
| A12 | `/admin/settings/ai` | `AISettings.jsx` | 4 sliders with a live total → `updateWeights`. Note that existing scores are kept. |
| A13 | `/admin/users` | `Users.jsx` | Table plus `setUserStatus`. |
| A14 | `/admin/settings` | `UniversitySettings.jsx` | Email domains and profile → `updateUniversity`. |
| A15 | `/admin/audit` | `Audit.jsx` | Static log table. |

---

## Build order (recommended)

This order gets the cross-role demo flow working first: Admin sets Live → Student scans and shares → Recruiter sees the student appear live → Recruiter acts → Student is notified.

1. **Shells:** `RecruiterShell` (with the R01 gate) and `AdminShell`, then replace the `ComingSoon` routes in the router with real nested routes.
2. **Live-demo core:** R08 Live dashboard, R09 drawer, R10 schedule modal, R02 Overview, A04 Fair detail (status control), A01 Overview.
3. **Fair setup:** A05 Approvals, A07 Stalls/QR, R06 Stall QR, R04/R05 Jobs, R03 Stall profile, A06 Verification.
4. **Follow-up:** R12 Pipeline (CSV), R11 Interviews, A08 Live monitor, A09 Check-in, S06 Fair detail, S21 Interview prep.
5. **Analytics and setup:** R07, R13, A10, A02, A03 Wizard, A12 AI settings.
6. **Simple screens:** R14, R15, R16, A11, A13, A14, A15.
7. **Cleanup:** delete `pages/public/ComingSoon.jsx` once nothing uses it, then run the Lucide import audit (every icon used must exist in `lucide-react`; check with a node script against the package exports).

## Conventions to keep
- Plain JS/JSX only. Default exports. Use the `@/` alias. Use double quotes for strings containing apostrophes.
- Use only components from `@/components/ui` and the tokens in `index.css`. Use lucide icons at stroke 1.75.
- Read state with `useStore()` / `useSession()` and write only through `actions.*`, so cross-tab sync keeps working.
- Use status labels from `statusLabel(status, 'recruiter')`. The recruiter sees "Skipped" and the student sees "Not progressed".
- Recruiters must never see students who didn't visit their stall. The pool page shows aggregates only.

## Verification
- `pnpm build` exits 0 after each phase.
- **Manual demo in two tabs:**
  1. Admin (Sana) sets the 2025 fair to Live.
  2. Student (Ayesha) scans the Arbisoft stall and shares her profile.
  3. Recruiter (Usman) sees her row appear on R08, then shortlists and invites her.
  4. Ayesha gets the notification and accepts a slot.
  5. The A08 counters update.
- **Edge cases:**
  - Bilal (VentureDive, pending) sees R01.
  - Approving VentureDive in A05 unlocks R02 for Bilal.
  - Revoking a QR in A07 shows the revoked state on R06 and on the student's consent page.
  - Weights that don't total 100 block A03/A12.
  - A taken slot is disabled in R10.
