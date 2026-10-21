# FairConnect — Product Design & Prototype Plan

**Product:** FairConnect, an AI-powered, QR-driven career fair management and smart talent-matching platform for Pakistani universities (FYP, BSCS).
**Delivery:** A clickable React prototype coded in this Make project (React 19 + Vite 8 + Tailwind v4, currently an empty scaffold). Every screen in the inventory gets built. MVP-critical screens are fully interactive. Optional enhancements get static or simpler states.
**Sources of truth:** The proposal (`final_idea_fyp_Fair_Connect_main.html`) sets functionality. The landing screenshot (`Fair-Connect — Landing Page.png`) sets the visual language.
**Resolved conflicts:**
1. Medium: a coded prototype, not Figma frames.
2. QR direction: keep the landing layout, but rewrite all copy and mockups to the company-stall QR flow. No student personal QR anywhere.
3. Scope: every screen, in two interactivity tiers.
4. Wordmark: "FairConnect", one word, no hyphen.

**Role decision:** There are exactly three roles: Student, Recruiter, Admin. The proposal's Super Admin items split two ways:
- University-scoped items (AI weights, data-sharing policy, university profile and email domains) move to Admin.
- Platform-scoped items (onboarding universities, subscriptions, system health, cross-university analytics, moderation) are out of scope. The prototype runs one university: University of Lahore (UOL).

---

## Deliverable 1 — Product Understanding

**Problem.** Pakistani campus career fairs run on paper CVs, WhatsApp and Google Forms.
- Students repeat the same pitch 10–20 times.
- Recruiters collect 100–300 unranked CVs.
- Admins can't measure outcomes.

**Core physical reality.** The company stall stays put and the student moves around.
- The company displays a stall QR that identifies company + fair only.
- A student scans it, signs in, and explicitly confirms **Share My Profile**.
- The backend takes the student's identity from the session, never from the QR or the request body.
- AI scores the student against the company's active jobs: Skills 40%, CGPA 20%, FYP 25%, Certifications 15%.
- The recruiter's live dashboard ranks only the students who scanned that stall.
- The recruiter decides what happens next: shortlist, skip, invite, interview now, schedule, or add a note.

**Non-negotiable product rules (enforced in UI and mock logic):**
1. QR flow is one-way: student scans company. There is no student QR and no "recruiter scans student" copy anywhere.
2. Scanning means "I'm interested and I share my profile." It never books an interview.
3. Recruiters get no candidate identities or rankings before the fair. Pre-fair they see aggregate pool statistics only.
4. Students can get pre-fair "Companies You May Want to Visit" suggestions, visible only to them.
5. AI is decision support. Every score surface carries the label "Decision support — you decide". AI never changes a status.
6. Recruiters see only students who shared with their company. Rankings are computed among those students only.
7. Student privacy settings apply to what recruiters see. Phone number is always hidden; CGPA can be hidden; visibility can be turned off per fair.
8. Interviews are optional and recruiter-initiated. Double-booking a slot is blocked.

**Success criteria for the prototype (FYP demo):**
- An examiner can run the whole lifecycle end to end: Admin creates a fair → approves a company → assigns a stall and generates its QR → Recruiter posts a job and prints the QR → Admin sets the fair Live → Student scans and shares → Recruiter sees the candidate appear live, ranked → Recruiter shortlists or invites → Student sees the status change → Admin sees analytics update.
- Live updates also work across two browser tabs, e.g. a student tab and a recruiter tab side by side.
- Every inventory screen can be reached, and empty, loading and error states are shown where specified.

**Personas:**
- **Ayesha R.** BSCS final year, UOL, CGPA 3.7. Introverted, strong FYP. Uses her phone at the fair.
- **Usman K.** HR Lead at Arbisoft, at the stall with a laptop and tablet. Handles about 150 visitors a day.
- **Ms. Sana T.** Career Services Officer at UOL. One of two staff running a fair with 60+ companies and 800+ students. Desktop.

---

## Deliverable 2 — Permission Matrix

Legend: ✓ allowed · ○ own records only · — not allowed · ◐ aggregate/anonymised only

| Capability | Student | Recruiter | Admin |
|---|---|---|---|
| Register with university email | ✓ | — (company email) | — (seeded) |
| Register company account (needs approval) | — | ✓ | — |
| Build/edit digital profile, upload resume | ○ | — | — |
| Set privacy controls (CGPA visibility, per-fair visibility) | ○ | — | Sets fair-wide data-sharing policy |
| Browse fairs, companies, job listings | ✓ | ○ own company + public fair info | ✓ |
| See "Companies You May Want to Visit" | ○ | — | — |
| Create/edit job postings | — | ○ | View |
| Configure interview capacity/slots | — | ○ | View |
| Generate stall QR | — | ○ (after approval + stall assigned) | ✓ any company |
| Revoke/regenerate stall QR | — | ○ request | ✓ |
| See pre-fair student pool statistics | — | ◐ | ✓ |
| See any identified student before the student shares | — | — | ✓ (verification only) |
| Scan company QR + Share My Profile | ✓ (verified, fair Live) | — | — |
| Scan event check-in QR | ✓ | ✓ (stall check-in) | Displays/generates it |
| View live candidate feed + AI match scores | — | ○ students who shared with own company | ◐ |
| Open shared student profile | — | ○ | ✓ |
| Shortlist / Skip / Notes | — | ○ | — |
| Invite / Interview now / Schedule interview | — | ○ | — |
| Accept interview slot / propose next | ○ | — | — |
| View recruiter private notes | — | ○ own company only | — |
| Track own interaction status + own match score | ○ | — | — |
| Export shortlist CSV | — | ○ | — |
| Create/configure fairs, set status (upcoming/live/ended/archived) | — | — | ✓ |
| Approve/reject companies | — | — | ✓ |
| Verify student academic data (CSV upload/queue) | — | — | ✓ |
| Assign stalls | — | — | ✓ |
| Configure AI weights (per fair) | — | — | ✓ |
| Live fair monitor, analytics, HEC report export | — | Own stall analytics | ✓ |
| Manage users (suspend/reactivate) | — | Manage own company's recruiters (static) | ✓ |

---

## Deliverable 3 — Sitemap (routes)

```
/                              Landing (P01)
/login                         Sign in (P02)
/register                      Choose role (P03)
/register/student              Student sign-up (P04)
/register/recruiter            Company + recruiter sign-up (P05)
/verify-email                  Check your inbox (P06)
/forgot-password               Reset (P07)
/c/:companyId/:fairId          Stall QR landing → Share My Profile (S11; public preview if signed out)
/fair/:fairId/checkin          Event check-in landing (S19)
/403, *                        Access denied / Not found (P08, P09)

/student                       Home (S02)
  /onboarding                  Profile setup wizard (S01)
  /profile                     Profile preview "as recruiters see it" (S03)
  /profile/edit                Profile editor (S04)
  /profile/resume              Resume upload + parse review (S05)
  /fairs/:fairId               Fair detail (S06)
  /companies                   Company directory (S07)
  /companies/:companyId        Company detail (S08)
  /suggestions                 Companies You May Want to Visit (S09)
  /scan                        QR scanner (S10)
  /shared/:interactionId       Share confirmation (S12)
  /activity                    My interactions (S13)
  /activity/:interactionId     Interaction detail (S14)
  /interviews                  Interviews (S15)
  /notifications               Notifications (S16)
  /settings/privacy            Privacy (S17)
  /settings                    Account (S18)
  /feedback/:fairId            Post-fair skill-gap feedback (S20, static)
  /interviews/:id/prep         Interview prep tips (S21, static)

/recruiter                     Overview (R02) — or Pending approval (R01)
  /stall                       Company profile / digital stall (R03)
  /jobs, /jobs/new, /jobs/:id  Jobs list (R04), Job editor (R05)
  /qr                          Stall QR + poster (R06)
  /pool                        Pre-fair pool stats (R07)
  /live                        Live Candidate Dashboard (R08) + candidate drawer (R09)
  /candidates/:interactionId   Full candidate profile (R09 full page)
  /interviews                  Interviews + slots (R10, R11)
  /pipeline                    Shortlist / post-fair pipeline (R12)
  /analytics                   Stall analytics (R13)
  /team                        Team (R14, static)
  /notifications, /settings    R16, R15

/admin                         Overview (A01)
  /fairs, /fairs/new, /fairs/:id   Fairs list (A02), Fair wizard (A03), Fair detail (A04)
  /companies                   Company approvals (A05)
  /students                    Student verification (A06)
  /fairs/:id/stalls            Stall assignment + QR generation (A07)
  /fairs/:id/live              Live fair monitor (A08)
  /fairs/:id/checkin           Check-in QR + attendance (A09)
  /analytics                   Analytics (A10)
  /reports                     HEC report export (A11)
  /settings/ai                 AI matching weights (A12)
  /users                       User management (A13)
  /settings                    University settings (A14)
  /audit                       Audit log (A15, static)
```

---

## Deliverable 4 — Screen Inventory

Tier: **I** = fully interactive (MVP-critical) · **S** = static or simple state (enhancement)

### Public
| ID | Screen | Tier | Key states |
|---|---|---|---|
| P01 | Landing | I | — |
| P02 | Sign in (+ demo account chips) | I | invalid credentials, unverified email |
| P03 | Choose role (Student / Recruiter; Admin is invite-only note) | I | — |
| P04 | Student sign-up (must be @uol.edu.pk etc.) | I | non-university domain error |
| P05 | Recruiter sign-up (company + HR details) | I | submitted → pending approval |
| P06 | Verify email | S | resend |
| P07 | Forgot password | S | sent |
| P08/P09 | 403 / 404 | S | — |

### Student (mobile-first; responsive to desktop)
| ID | Screen | Tier | Key states |
|---|---|---|---|
| S01 | Onboarding wizard (Academic → Skills → FYP → Resume → Links → Privacy) | I | step validation, skip-for-now |
| S02 | Home: completeness, verification badge, fair countdown/Live banner, top suggestions, recent activity | I | pre-fair, live, post-fair variants; unverified |
| S03 | Profile preview "as recruiters see it" + AI summary | I | hidden CGPA shown as hidden |
| S04 | Profile editor (sectioned) | I | unsaved changes |
| S05 | Resume upload + parsed-skills review (simulated parse) | I | uploading, parsed, failed |
| S06 | Fair detail (date, venue, participating companies, stall list) | I | upcoming/live/ended |
| S07 | Company directory (search, industry/role filters, bookmark) | I | empty search |
| S08 | Company detail (about, jobs, stall #, "Visit at Stall 14") | I | — |
| S09 | Companies You May Want to Visit (relevance %, why) | I | incomplete profile prompt |
| S10 | QR Scanner (simulated viewfinder + "Pick a stall" fallback + code entry) | I | fair not live, camera denied |
| S11 | Share My Profile consent (company, fair, stall, exactly what is shared) | I | signed out → sign in; already shared; QR revoked/expired; fair not live; unverified; non-student |
| S12 | Shared confirmation (+ best-match role and score) | I | — |
| S13 | My Interactions (status chips) | I | empty |
| S14 | Interaction detail (status timeline, match breakdown, invite card) | I | each status |
| S15 | Interviews (invites → pick offered slot / propose next; upcoming) | I | slot taken |
| S16 | Notifications | I | empty |
| S17 | Privacy settings | I | — |
| S18 | Account settings | S | — |
| S19 | Event check-in (scan gate QR → checked in) | I | already checked in |
| S20 | Post-fair skill-gap feedback | S | — |
| S21 | Interview prep tips | S | — |

### Recruiter (laptop/tablet-first)
| ID | Screen | Tier | Key states |
|---|---|---|---|
| R01 | Pending approval / rejected | I | pending, rejected (reason) |
| R02 | Overview (fair phase card, checklist: profile → jobs → QR, stats) | I | pre/live/post variants |
| R03 | Company profile / digital stall | I | — |
| R04 | Jobs list | I | empty |
| R05 | Job editor (title, type, skills, min CGPA, departments, description, certs, capacity) | I | validation |
| R06 | Stall QR + print poster preview (logo, stall #, job titles), download PNG / print | I | no stall assigned yet, revoked |
| R07 | Pre-fair pool statistics (aggregate only, explicit "no candidate lists" notice) | I | — |
| R08 | **Live Candidate Dashboard**: live feed + ranked leaderboard, role filter, search/filters, stats panel, skills heatmap | I | pre-fair locked, live, ended; empty "waiting for first scan"; offline banner (S) |
| R09 | Candidate drawer/full profile: AI summary, score breakdown, skills match, FYP, certs, links, actions, private notes | I | CGPA hidden |
| R10 | Schedule interview modal (slot picker, interview now, online follow-up) | I | slot taken |
| R11 | Interviews: slots config + agenda | I | — |
| R12 | Pipeline: shortlisted/invited/scheduled/completed, bulk select, bulk shortlist, export CSV, mass message (S) | I | — |
| R13 | Stall analytics (scans over time, funnel, top skills) | I | — |
| R14 | Team | S | — |
| R15 | Settings | S | — |
| R16 | Notifications | S | — |

### Admin (desktop)
| ID | Screen | Tier | Key states |
|---|---|---|---|
| A01 | Overview (current fair status, KPIs, to-dos: approvals, verifications) | I | — |
| A02 | Fairs list | I | — |
| A03 | Fair wizard (details → registration window → data-sharing policy → AI weights → review) | I | weights must sum to 100 |
| A04 | Fair detail (status control Upcoming/Live/Ended/Archived; companies; tabs) | I | confirm dialogs |
| A05 | Company approvals (queue, detail, approve/reject with reason) | I | empty |
| A06 | Student verification (upload records CSV (simulated), match queue, verify/flag) | I | mismatch |
| A07 | Stall assignment (floor grid + list, assign, generate/revoke QR) | I | conflict |
| A08 | Live fair monitor (live interaction ticker, stall heat grid, counters) | I | not live |
| A09 | Check-in QR + attendance list | I | — |
| A10 | Analytics (funnel, by department, skills demand vs supply, peak times) | I | — |
| A11 | HEC report preview + export | S | — |
| A12 | AI matching settings | I | — |
| A13 | User management | I | — |
| A14 | University settings (email domains, profile) | S | — |
| A15 | Audit log | S | — |

Shared overlays: toasts, confirm dialog, command-style role switcher (Demo panel), notification popover.

---

## Deliverable 5 — User Journey Maps

**Student (Ayesha):**
1. Discover: landing → "I'm a student" → sign up with @uol.edu.pk → verify email.
2. Prepare (days before): onboarding wizard. Uploading her resume auto-fills skills, which she reviews. Completeness reaches 85%. She previews "as recruiters see it" and sets CGPA visibility. Admin verification gives her a green badge.
3. Plan: Home shows "Companies You May Want to Visit" (Systems Limited 91%, Arbisoft 87%, NETSOL 83%). She bookmarks 5 companies and notes their stall numbers.
4. Fair day: she scans the gate check-in, goes to the Arbisoft stall and scans its QR. The consent screen shows exactly what's shared. She taps Share My Profile, gets a confirmation with her best-match role and score, and talks with the recruiter.
5. Follow-up: a notification says "Arbisoft invited you to interview." She picks 11:00 at Stall 14. The Activity page shows her statuses. After the fair she gets feedback and skill-gap info (static).

Emotion arc: anxious about the crowd → relieved there's no paper CV → in control through consent and privacy → informed by status tracking.

**Recruiter (Usman):**
1. Sign up and wait for approval (R01). The Admin approves.
2. Set up the stall profile and post two jobs. The QR page unlocks once a stall is assigned, and he prints the poster. The pool page shows aggregates only.
3. Fair day: the Live dashboard shows "Waiting for first scan." Candidates then slide in at the top of the feed, and the leaderboard re-ranks among visitors. He opens Ayesha's profile (92%, Backend Engineer), reads the AI summary and score breakdown, adds a note, and taps Invite → picks a slot. He skips others.
4. Post-fair: he works through the pipeline, bulk-shortlists, exports CSV, and reviews stall analytics.

**Admin (Ms. Sana):**
1. Create the fair in the wizard, including data-sharing policy and AI weights (40/20/25/15 by default).
2. Approve companies, upload academic records, and resolve verification mismatches.
3. Assign stalls on a grid, then generate the stall QRs and the check-in QR.
4. Fair day: set status to Live. The monitor shows the interaction ticker and stall heat.
5. Set status to Ended and review analytics: funnel, departments, skills demand. Export the HEC report.

**Cross-role fair-day flow (the demo spine):** Admin sets Live → Student S10/S11 → interaction created and scored → Recruiter R08 updates (BroadcastChannel across tabs) → Recruiter action → Student S13/S16 update → Admin A08/A10 counters update.

---

## Deliverable 6 — Design System (derived from the landing screenshot)

**Color tokens** (Tailwind v4 `@theme` in `src/index.css`):
- `navy-950 #0A1630` (announcement bar, dark hero card, CTA band, footer); `navy-900 #0F1F45`; `navy-800 #1E3A6E` (QR tile on dark)
- `brand-600 #2563EB` (primary buttons, accents, "to be discovered."); `brand-700 #1D4ED8` hover; `brand-50 #EEF4FF`; `brand-100 #DBE7FE` (chips)
- `success-600 #16A34A`, `success-50 #E8F8EE` (Profile active, match pills ≥80)
- `warning-600 #D97706`, `warning-50 #FEF6E7` (60–79 match, pending)
- `danger-600 #DC2626`, `danger-50 #FDECEC` (reject, revoked)
- `ai-600 #7C3AED`, `ai-50 #F3EEFF` (AI badges, summaries, "AI" tiles)
- Neutrals: `ink-900 #0F172A` (headings), `ink-600 #475569` (body), `ink-400 #94A3B8` (meta), `line #E5EAF2` (borders), `surface-muted #F4F7FC` (section bands), white cards
- Avatar tints: brand, ai, success, orange `#FFF1E6/#EA580C`
- Match score scale (from the proposal): green ≥80, amber 60–79, gray <60. Always shown with a number, never color alone.

**Typography:** Inter via Google Fonts CSS2 import (400/500/600/700/800). Display 56/60 800 tracking −0.02em; H1 40/44 700; H2 32/38 700; H3 20/28 600; Body 16/24; Small 14/20; Caption 12/16. Eyebrow 12 600 uppercase tracking 0.12em in brand-600 (e.g. "HOW IT WORKS"). Numbers use tabular-nums.

**Shape & elevation:** cards 16px radius with 1px `line` border and very soft shadow (`0 1px 2px rgb(15 23 42 / .04)`); hero mock card 20px radius with stronger shadow and brand top rule (as in screenshot); buttons and inputs 10px; pills fully rounded; spacing on a 4px grid. Container 1200px; section padding 96px desktop / 56px mobile.

**Iconography:** lucide-react, 1.75 stroke. Square tinted icon tiles (40px, 10px radius) with short monograms like "ID", "AI", "QR" kept from the landing style.

**Components (in `src/components/ui`):** Button (primary, secondary-outline, ghost, danger; sm/md/lg), Input, Textarea, Select, Checkbox, Switch, Slider, Tag/Chip (removable), Badge/StatusPill, MatchPill, ScoreRing, ScoreBreakdown bars, Avatar (initials tint), Card, StatCard, Tabs, SegmentedControl, Stepper, Drawer, Modal, ConfirmDialog, Toast, EmptyState, Skeleton, Table, ProgressBar, Timeline, LiveIndicator (pulsing green dot "Live"), QRCode (qrcode.react), DecisionSupportNote, PrivacyNote, AppShell variants, PageHeader, FilterBar.

**Status vocabulary (one mapping used everywhere):**
- pending → "New", neutral
- reviewed → "Reviewed", brand
- shortlisted → "Shortlisted", success
- interview_invited → "Interview invited", ai
- interview_scheduled → "Interview scheduled", ai
- interview_completed → "Interview done", navy
- rejected → shows as "Not progressed" to the student and "Skipped" to the recruiter, gray

**Motion:** 150–200ms ease-out. New live-feed rows slide down and get a 2s brand-50 highlight. Leaderboard re-orders use a layout transition. Respect `prefers-reduced-motion`.

**Accessibility:** WCAG AA contrast, visible focus ring (2px brand-600 offset), 44px touch targets on student mobile, aria-live="polite" on the live feed, color never the only signal.

---

## Deliverable 7 — Low-Fidelity Layout Plan

**Shells:**
- **Public:** navy announcement bar, then a white top nav (logo, How it works, For students, For recruiters, About, Log in, Get started), content, then the navy footer.
- **Student:** on mobile <1024px, a top bar (logo, fair status chip, bell) and a bottom tab bar: Home · Companies · **Scan** (raised center button) · Activity · Profile. On desktop, a 240px left sidebar with the same items and the content centered at max 960px.
- **Recruiter:** a 248px left sidebar (Overview, Live dashboard, Pipeline, Interviews, Jobs, Stall & QR, Pool stats, Analytics, Team, Settings) and a top bar with the fair selector, LiveIndicator, bell and avatar. On tablet the sidebar collapses to icons.
- **Admin:** same structure as Recruiter. Sidebar items: Overview, Fairs, Companies, Students, Stalls, Live monitor, Check-in, Analytics, Reports, AI settings, Users, Settings.

**Key layouts:**
- **P01 Landing** (keeps the screenshot's section order):
  - Hero: 2 columns, copy plus the student dashboard mock.
  - 3-up value strip.
  - How it works: 3 cards — One digital profile · Smarter resume matching · **Scan a stall, share your profile**.
  - For students: split section with a mock showing *Scan company QR → Systems Limited · Stall 14 → Share My Profile* instead of "Your profile QR".
  - For recruiters: split section with a candidate overview mock (Live badge, "Students who scanned your stall").
  - Navy CTA band: "A handshake can start with one scan."
  - Footer.
- **S02 Home:** a navy welcome card (completeness bar, verification badge, fair countdown or "Fair is Live — Scan a stall"), then a 2-up stat row (Suggested companies, Shared profiles), the suggestions list, and recent activity.
- **S11 Consent:** company header (logo, name, Stall 14, fair name), a "You are sharing" checklist of fields with privacy state, a "Not shared" list (phone, student ID), a sticky bottom Share My Profile primary button plus Cancel, and the note "Scanning doesn't book an interview."
- **R08 Live dashboard:** stats strip on top (Scans, Shortlisted, Skipped, Invited, Scheduled) and a filter bar (role segmented control, search, CGPA range, department, skill). Below that:
  - Left 60%: the ranked leaderboard table (rank, avatar+name, dept, CGPA, matched job, MatchPill, status, time, quick actions ★ ✕ ⋯).
  - Right 40%: a "Live feed" column of the newest arrivals, plus a skills heatmap card.
  - Clicking a row opens the R09 drawer on the right, 520px wide.
- **R09 Drawer:** header (avatar, name, dept, batch, verified badge, ScoreRing), then the AI summary card (ai tint), score breakdown bars (4 weights), matched vs missing skills, FYP card, certifications, links, private notes, and a sticky action bar: Shortlist · Skip · Invite · Interview now · Schedule.
- **A07 Stalls:** a floor grid of numbered tiles on the left (colored by assigned/unassigned), and on the right the assignment panel with a company select, QR preview, Generate/Revoke buttons.
- **A03 Wizard:** a vertical stepper on the left with the form on the right. The AI weights step has 4 sliders, a live total, and a preview of an example score.

---

## Deliverable 8 — High-Fidelity Screen Plan (priority screens)

Applies the design system throughout. Specific direction:
- **P01:**
  - Copy updates: hero subcopy "Students scan a company's stall QR to share a verified profile; recruiters see a live, AI-assisted shortlist." Value strip as in the screenshot.
  - Card 03 becomes: "Scan a stall, share your profile — Scan the company's QR at its stall and confirm sharing. No paper CV, no repeated pitch."
  - Student checklist last item: "Share your profile by scanning a company's stall QR."
  - Recruiter bullet 3: "Live stall feed — Students who scan your stall QR appear instantly, ranked by match."
  - Keep "Illustrative candidates and scores — not real hiring data."
  - CTAs route to /register/student and /register/recruiter.
- **S10 Scanner:** full-bleed dark viewfinder with a rounded scan frame, an animated scanline, and the text "Point at the company's stall QR." Below: a "Can't scan? Pick the stall" bottom sheet listing live-fair stalls (searchable by company or stall #), plus "Enter code" for typing the code by hand. Choosing a stall plays a short "QR detected" success haptic-style animation and then navigates to S11.
- **S11/S12:** S12 is a success state with a green check, "Profile shared with Arbisoft," the best-match role and score pill, and "What happens next: the recruiter may shortlist or invite you. You'll be notified." Buttons: View activity · Scan another stall.
- **R08:**
  - High-density but calm. The table uses 56px rows, pill scores and tabular numbers.
  - The LiveIndicator pulses in the top bar.
  - Empty state: an illustration-free card with a QR icon tile, "Waiting for your first visitor. Make sure your QR poster is visible at Stall 14," and a link to R06.
  - Pre-fair locked state: "Your live dashboard opens when the fair goes Live. Recruiters don't see candidates before the fair."
- **R06:** an A3 poster preview card in a navy frame with the company logo, "Scan to share your profile with Arbisoft," a large QR, "Stall 14 · UOL Career Fair 2025," and job titles. Actions: Download PNG · Print. The encoded URL is shown in mono.
- **A01/A10:** KPI cards (Students registered 847, Companies 63, QR interactions 4,291, Interviews 312 — proposal figures for the seeded *past* fair). Charts use the brand palette: funnel (Interactions → Shortlisted → Interviewed → Offered), bar chart by department, a skills demand-vs-supply diverging bar, and peak-times area.
- Every AI surface uses the ai tint, a sparkle icon, and the DecisionSupportNote.

---

## Deliverable 9 — Prototype Interaction Map

| From | Trigger | Result |
|---|---|---|
| P01 | I'm a student / I'm a recruiter / Get started / Log in | P04 / P05 / P03 / P02 |
| P02 | Demo chips (Student Ayesha, Recruiter Usman @ Arbisoft, Admin Sana) | Signs in → role home |
| P04 | Submit valid | P06 → "Continue (demo)" → S01 |
| S01 | Finish | S02 (completeness updated) |
| S05 | Upload any PDF (or "Use sample resume") | 1.5s parsing skeleton → parsed skills to confirm → merge into profile |
| S02/S09 | Company card | S08 |
| Tab Scan | tap | S10 (fair not Live → explanatory state with fair start time) |
| S10 | Pick stall / enter code | S11 |
| /c/:companyId/:fairId (direct URL) | signed out | P02 with return-to → S11 |
| S11 | Share My Profile | create interaction (score computed) → broadcast → S12; toast |
| S11 | already shared | "Already shared on 10:42" + View status |
| R08 | new interaction event | row inserted + highlight + feed item + counter +1 |
| R08 | Row click | R09 drawer; status pending → reviewed automatically on open |
| R09 | Shortlist / Skip | status update, toast with Undo (5s), broadcast → student notification |
| R09 | Invite / Schedule | R10 modal → choose slot → status interview_invited / interview_scheduled; slot locked |
| R09 | Interview now | status interview_completed after "Save notes" |
| S15 | Accept slot / Propose next | status interview_scheduled; recruiter notified |
| R12 | Select rows → Bulk shortlist / Export CSV | updates / downloads real CSV file |
| A04 | Set Live / End fair | confirm → fair status broadcast; student Scan and recruiter Live unlock/lock |
| A05 | Approve | recruiter R01 → R02 |
| A07 | Generate QR | stallQR active; R06 unlocks |
| A12 | Change weights | future interactions use new weights; existing keep stored score (note shown) |
| Demo panel (floating, bottom-left, all roles) | Switch role · Set fair phase · Simulate visitor scan · Reset demo data | instant |

---

## Deliverable 10 — Phased Execution Plan (coded, replaces the "Figma" plan)

**Technical approach:**
- **Dependencies:** `react-router` (data router; load the `make/react-router` skill before routing work), `lucide-react`, `recharts`, `qrcode.react`, `motion` (feed/leaderboard transitions). Install with the package manager reported by `figma make detect-package-manager` (pnpm-lock present).
- **No design-system package exists in the repo.** Tokens live in `src/index.css` `@theme`, with `@import` lines first and base styles in `@layer base`.
- **Structure:**
  - `src/app/` (router, guards, shells)
  - `src/components/ui/`
  - `src/components/<domain>/`
  - `src/pages/{public,student,recruiter,admin}/`
  - `src/data/seed.ts`
  - `src/store/` (FairStore context + reducer)
  - `src/lib/{match.ts,qr.ts,csv.ts,broadcast.ts,format.ts}`
- **Mock data (seed):**
  - University of Lahore (domain `uol.edu.pk`).
  - Fairs: "UOL Career Fair 2025" (upcoming at first; the demo sets it Live) plus the ended "UOL Career Fair 2024" for historical analytics.
  - 12 companies: Systems Limited, Arbisoft, NETSOL, 10Pearls, Devsinc, Techlogix, Folio3, Contour Software, Afiniti, Jazz, VentureDive, i2c. Two of them start pending approval.
  - About 20 jobs, about 40 students with varied departments, CGPA, skills, FYPs and privacy settings, and about 120 historical interactions on the 2024 fair.
  - All of it labeled illustrative.
- **Store:**
  - Shape: `users, students, companies, jobs, fairs, stallQRs, interactions, interviews, slots, notifications, checkins, aiWeights`.
  - Persisted to localStorage (`fairconnect-demo-v1`) and synced across tabs through a BroadcastChannel (`fairconnect`), with a storage-event fallback. Reset reseeds.
  - Actions mirror the proposal API:
    - `shareProfile(companyId, fairId)` takes studentId from the session user only. It validates role, verification, fair Live, and an active stallQR, then dedupes, picks the best job, computes the score, creates the interaction and notifies the company.
    - `setInteractionStatus`, `addNote`, `inviteInterview`, `scheduleInterview(slotId)` (rejects taken slots), `respondToInvite`.
    - `approveCompany`, `verifyStudent`, `assignStall`, `generateQR`, `revokeQR`, `setFairStatus`, `updateWeights`, `checkIn`.
- **Matching (`lib/match.ts`, deterministic stand-in for the Python service):**
  - Skills: weighted overlap of normalized skills with synonyms, as a cosine stand-in.
  - CGPA: `min(cgpa/minCGPA, 1)`.
  - FYP: keyword overlap between FYP abstract/stack and the job description.
  - Certs: matching certs out of 3, capped at 1.
  - The weighted total uses the fair's weights and returns a breakdown. When CGPA is hidden, the CGPA component is still computed server-side (by the mock) but displayed as "Hidden by student".
  - The AI summary comes from a template filled with profile and job data and is labeled "AI summary (preview)".
- **Auth:** mock session (`sessionStorage` per tab, so two tabs can be different roles). Guarded routes redirect to P02 with a `returnTo` param, and the wrong role goes to 403.
- **QR:** encodes `${origin}/c/${companyId}/${fairId}`. Scanning is simulated in-app. If the preview URL can be opened on a phone, a real camera scan works too.

**Phases** (finish each, smoke-check it in the running preview, run a build at the end of each phase):
0. **Foundation:** deps, tokens, fonts, UI primitives, shells, router, guards, store and seed, match lib, Demo panel.
1. **Public:** P01 (with the rewritten copy), P02–P09.
2. **Student MVP:** S01–S17 and S19, covering the consent and edge states.
3. **Recruiter MVP:** R01–R13, covering the live dashboard, drawer, interviews and CSV export.
4. **Admin MVP:** A01–A10, A12, A13.
5. **Cross-role integration:** two-tab live sync, notifications, status mirroring, analytics derived from store data, a run of the demo script.
6. **Enhancement statics:** S18, S20, S21, R14–R16, A11, A14, A15, the offline banner, bias-detection insight card (static, A10), GitHub stats card (static, S03).
7. **Polish/QA:** responsive pass (375 / 768 / 1280 / 1440), empty/error states, a11y focus and contrast, reduced motion, copy audit.

**Copy audit (must pass in phase 7):**
- Search the source for "your QR," "personal QR," "profile QR," "scan their QR," "scan a student," and "Fair-Connect." Expect zero hits.
- Every scan CTA must say company or stall.

**Verification:**
- Run `pnpm build` at the end of each phase. The dev server is already running; don't start another.
- Manual demo script (two tabs) on the success-criteria path in Deliverable 1.
- Edge checks:
  - Unverified student blocked at S11.
  - Fair not Live blocked at S10/S11 and R08.
  - Revoked QR error.
  - Duplicate share.
  - Slot double-booking rejected.
  - Weights not summing to 100 blocked.
  - Pending company sees R01.
  - Recruiter can't open an interaction from another company (403).
  - Hidden CGPA never rendered to the recruiter.
  - Phone never rendered to the recruiter.

**Out of scope:** real backend, auth, AI, email or SMS; Super Admin and multi-university; payments; native app; Urdu localisation (English UI, PKR and Pakistan formats where relevant).
