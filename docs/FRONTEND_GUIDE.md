# FairConnect Frontend — Beginner-Friendly Project Guide

This guide explains the current implementation in this repository: how the app starts, how login and registration work, how roles protect dashboards, what each page/component does, how student QR sharing flows into recruiter candidate management, and how admin controls the fair.

> Important: this repository is currently a front-end prototype. The data is seeded in JavaScript and changed in browser storage. It does not yet call a backend API, use a real email service, upload resumes to a server, or call a real AI model. Some screens intentionally simulate those steps for the FYP demo.

## 1. The project in one picture

FairConnect helps a university run a career fair.

- **Students** create a profile, add skills/FYP/resume information, see companies and jobs, scan a stall QR, choose what to share, and follow recruiter activity/interview invitations.
- **Recruiters** manage their company/stall and jobs, view students who share their profile, see the demo match score, move candidates through a pipeline, and schedule interviews.
- **University admins / Career Services** approve company registrations, verify students, set up fairs and stalls, issue or revoke stall QR codes, manage users and university settings, monitor activity, and see reports.
- **Public pages** explain the product and let visitors sign in, register, verify an email in demo mode, or request a password reset in demo mode.

### Main technologies actually used

| Technology | What it does here |
| --- | --- |
| React 19 | Components and interactive pages |
| React Router 8 | URL routes, nested dashboards, redirects, URL parameters |
| Vite | Development server and production build |
| Tailwind CSS 4 | Styling and responsive layout |
| Motion | UI transitions and animated scanning/overlays |
| lucide-react | Icons |
| Recharts | Analytics charts |
| qrcode.react | Renders QR graphics/posters |
| localStorage + sessionStorage | Demo data persistence and per-tab login session |
| BroadcastChannel + storage event | Synchronizes demo data changes across browser tabs |
| Custom store in src/store/store.js | Central state and action methods; this is **not Redux Toolkit** |

The package is configured with Vite scripts: **pnpm dev**, **pnpm build**, **pnpm preview**, and **pnpm format**. The lockfile is pnpm’s lockfile. There is no backend package in this repository.

## 2. Start learning from these files

Read the project in this order:

1. **src/main.jsx** — mounts React into the HTML page and imports the global stylesheet.
2. **src/App.jsx** — gives React Router its RouterProvider.
3. **src/app/router.jsx** — the route map: which URL renders which page and which dashboard shell wraps it.
4. **src/components/shared/Guards.jsx** — the central signed-in/role check.
5. **src/store/store.js** — current session, stored data, and all operations that mutate the demo.
6. **src/data/seed.js** — demo users, students, companies, jobs, fairs, stalls, interviews, notifications, and historical activity.
7. **src/pages/student/common.js**, **src/pages/recruiter/common.js**, and **src/pages/admin/common.js** — helpers that give each dashboard its current data.
8. **src/lib/match.js** — how the prototype calculates a job-match score.
9. Then follow one flow end-to-end: register student → verify → onboarding → scan/share → recruiter candidate → interview.

## 3. How the app starts

- **src/main.jsx** calls ReactDOM.createRoot on the HTML element with id root. It wraps App in React.StrictMode and imports src/index.css.
- **src/App.jsx** returns RouterProvider with the router imported from src/app/router.jsx.
- **src/app/router.jsx** creates a browser router. Root renders ScrollRestoration, the current route’s Outlet, a Toaster, and DemoPanel. Outlet means “render the matched child route here.”
- The public landing page is wrapped in PublicShell. Student, recruiter, and admin route families are wrapped in their own shells.
- The router uses import.meta.env.BASE_URL as its basename, with the trailing slash removed.

**Why nested routes matter:** for a URL such as /student/profile/edit, StudentShell remains around the page and provides the common sidebar/header; the nested route chooses ProfileEdit for the content area. Recruiter and admin routes work in the same way through DashboardShell.

## 4. Roles and route access — the most important concept

### Where is a user’s role stored?

A user record has a role value such as **student**, **recruiter**, or **admin**. The user’s session stores their user ID. When the app needs the signed-in user, it finds that ID in the users array and reads the matching user record. The role is not determined from the URL alone, the email text, or the person’s selected menu.

The demo session uses the key **fairconnect-session** in sessionStorage. That value is the user ID, not the complete user record. The user record itself is found in the application state.

### What does RequireRole do?

**src/components/shared/Guards.jsx** exports RequireRole. It uses useSession() to get the current user and useLocation() to know the requested URL.

The logic is:

1. If there is no signed-in user, navigate to /login?returnTo=... and remember the original path and query string.
2. If there is a user but user.role does not equal the role required by that shell, navigate to /403.
3. If the user has the correct role, render the protected children.

The redirect uses **replace**, which replaces the current history entry instead of leaving the denied page as a new history entry.

### Where is each role checked?

- **StudentShell** wraps its dashboard in RequireRole with role="student".
- **RecruiterShell** wraps its dashboard in RequireRole with role="recruiter".
- **AdminShell** wraps its dashboard in RequireRole with role="admin".
- Child routes render inside those shells, so a non-student cannot normally open a nested student page, for example, because the parent StudentShell rejects them before rendering its Outlet.
- Public routes such as the landing page, login, register pages, QR consent URL, and gate check-in URL are not all protected by a dashboard shell. Their own page/store logic determines the permitted action.

### How does login decide where to send the user?

**homeFor(user)** in store.js returns:

- no user → /login
- student → /student
- recruiter → /recruiter
- otherwise → /admin

Login.jsx calls actions.login(email, password). On success, it checks whether returnTo is a safe destination: paths beginning with /c/, /fair/, or the correct role’s dashboard prefix are accepted. Otherwise, it uses homeFor(user). That prevents a student who follows a saved recruiter URL from being sent straight into the recruiter dashboard.

The fair QR consent flow has an additional reason for returnTo: a signed-out person can scan a stall QR, sign in, and come back to the same consent URL.

### What about student onboarding?

The student’s shell also checks **student.onboarded**. If it is false, StudentShell redirects to /student/onboarding. While the user is already on that onboarding path, the shell renders the onboarding page. Completing onboarding updates the student record and marks it onboarded; the other student dashboard pages then become reachable.

### Recruiter approval is separate from role

A recruiter can have role="recruiter" and still have a company whose status is pending or rejected. RecruiterShell first checks the role through RequireRole, then checks the linked company. If the company is not approved, it renders the Pending screen instead of the normal recruiter navigation. So there are two different checks:

- **Role:** may this account enter recruiter pages?
- **Company approval:** may this recruiter use the full recruiter workspace?

### Critical security note

These route guards are front-end user experience checks, not real security boundaries. The prototype’s data and role values live in browser-accessible storage and JavaScript. In the real MERN version, the backend must verify the authenticated user and role for every protected API action. Never rely only on RequireRole or a hidden button to protect student data, admin actions, company approval, or interview updates.

## 5. Authentication and registration flows

### Login — src/pages/public/Login.jsx

- Keeps email, password, and error in local React state using useState.
- On form submission, prevents the browser’s default submit and calls actions.login(email, password).
- actions.login finds an email case-insensitively, compares the entered password with the stored demo password, rejects suspended users, and rejects accounts whose emailVerified is explicitly false.
- The error is returned as an object such as { ok: false, code, message } and shown through Callout.
- For an unverified account, the screen links to /verify-email?u=USER_ID.
- It also offers three demo shortcuts for Ayesha Rehman (student), Usman Khalid (recruiter), and Sana Tariq (admin). Their demo password in seeded data is demo1234.
- “Forgot password?” navigates to the demo reset screen.

### Choose role — src/pages/public/ChooseRole.jsx

It offers Student and Recruiter registration. It explicitly tells Career Services staff that admin accounts are invite-only and created by the university. There is no public admin-registration route.

### Student registration — src/pages/public/RegisterStudent.jsx

Form fields: full name, university email, roll number, programme, password, and consent to academic verification.

Front-end validation checks:
- Name is not empty.
- Email includes @ and its domain is in s.university.domains.
- Roll number matches a pattern like BSCS-F21-118.
- Password has at least eight characters.
- Consent checkbox is selected.

Then actions.registerStudent creates a student profile plus a user account whose role is student, links user.studentId to the new student, sets verification to pending, sets onboarded to false, and sets emailVerified to false. It also sends a demo notification to admin. The page navigates to /verify-email?u=USER_ID.

### Recruiter registration — src/pages/public/RegisterRecruiter.jsx

Form fields: company name, industry, city, website, recruiter name/title, work email, and password.

Validation requires the company name, website, recruiter name and title, an email with @, a non-generic email domain (Gmail, Yahoo, Hotmail, and Outlook are rejected), and a password of at least eight characters.

actions.registerRecruiter creates a company with status pending, creates a user with role recruiter and companyId set to that company, adds that company to non-ended/non-archived fairs, and notifies admins. The page then goes to the demo email verification screen. Pending company approval still blocks access to the full recruiter workspace.

### Email verification — src/pages/public/VerifyEmail.jsx

This is a simulation, not real email verification. The “Continue (demo — simulate link click)” button calls actions.verifyEmail(user.id), sets emailVerified to true, sets the browser-tab session to that user, and navigates students to onboarding or other users to their role home. “Resend email” only shows a success toast; it does not send an email.

### Forgot password — src/pages/public/ForgotPassword.jsx

This is also a UI-only prototype. It checks whether the text contains @ and then shows a generic “reset link sent” message. It does not send a real email, create a token, or update the password.

## 6. How the custom store works

The main application store is **src/store/store.js**. Most pages do not own a separate copy of the application’s data; they read from this shared store.

### Two types of state

**A. Persistent demo data**
- localStorage key: **fairconnect-demo-v1**
- The complete data object includes version, university, users, students, companies, jobs, fairs, stalls, slots, interactions, interviews, notifications, checkins, registrar, audit, and metadata.
- At startup, load() reads and parses localStorage. If no compatible version exists, createSeed() creates demo data and saves it.
- This data is shared across routes and saved between reloads in that browser.

**B. Current tab’s session**
- sessionStorage key: **fairconnect-session**
- Stores the signed-in user ID.
- Session is per tab, while the main demo data is shared in localStorage.
- logout clears the session ID.

### How does a change get saved?

Most actions use **commit(mutator, event)**:

1. Clone the current state with structuredClone, so the edit works on a draft.
2. Run the mutator against the draft.
3. Replace the in-memory state with the edited draft.
4. Save the full state to localStorage.
5. Notify subscribers so React pages re-render.
6. Broadcast a change using BroadcastChannel when supported.
7. Notify local event subscribers if an event was attached.

A storage listener and BroadcastChannel listener let another open tab reload changes. Live dashboards can subscribe to domain events and display a toast/flash when changes arrive.

### How do React components subscribe?

- **useStore()** uses React’s useSyncExternalStore to subscribe to the whole data state.
- **useSession()** combines useStore with the session user ID. It returns user and the associated student or company.
- **onStoreEvent(fn)** subscribes to domain-level events such as interactions, check-ins, status changes, QR generation, and fair updates.
- **useToasts()**, toast(), and dismissToast() manage the app’s demo toast notifications.

### Why this is not Redux Toolkit

There is no configureStore, createSlice, dispatch, or Redux Provider in this project. The action methods are plain functions exported from src/store/store.js, and components call them directly, for example actions.toggleBookmark(companyId). If you later adopt Redux Toolkit, that would be a refactor: the current custom store is what runs today.

### Action catalog

| Action | Purpose |
| --- | --- |
| login / loginAs / logout | Start or end the current session; loginAs is used by the demo role switcher |
| registerStudent / registerRecruiter / verifyEmail | Create a demo user and simulate verifying the email |
| updateStudent / toggleBookmark | Update a student’s profile or add/remove saved companies |
| shareProfile / validateShare / createInteraction | Validate the QR sharing flow and create a candidate interaction |
| checkIn / adminCheckIn | Record student gate attendance; adminCheckIn avoids duplicate check-ins |
| setInteractionStatus / bulkStatus / addNote | Move recruiter candidates through statuses, update multiple candidates, or add notes |
| inviteInterview / scheduleInterview / completeInterview | Create interview invitations, reserve a slot, and record completion/notes |
| respondToInvite / proposeTime / declineInvite | Student accepts an offered slot, suggests a different time, or declines |
| addSlot / removeSlot | Manage recruiter interview time slots |
| updateCompany / saveJob / deleteJob | Edit the signed-in recruiter’s company or its job postings |
| requestQrRegeneration | Notify Career Services that the recruiter needs a replacement QR |
| inviteTeammate | Add an invited recruiter account linked to the same company |
| approveCompany / rejectCompany | Career Services company approval/rejection |
| verifyStudent / flagStudent / runRegistrarMatch | Manually or automatically review student academic records against registrar data |
| assignStall / generateQR / revokeQR | Assign a company to a stall and issue or revoke its QR |
| setFairStatus / createFair / updateFair | Manage fair lifecycle and information |
| updateWeights | Save fair-specific matching weights, requiring a total of 100 |
| setUserStatus / updateUniversity | Suspend/reactivate users or update university settings |
| markRead | Mark matching notifications as read |
| resetDemo / simulateScan | Restore seed data or create a simulated stall visitor |

## 7. Data model — what the main records mean

These are front-end JavaScript objects, not database collections yet. They indicate a likely starting point for your backend schema.

- **User:** id, role, name, email, password (demo only), status, and either studentId or companyId. Some users also have title and emailVerified.
- **Student:** id, name, contact/profile fields, rollNo, department, batch, semester, cgpa, skills, FYP object, certifications, links, resume metadata, bio, privacy settings, verification state, bookmarks, onboarded flag, and createdAt.
- **Company:** id, name, industry, city, website, about, status, rejection reason, perks, visual fields, and submission date.
- **Job:** companyId, title, type, skills, minCgpa, eligible departments, description, certifications, capacity, location, status, createdAt.
- **Fair:** id, name, date/time/venue, status, registration dates, policy, weights, companyIds, stall count, and optional historical totals.
- **Stall:** id, fairId, number/zone, companyId, and QR object containing status, code, generatedAt.
- **Interaction:** one student sharing a profile with one company at one fair. It stores studentId, companyId, fairId, best-matched job, score, score breakdown, matched/missing skills, current status, status history, timestamps, notes, and weights used.
- **Interview:** student/company/fair/interaction references, offered slots, chosen slot, status, mode, message, proposed time, notes, and creation time.
- **Slot:** companyId, fairId, time, location, and interviewId if booked.
- **Notification:** recipient key, title/body, link, time, read flag, and kind. Recipient keys include student:ID, company:ID, and admin.
- **Check-in:** fairId, studentId, and timestamp.
- **Registrar record:** roll number, name, CGPA, and department; used by the simulated matching process.
- **Audit entry:** timestamp, actor, action, and target.

### Where seed data comes from

**src/data/seed.js** exports createSeed(). It deterministically builds illustrative companies/jobs/students and some historical interactions. The seeded demo password is demo1234. There are two fairs: a current upcoming fair and a previous ended fair with illustrative totals. Some companies are already approved, and some are pending so the admin/recruiter approval screens have something to demonstrate.

Do not treat seeded people, scores, job matches, analytics totals, or the “GitHub activity preview” as real data.

## 8. Student side — pages, components, and behavior

**StudentShell — src/pages/student/StudentShell.jsx**
- Enforces the student role through RequireRole.
- Provides responsive desktop sidebar and mobile bottom navigation.
- Shows the current fair, signed-in student name/department/roll number, and NotificationBell.
- Redirects users who have not completed onboarding to /student/onboarding.

**StudentHome — src/pages/student/Home.jsx**
- Shows the current fair phase, days until fair or live/ended state, profile readiness and useful next actions.
- Uses useStudent() and suggestionsFor() to get the signed-in student, current fair and suggested companies.
- Links to profile, companies, scanning, check-in/activities, and follow-up areas based on fair state.

**Onboarding — src/pages/student/Onboarding.jsx**
- A multi-step profile setup with academic details, skills, FYP, resume, links, and privacy settings.
- Uses local step/form state while the student completes sections.
- Uses SkillInput for skills and ResumeUploader for the demo resume process.
- Saves the finished profile using actions.updateStudent, including setting onboarded to true.

**ProfilePreview — src/pages/student/ProfilePreview.jsx**
- Renders the student profile preview through StudentProfileView.
- Shows profile completeness and a preview of matching/suggestion information.
- Provides a route to edit the profile and a company selector for preview context.

**ProfileEdit — src/pages/student/ProfileEdit.jsx**
- Edits the existing student profile using a draft object.
- Reuses SkillInput for skills and uses route navigation blocking to help avoid accidentally losing unsaved edits.
- Saves with updateStudent and shows a toast.

**Resume — src/pages/student/Resume.jsx**
- Uses ResumeUploader to add/replace resume metadata and skills.
- Can remove the resume from the student record.
- In this prototype, a resume is represented by file name/date/size metadata; it is not securely uploaded to remote file storage.

**Companies — src/pages/student/Companies.jsx**
- Lists companies and supports search/filter controls such as query, industry, role type, and saved companies.
- Uses toggleBookmark to add/remove a company from the student’s bookmarks.
- Reads stall data when showing company/fair availability.

**CompanyDetail — src/pages/student/CompanyDetail.jsx**
- Shows a selected company and job/role information, including match information.
- Uses scoreStudentForJob and the signed-in student profile to estimate compatibility.
- Provides bookmarking and a path back into the scan/share process.

**FairDetail — src/pages/student/FairDetail.jsx**
- Shows a particular fair’s date, venue, participating companies, and fair information.
- The fair ID comes from the route parameter.
- Has a company search/filter state to help students browse fair participants.

**Suggestions — src/pages/student/Suggestions.jsx**
- Shows companies to consider visiting, ordered by the best available active-job score.
- suggestionsFor() ignores companies that are not approved or have no active jobs.
- Provides bookmark actions and a note that matching is decision support, not a hiring decision.

**Scan — src/pages/student/Scan.jsx**
- Only allows the scan workflow when the current fair is live.
- Shows a scan-frame animation, but the camera preview is explicitly simulated; no real camera QR decoder is connected.
- Alternative methods let the student search/select an active stall or enter the printed code.
- When a stall is chosen, it navigates to /c/COMPANY_ID/FAIR_ID?t=QR_CODE.
- The page says that scanning only opens a consent screen; it does not share anything by itself.

**ShareConsent — src/pages/student/ShareConsent.jsx (public URL /c/:companyId/:fairId)**
- Calls validateShare using the company, fair and optional QR token.
- Displays clear states for invalid/revoked/expired QR, signed-out user, wrong role, fair not live, student not verified, profile hidden for the fair, and duplicate sharing.
- Shows which profile items are shared and which are not. The intended shared profile omits phone number, roll number and activity with other companies; CGPA and links respect the student privacy settings.
- Only the “Share My Profile” button calls actions.shareProfile. On success it creates an interaction and navigates to /student/shared/INTERACTION_ID.
- This is a consent gate: selecting the stall or viewing the QR does not create an interaction until the student confirms.

**Shared — src/pages/student/Shared.jsx**
- Confirms that the profile has been shared with the selected company.
- Shows the interaction’s match score/summary and link to follow its status.

**Activity — src/pages/student/Activity.jsx**
- Lists the student’s interactions/activity for a selected fair and presents recruiter statuses in student-friendly wording.
- Status text is translated by statusLabel(), for example recruiter status “rejected” is shown to a student as “Not progressed”.

**InteractionDetail — src/pages/student/InteractionDetail.jsx**
- Shows details for one student/company interaction, match score/breakdown, status timeline, and notes/status information available to the student.

**Interviews — src/pages/student/Interviews.jsx**
- Shows the student’s interview invitations and scheduled interviews.
- Lets the student select an offered slot, propose another time, or decline an invitation.
- Uses actions.respondToInvite, actions.proposeTime, and actions.declineInvite.

**InterviewPrep — src/pages/student/InterviewPrep.jsx**
- Shows preparation/help content associated with an interview route and its company/job context. It is a front-end guidance screen, not a live AI interview service.

**CheckIn — src/pages/student/CheckIn.jsx (public URL /fair/:fairId/checkin)**
- This is the fair gate QR entry point rather than a nested student-dashboard route.
- Uses the fair ID, current session and actions.checkIn to record a student check-in or show an appropriate status/error state.

**Feedback — src/pages/student/Feedback.jsx**
- Shows post-fair feedback/insight information for a fair and links into relevant follow-up/suggestion content. Inspect its current JSX before assuming it submits to a server; this prototype is local-state driven.

**Notifications — src/pages/student/Notifications.jsx**
- A wrapper around NotificationsList filtered to the current student recipient key.

**Privacy — src/pages/student/Privacy.jsx**
- Edits privacy options, including hiding CGPA/links and hiding the profile from a fair. It updates the current student record.

**Account — src/pages/student/Account.jsx**
- Student account controls, logout, password-related UI/error states, and a delete/confirmation dialog. Password/account changes are demo UI operations until backed by API endpoints.

### Student-only shared helpers

- **src/pages/student/common.js — useStudent():** returns store state, session user, the linked student, and current fair.
- **suggestionsFor(state, student, fair):** finds participating companies, keeps approved companies with active jobs, calculates bestJobMatch, attaches stall info and sorts high-to-low by score.
- **src/components/domain/StudentProfileView.jsx:** shared profile presentation used where a recruiter needs to view a student. It respects privacy flags for CGPA and links, highlights matched skills, and does not render phone or roll number.
- **src/components/domain/SkillInput.jsx:** reusable controlled skill entry/chip UI.
- **src/components/domain/ResumeUploader.jsx:** drag/drop/file selection UI with idle, parsing, parsed and failed stages. It accepts PDF/Word filenames but uses a hard-coded demo list of possible extracted skills and a timeout; it is not a real document parser.

## 9. Recruiter side — pages, components, and behavior

**RecruiterShell — src/pages/recruiter/RecruiterShell.jsx**
- Enforces role="recruiter".
- Calls useRecruiter() to obtain the signed-in user’s company, current fair, own stall, jobs and interactions.
- Shows Pending instead of the workspace if the company is not approved.
- Builds the recruiter navigation and shows a badge for pending candidate interactions.

**Overview — src/pages/recruiter/Overview.jsx**
- Summary dashboard for the current fair/company: visitor/candidate activity, fair timing, match/candidate metrics and next actions.

**StallProfile — src/pages/recruiter/StallProfile.jsx**
- Edits company-facing stall details such as description, industry/perks/skills or other profile fields represented in the company record.
- Uses a draft form and actions.updateCompany.

**StallQR — src/pages/recruiter/StallQR.jsx**
- Displays the current company/fair stall assignment and QR graphic using QRCodeCanvas.
- Builds a share URL through src/lib/qr.js, provides a printable poster-oriented view, and allows the recruiter to request QR regeneration.
- The recruiter does not issue/revoke the official QR; Career Services controls QR generation and revocation.

**Jobs — src/pages/recruiter/Jobs.jsx**
- Lists jobs belonging to the current company, with management actions and delete confirmation.
- Uses saveJob and deleteJob.

**JobEditor — src/pages/recruiter/JobEditor.jsx**
- Creates a new job or edits an existing job based on the route ID.
- Captures role title/type, skills, CGPA/department requirements, description, certifications and related fields.
- Uses SkillInput and actions.saveJob.

**PoolStats — src/pages/recruiter/PoolStats.jsx**
- Shows candidate-pool summaries and how the candidate data relates to jobs/matching and verification.
- Uses the matching helpers and recruiter-scoped data.

**LiveDashboard — src/pages/recruiter/LiveDashboard.jsx**
- Live-oriented view of interactions for this company and the selected/current fair.
- Supports search and candidate filters (role, department, minimum CGPA, skill and skipped/hidden candidates).
- Listens for store events and shows updates/toasts; a periodic tick refreshes relative times.
- Opens CandidatePanel for a specific interaction. It is live within the browser prototype, not a WebSocket/backend service.

**Candidate — src/pages/recruiter/Candidate.jsx**
- Route wrapper for /recruiter/candidates/:interactionId that resolves the interaction and opens CandidatePanel.

**CandidatePanel — src/pages/recruiter/CandidatePanel.jsx**
- Shows the selected student profile using StudentProfileView and match/AI-summary context.
- Lets the recruiter change interaction status, add an internal note, and open interview scheduling.
- Uses setInteractionStatus and addNote; ScheduleModal handles interview actions.

**ScheduleModal — src/pages/recruiter/ScheduleModal.jsx**
- Modal for choosing available slots and setting interview details/mode/message/notes.
- Uses inviteInterview, scheduleInterview and completeInterview depending on the action.

**Interviews — src/pages/recruiter/Interviews.jsx**
- Displays interview scheduling/slot activity for the recruiter’s company.
- Recruiter can add or remove slots; booked slots are preserved by the store rule that removal filters out only unbooked matching slots.

**Pipeline — src/pages/recruiter/Pipeline.jsx**
- Presents candidates grouped/filtered by status, supports multi-select and bulkStatus, and can export rows using downloadCSV.

**Analytics — src/pages/recruiter/Analytics.jsx**
- Uses Recharts plus data from useRecruiter to display the company’s candidate/fair metrics and trends.

**Team — src/pages/recruiter/Team.jsx**
- Invites another team member. The demo action creates a recruiter user linked to the current company with an invited status and a demo password.

**Settings — src/pages/recruiter/Settings.jsx**
- Holds company/user preference controls. These preferences are currently local React state in the page unless specifically connected to a store action; do not assume all preference controls persist to a backend.

**Notifications — src/pages/recruiter/Notifications.jsx**
- Wrapper around NotificationsList filtered to company:COMPANY_ID.

**Pending — src/pages/recruiter/Pending.jsx**
- Shows the recruiter that their company is awaiting review or has been rejected. It includes sign-out and status/reason information.

### Recruiter-only shared helpers

- **src/pages/recruiter/common.js — useRecruiter():** returns store, signed-in user, their associated company, current fair, their stall, jobs filtered by companyId, and interactions filtered by both companyId and fairId. That filtering is an important part of why one company’s candidate list should not include another company’s candidates in the UI.
- **useTick(ms):** sets a timer that updates a small React state value so “time ago” text periodically refreshes. Its effect cleans up the interval on unmount.
- Chart constants and axes styles are shared with admin analytics.

## 10. Admin / Career Services side

**AdminShell — src/pages/admin/AdminShell.jsx**
- Enforces role="admin".
- Builds navigation and badge counts for companies needing review and students needing verification.
- Uses DashboardShell for responsive navigation, current-fair status and notifications.

**Overview — src/pages/admin/Overview.jsx**
- University-level dashboard with fair, student, company, verification and interaction summary numbers and links into work queues.

**Fairs — src/pages/admin/Fairs.jsx**
- Lists fairs and opens fair detail or creation wizard.

**FairWizard — src/pages/admin/FairWizard.jsx**
- Multi-step fair creation form.
- Uses default matching weights and validates the sum before creating a fair.
- actions.createFair creates the fair record and allocates its stall slots based on the requested stall count.

**FairDetail — src/pages/admin/FairDetail.jsx**
- Shows the selected fair and its summary/configuration.
- actions.setFairStatus transitions the fair, and when set to live it creates student/company notifications and logs an audit entry.

**Companies — src/pages/admin/Companies.jsx**
- Displays companies by status and provides the approval/rejection workflow.
- Approve calls actions.approveCompany, changes status to approved, clears a rejection reason, sends a notification to that company, and records an audit entry.
- Reject calls actions.rejectCompany, stores the reason and records an audit entry.
- A pending/rejected company’s recruiter workspace remains restricted by RecruiterShell.

**Students — src/pages/admin/Students.jsx**
- Displays student records and verification states. It also has the demo registrar matching flow.
- actions.verifyStudent manually verifies a student and sends a notification.
- actions.flagStudent flags a record with a note and notifies the student.
- actions.runRegistrarMatch compares pending student roll number records against the seeded registrar list, then compares CGPA (tolerance under 0.02) and department to decide verified versus flagged. This is only a simulated local-data matching workflow, not a connection to UOL’s registrar system.

**Stalls — src/pages/admin/Stalls.jsx**
- Admin assigns companies to numbered fair stalls.
- actions.assignStall moves assignments if needed and resets the affected QR to none, so an old code does not silently remain valid for a changed assignment.
- Admin can generate an active QR, revoke it, and review QR regeneration requests.
- actions.generateQR generates a new code and notifies the associated company; actions.revokeQR marks it revoked and notifies the company. The logic is in store.js.

**LiveMonitor — src/pages/admin/LiveMonitor.jsx**
- Fair-wide live monitoring summary for visitors, candidates, check-ins and statuses.

**CheckIn — src/pages/admin/CheckIn.jsx**
- Admin-facing attendance search/lookup and manual gate check-in.
- Uses QR-code rendering for fair check-in links and actions.adminCheckIn to avoid duplicate attendance records.

**Analytics — src/pages/admin/Analytics.jsx**
- University-level analytics and charts, using the shared Recharts styling helpers.

**Reports — src/pages/admin/Reports.jsx**
- Shows report/summary views and exports table data through downloadCSV; print-oriented actions may open the browser print workflow.

**AISettings — src/pages/admin/AISettings.jsx**
- Edits the current fair’s weights for skills, CGPA, FYP relevance and certifications.
- Uses WeightsEditor. The store refuses to save unless the total is exactly 100.

**WeightsEditor — src/pages/admin/WeightsEditor.jsx**
- Shared sliders for the four weights and a total/validation display used while setting matching weights.

**Users — src/pages/admin/Users.jsx**
- Filters users by role/search and lets Career Services suspend or reactivate accounts using setUserStatus.
- Login refuses users whose status is suspended.

**UniversitySettings — src/pages/admin/UniversitySettings.jsx**
- Edits university profile/settings including permitted signup domains.
- Those domains are also read by student registration validation.

**Audit — src/pages/admin/Audit.jsx**
- Search/filter view of the audit log entries generated by admin actions.

**Notifications — src/pages/admin/Notifications.jsx**
- Wrapper around NotificationsList for admin-recipient notifications.

### Admin-only shared helpers

- **src/pages/admin/common.js — useAdmin():** returns store state, signed-in user, and current fair.
- **useFairParam():** reads the fair ID from route params, finds that fair, and returns a missing flag for invalid IDs.
- It re-exports chart styles and CGPA bands from recruiter/common.js.

## 11. How QR sharing, matching, and the recruiter pipeline connect

This is the core project flow to understand.

1. Admin creates a fair or selects the current fair.
2. Admin assigns an approved company to a numbered stall and generates that stall’s QR.
3. Recruiter prints/views the generated QR poster on the recruiter Stall & QR page.
4. Student opens Scan. During the upcoming/ended phase the scan flow is disabled; it works only when fair status is live.
5. In this prototype, the student chooses a stall or enters a QR code. The UI then navigates to /c/COMPANY_ID/FAIR_ID?t=CODE.
6. ShareConsent validates the fair/company relationship, assigned stall, QR state/token, logged-in user, role, live fair state, verification policy, hidden-fair privacy setting, and duplicate interaction.
7. It previews the fields being shared. The student must click Share My Profile.
8. actions.shareProfile validates again and creates an interaction. The store calculates the best job match, saves the score breakdown and status history, and adds a recruiter notification.
9. The recruiter’s useRecruiter() only returns their company’s interactions for the current fair, so the new interaction appears in their Live Dashboard.
10. Recruiter reviews the profile in CandidatePanel, updates the interaction status, adds notes, and/or invites/schedules an interview.
11. Store actions create student notifications and update the interaction/interview state. The student follows it in Activity and Interviews.

### Validation logic in validateShare()

- The fair and company exist, and the company is listed for that fair.
- The stall exists and its QR is not absent.
- Revoked QR and old/mismatched token codes are rejected.
- A user must be signed in and their role must be student.
- The fair must be live.
- If the fair policy requires verification, the student must be verified.
- The student must not have hidden their profile for that fair.
- There must not already be an interaction for the same student + company + fair.
- If every check passes, it returns the objects needed to proceed.

This “validate before display and validate again before writing” structure prevents a stale consent screen from blindly assuming its earlier result is still valid in the demo. On a real backend, the backend must repeat all checks transactionally.

## 12. How matching works — src/lib/match.js

This is a deterministic JavaScript stand-in for a future Python matching service. It does not call an AI API.

Default weights:
- Skills: **40**
- CGPA: **20**
- FYP/project text relevance: **25**
- Certifications: **15**

The total is 100. Every fair can store its own weights, and updateWeights rejects any set whose sum is not exactly 100.

**scoreStudentForJob(student, job, weights)** calculates four sub-scores:

1. **Skills:** matching job skills divided by the unique number of required job skills.
2. **CGPA:** the student CGPA divided by the job’s minimum CGPA, capped at 1. If no minimum CGPA is specified, this part is treated as fully satisfied.
3. **FYP relevance:** tokenizes the student’s FYP title/abstract/stack and the job title/description/skills; it counts overlapping tokens after normalization and removes a list of common stop words.
4. **Certifications:** counts matching required certifications up to a cap. If the job has no required certificates, it gives a small score based on the number the student lists.

Skill normalization maps common alternatives, for example js → javascript, nodejs → node.js, py → python, postgres → postgresql, and rest api → rest.

The weighted result is rounded to a percentage and capped at 99. **bestJobMatch()** runs this against a company’s jobs and returns the highest scoring role. **aiSummary()** produces a text template based on the score, matched skills and missing skills. **completeness()** calculates a profile completion percentage from department/CGPA, skill count, FYP, resume, public links, certifications and bio.

Treat the output as decision support. It is not a validated hiring model; do not use it as the sole basis for real candidate decisions.

## 13. QR and URL helpers

**src/lib/qr.js**
- appBase() combines the current browser origin with the configured Vite base path.
- stallPath(companyId, fairId, code) builds the consent path /c/companyId/fairId and optionally adds ?t=CODE.
- stallUrl() returns the full absolute stall URL for the QR poster.
- checkinUrl(fairId) builds the public fair gate check-in URL.

**qrcode.react** renders the visual QR image; it does not validate the user or manage the interaction. QR code validation happens in validateShare() and the store action.

## 14. Shared layout and UI components

### Shared layout components

- **PublicShell / PublicNav / PublicFooter** — public-site header/navigation/footer; the header switches from “Log in/Get started” to “Open dashboard” when a user is signed in.
- **AuthLayout** — reusable split auth layout with optional information panel.
- **DashboardShell** — shared recruiter/admin desktop sidebar, mobile menu, header, fair status, notification bell, user menu, sign-out, and nested Outlet.
- **NotificationBell** — notification preview/badge used in dashboard headers.
- **NotificationsList** — full notification list shared by student/recruiter/admin notification pages.
- **DemoPanel** — development/demo control panel present at Root on every route. It can switch persona, set the fair phase, simulate a visitor scan, open another tab, and reset demo data.
- **Guards / RequireRole** — session-and-role redirect logic.

### Domain components

- **ResumeUploader** — demo file selection and simulated skill extraction.
- **SkillInput** — input + chips for adding/removing skills.
- **StudentProfileView** — shared read-only student profile presentation; it hides CGPA/links when privacy flags say so and never renders phone/roll number.

### UI component library — src/components/ui/index.jsx

This file is the reusable design system. Pages import from it instead of reinventing common controls.

- **Logo:** branded link/logo.
- **Button / IconButton:** action and icon-only buttons; Button can also render as a route link in this project.
- **Card / CardHeader:** panel containers and their headings.
- **IconTile:** icon inside a styled tile.
- **Badge / StatusPill / MatchPill:** generic labels, interaction-status labels, and match score labels.
- **ScoreRing / ScoreBreakdown:** visual match score and sub-score details.
- **ProgressBar / StatCard:** progress and KPI presentation.
- **Avatar / CompanyLogo:** initial/avatar and company-brand representations.
- **Field / Input / Textarea / Select / Checkbox / Switch / Slider:** form labels, inputs and controls.
- **Chip:** compact label, often for skills.
- **Tabs / SegmentedControl / Stepper:** navigation between views and multi-step flows.
- **Timeline:** ordered status/history presentation.
- **LiveIndicator:** upcoming/live/ended indicator.
- **DecisionSupportNote / PrivacyNote:** explanatory notes that set expectations about AI suggestions and profile-sharing privacy.
- **Callout / EmptyState / Skeleton:** feedback/error panels, no-data views, and loading placeholders.
- **PageHeader:** common page title/subtitle area.
- **Modal / ConfirmDialog / Drawer:** overlays, confirmations, and side panels.
- **Toaster:** displays toast messages triggered via the store.
- **Table / th / td:** shared table styles/helpers.

## 15. Other helper files

- **src/lib/format.js:** status label mapping for student versus recruiter, initials, date/time formatting, relative time, days-until calculation, score tone, unique IDs and the class-name helper cx.
- **src/lib/csv.js:** converts an array of objects to CSV, escapes quotes/commas/newlines, creates a browser download, and revokes the temporary URL.
- **src/lib/match.js:** matching score, best match, summary text, skill normalization, and profile completeness.
- **src/lib/qr.js:** QR share/check-in URL builders.
- **src/pages/student/common.js:** useStudent and suggestionsFor.
- **src/pages/recruiter/common.js:** useRecruiter, useTick, chart colors/axes/tooltip styles, CGPA bands.
- **src/pages/admin/common.js:** useAdmin, useFairParam, and fair status labels/tones.
- **src/index.css:** global design tokens/base styles and project-level CSS, including animation utilities.
- **src/data/seed.js:** demo records and initial state generator.
- **vite.config.js:** Vite and project tooling configuration.
- **jsconfig.json:** editor path aliases such as @ resolving into the source directory.
- **index.html:** root HTML document.
- **AGENTS.md:** repository contributor/agent instructions.
- **plans/** and **.figma/**: project planning/design-support files.
- **package.json / pnpm-lock.yaml:** dependencies and scripts.

## 16. Complete route map

### Public

| URL | Page | Purpose |
| --- | --- | --- |
| / | Landing | Marketing/overview page inside PublicShell |
| /login | Login | Sign in and demo account shortcuts |
| /register | ChooseRole | Choose student or recruiter registration |
| /register/student | RegisterStudent | Student registration |
| /register/recruiter | RegisterRecruiter | Company/recruiter registration |
| /verify-email | VerifyEmail | Simulated email confirmation |
| /forgot-password | ForgotPassword | Simulated password reset request |
| /c/:companyId/:fairId | ShareConsent | QR-based profile-sharing consent |
| /fair/:fairId/checkin | CheckIn | Fair gate check-in |
| /403 | ErrorPage | Forbidden/wrong-role destination |

### Student dashboard (under StudentShell)

| URL | Page |
| --- | --- |
| /student | Home |
| /student/onboarding | Onboarding |
| /student/profile | ProfilePreview |
| /student/profile/edit | ProfileEdit |
| /student/profile/resume | Resume |
| /student/fairs/:fairId | FairDetail |
| /student/companies | Companies |
| /student/companies/:companyId | CompanyDetail |
| /student/suggestions | Suggestions |
| /student/scan | Scan |
| /student/shared/:interactionId | Shared |
| /student/activity | Activity |
| /student/activity/:interactionId | InteractionDetail |
| /student/interviews | Interviews |
| /student/interviews/:id/prep | InterviewPrep |
| /student/notifications | Notifications |
| /student/settings | Account |
| /student/settings/privacy | Privacy |
| /student/feedback/:fairId | Feedback |

### Recruiter dashboard (under RecruiterShell)

| URL | Page |
| --- | --- |
| /recruiter | Overview |
| /recruiter/stall | StallProfile |
| /recruiter/qr | StallQR |
| /recruiter/jobs | Jobs |
| /recruiter/jobs/new | JobEditor for a new job |
| /recruiter/jobs/:id | JobEditor for an existing job |
| /recruiter/pool | PoolStats |
| /recruiter/live | LiveDashboard |
| /recruiter/candidates/:interactionId | Candidate |
| /recruiter/interviews | Interviews |
| /recruiter/pipeline | Pipeline |
| /recruiter/analytics | Analytics |
| /recruiter/team | Team |
| /recruiter/settings | Settings |
| /recruiter/notifications | Notifications |

### Admin dashboard (under AdminShell)

| URL | Page |
| --- | --- |
| /admin | Overview |
| /admin/fairs | Fairs |
| /admin/fairs/new | FairWizard |
| /admin/fairs/:id | FairDetail |
| /admin/fairs/:id/stalls | Stalls |
| /admin/fairs/:id/live | LiveMonitor |
| /admin/fairs/:id/checkin | CheckIn |
| /admin/companies | Companies |
| /admin/students | Students |
| /admin/analytics | Analytics |
| /admin/reports | Reports |
| /admin/settings | UniversitySettings |
| /admin/settings/ai | AISettings |
| /admin/users | Users |
| /admin/audit | Audit |
| /admin/notifications | Notifications |

## 17. Prototype limitations and what to replace for a real FYP deployment

This section matters when turning the frontend into your MERN project.

1. **Authentication:** actions.login compares plaintext passwords kept in the browser demo state. Replace it with backend authentication, password hashing (bcrypt/Argon2 on the server), safe session/JWT handling, and logout/token expiry.
2. **Authorization:** RequireRole is only a client route guard. Every Express endpoint must check the authenticated user’s role and resource ownership. For example, a recruiter can only access their own company’s interactions and a student can only edit their own profile.
3. **Data persistence:** localStorage is not MongoDB. Build API endpoints and Mongoose models for users, student profiles, companies, jobs, fairs, stalls, interactions, interview slots/invitations, notifications, check-ins and audit entries. Replace actions with API calls and loading/error handling.
4. **Email:** implement actual verification and password reset emails with expiring, single-use server-generated tokens. Never trust a client-provided user ID as proof of email ownership.
5. **Resume:** accept files through validated server upload or object storage, set limits and content checks, and store only safe metadata in the database. Do not claim real parsing until a parser/service actually exists.
6. **QR scanner:** connect a browser/mobile camera scanner if live scanning is required. The current scanner’s animation and stall chooser are prototype alternatives, not camera decoding.
7. **AI matching:** move matching to a tested backend service or dedicated Python service if required by the FYP. Validate input, version the scoring algorithm, log its score breakdown, and keep humans responsible for decisions.
8. **Privacy and consent:** enforce privacy settings on the server when constructing responses. Do not send phone, roll number, hidden CGPA, hidden links or another company’s activity to the recruiter in the first place.
9. **Fair and QR state changes:** use server-side transactions so a QR cannot be used after revocation, an interaction cannot be duplicated by simultaneous requests, and an interview slot cannot be booked twice.
10. **Audit and notifications:** generate audit entries server-side for sensitive actions; store notifications in the database and deliver them through polling, server-sent events or sockets if real-time behavior is required.
11. **Demo controls:** remove or development-gate DemoPanel and all demo-only seed/reset/simulate actions before production.
12. **Analytics:** base dashboards/reports on actual persisted records and clearly document metrics/filters. The current seeded historic totals and generated demo records are illustrative.
13. **Testing:** add tests for role redirects, suspended/unverified users, company approval, student onboarding, QR revoked/expired/duplicate/hidden/unverified cases, job scoring, slot conflicts and privacy filtering.

## 18. Useful debugging questions

When a page does not behave as expected, check these in order:

- **Which route matched?** Search the path in src/app/router.jsx.
- **Which shell wraps it?** Check StudentShell, RecruiterShell or AdminShell.
- **Does RequireRole allow this user?** Inspect useSession() and the role on the corresponding user record in seed/store state.
- **Is onboarding completed?** StudentShell redirects when student.onboarded is false.
- **Is the company approved?** RecruiterShell shows Pending while company.status is not approved.
- **What data did the page read?** Look for useStudent(), useRecruiter(), useAdmin(), or useStore().
- **What changes the data?** Search for actions.methodName and inspect the method in src/store/store.js.
- **Why did the page update?** Most store actions call commit(), which saves localStorage and notifies React subscribers.
- **Why does a demo role switch change pages instantly?** DemoPanel calls actions.loginAs(id) and navigates to homeFor(user).
- **Why did a scan not share anything?** The Scan page only opens consent. ShareConsent must pass all validation checks and the user must click Share My Profile.

## 19. A practical walkthrough to learn the role system

Try this sequence in the running app:

1. Open the Demo panel at the bottom of the screen. Switch to Ayesha Rehman. This calls loginAs and stores her user ID in sessionStorage. The route changes to /student.
2. Open /recruiter directly in the address bar. RequireRole sees role student and redirects to /403. Switch to a recruiter using Demo controls to enter recruiter pages.
3. Switch to Bilal Siddiqui, whose linked VentureDive company is pending. The account role passes the recruiter check, but RecruiterShell then renders Pending because the company is not approved.
4. Switch to Sana Tariq (admin), open Companies, and approve a pending company. The company record status changes in localStorage. Switch to that company’s recruiter and the workspace should now be available.
5. Set the fair phase to Live in Demo controls. Student Scan becomes available. Select an active stall, review the consent screen, and click Share My Profile.
6. Switch to that stall’s recruiter. Open Live Dashboard and inspect the interaction, match score, matched/missing skills, status, and interview controls.
7. Schedule or invite an interview. Switch back to the student and inspect Interviews and Activity.
8. Use Reset demo data only when you are comfortable losing your browser’s current demo changes; it rebuilds the seeded object.

The key mental model: **route → shell/guard → session role → store data → action function → persisted state → React re-render**. Once that chain makes sense, the rest of the frontend becomes much easier to follow.
