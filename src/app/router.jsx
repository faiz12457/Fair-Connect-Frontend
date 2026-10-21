import { createBrowserRouter, Outlet, ScrollRestoration } from "react-router"
import { Toaster } from "@/components/ui"
import DemoPanel from "@/components/shared/DemoPanel"
import PublicShell from "@/components/shared/PublicShell"

import Landing from "@/pages/public/Landing"
import Login from "@/pages/public/Login"
import ChooseRole from "@/pages/public/ChooseRole"
import RegisterStudent from "@/pages/public/RegisterStudent"
import RegisterRecruiter from "@/pages/public/RegisterRecruiter"
import VerifyEmail from "@/pages/public/VerifyEmail"
import ForgotPassword from "@/pages/public/ForgotPassword"
import ErrorPage from "@/pages/public/ErrorPage"

import StudentShell from "@/pages/student/StudentShell"
import StudentHome from "@/pages/student/Home"
import Onboarding from "@/pages/student/Onboarding"
import ProfilePreview from "@/pages/student/ProfilePreview"
import ProfileEdit from "@/pages/student/ProfileEdit"
import Resume from "@/pages/student/Resume"
import Companies from "@/pages/student/Companies"
import CompanyDetail from "@/pages/student/CompanyDetail"
import Suggestions from "@/pages/student/Suggestions"
import Scan from "@/pages/student/Scan"
import ShareConsent from "@/pages/student/ShareConsent"
import Shared from "@/pages/student/Shared"
import Activity from "@/pages/student/Activity"
import InteractionDetail from "@/pages/student/InteractionDetail"
import Interviews from "@/pages/student/Interviews"
import Notifications from "@/pages/student/Notifications"
import Privacy from "@/pages/student/Privacy"
import Account from "@/pages/student/Account"
import CheckIn from "@/pages/student/CheckIn"
import Feedback from "@/pages/student/Feedback"
import StudentFairDetail from "@/pages/student/FairDetail"
import InterviewPrep from "@/pages/student/InterviewPrep"

import RecruiterShell from "@/pages/recruiter/RecruiterShell"
import RecruiterOverview from "@/pages/recruiter/Overview"
import StallProfile from "@/pages/recruiter/StallProfile"
import StallQR from "@/pages/recruiter/StallQR"
import Jobs from "@/pages/recruiter/Jobs"
import JobEditor from "@/pages/recruiter/JobEditor"
import PoolStats from "@/pages/recruiter/PoolStats"
import LiveDashboard from "@/pages/recruiter/LiveDashboard"
import Candidate from "@/pages/recruiter/Candidate"
import RecruiterInterviews from "@/pages/recruiter/Interviews"
import Pipeline from "@/pages/recruiter/Pipeline"
import RecruiterAnalytics from "@/pages/recruiter/Analytics"
import Team from "@/pages/recruiter/Team"
import RecruiterSettings from "@/pages/recruiter/Settings"
import RecruiterNotifications from "@/pages/recruiter/Notifications"

import AdminShell from "@/pages/admin/AdminShell"
import AdminOverview from "@/pages/admin/Overview"
import Fairs from "@/pages/admin/Fairs"
import FairWizard from "@/pages/admin/FairWizard"
import FairDetail from "@/pages/admin/FairDetail"
import AdminCompanies from "@/pages/admin/Companies"
import AdminStudents from "@/pages/admin/Students"
import Stalls from "@/pages/admin/Stalls"
import LiveMonitor from "@/pages/admin/LiveMonitor"
import AdminCheckIn from "@/pages/admin/CheckIn"
import AdminAnalytics from "@/pages/admin/Analytics"
import Reports from "@/pages/admin/Reports"
import AISettings from "@/pages/admin/AISettings"
import Users from "@/pages/admin/Users"
import UniversitySettings from "@/pages/admin/UniversitySettings"
import Audit from "@/pages/admin/Audit"
import AdminNotifications from "@/pages/admin/Notifications"

function Root() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
      <Toaster />
      <DemoPanel />
    </>
  )
}

export const router = createBrowserRouter(
  [
    {
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        {
          element: <PublicShell />,
          children: [{ path: "/", element: <Landing /> }],
        },
        { path: "/login", element: <Login /> },
        { path: "/register", element: <ChooseRole /> },
        { path: "/register/student", element: <RegisterStudent /> },
        { path: "/register/recruiter", element: <RegisterRecruiter /> },
        { path: "/verify-email", element: <VerifyEmail /> },
        { path: "/forgot-password", element: <ForgotPassword /> },
        { path: "/c/:companyId/:fairId", element: <ShareConsent /> },
        { path: "/fair/:fairId/checkin", element: <CheckIn /> },
        { path: "/403", element: <ErrorPage code={403} /> },

        {
          path: "/student",
          element: <StudentShell />,
          children: [
            { index: true, element: <StudentHome /> },
            { path: "onboarding", element: <Onboarding /> },
            { path: "profile", element: <ProfilePreview /> },
            { path: "profile/edit", element: <ProfileEdit /> },
            { path: "profile/resume", element: <Resume /> },
            { path: "fairs/:fairId", element: <StudentFairDetail /> },
            { path: "companies", element: <Companies /> },
            { path: "companies/:companyId", element: <CompanyDetail /> },
            { path: "suggestions", element: <Suggestions /> },
            { path: "scan", element: <Scan /> },
            { path: "shared/:interactionId", element: <Shared /> },
            { path: "activity", element: <Activity /> },
            { path: "activity/:interactionId", element: <InteractionDetail /> },
            { path: "interviews", element: <Interviews /> },
            { path: "interviews/:id/prep", element: <InterviewPrep /> },
            { path: "notifications", element: <Notifications /> },
            { path: "settings", element: <Account /> },
            { path: "settings/privacy", element: <Privacy /> },
            { path: "feedback/:fairId", element: <Feedback /> },
          ],
        },

        {
          path: "/recruiter",
          element: <RecruiterShell />,
          children: [
            { index: true, element: <RecruiterOverview /> },
            { path: "stall", element: <StallProfile /> },
            { path: "qr", element: <StallQR /> },
            { path: "jobs", element: <Jobs /> },
            { path: "jobs/new", element: <JobEditor /> },
            { path: "jobs/:id", element: <JobEditor /> },
            { path: "pool", element: <PoolStats /> },
            { path: "live", element: <LiveDashboard /> },
            { path: "candidates/:interactionId", element: <Candidate /> },
            { path: "interviews", element: <RecruiterInterviews /> },
            { path: "pipeline", element: <Pipeline /> },
            { path: "analytics", element: <RecruiterAnalytics /> },
            { path: "team", element: <Team /> },
            { path: "settings", element: <RecruiterSettings /> },
            { path: "notifications", element: <RecruiterNotifications /> },
            { path: "*", element: <ErrorPage /> },
          ],
        },
        {
          path: "/admin",
          element: <AdminShell />,
          children: [
            { index: true, element: <AdminOverview /> },
            { path: "fairs", element: <Fairs /> },
            { path: "fairs/new", element: <FairWizard /> },
            { path: "fairs/:id", element: <FairDetail /> },
            { path: "fairs/:id/stalls", element: <Stalls /> },
            { path: "fairs/:id/live", element: <LiveMonitor /> },
            { path: "fairs/:id/checkin", element: <AdminCheckIn /> },
            { path: "companies", element: <AdminCompanies /> },
            { path: "students", element: <AdminStudents /> },
            { path: "analytics", element: <AdminAnalytics /> },
            { path: "reports", element: <Reports /> },
            { path: "settings", element: <UniversitySettings /> },
            { path: "settings/ai", element: <AISettings /> },
            { path: "users", element: <Users /> },
            { path: "audit", element: <Audit /> },
            { path: "notifications", element: <AdminNotifications /> },
            { path: "*", element: <ErrorPage /> },
          ],
        },

        { path: "*", element: <ErrorPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
)
