import { useParams } from "react-router"
import { PageHeader } from "@/components/ui"
import ErrorPage from "@/pages/public/ErrorPage"
import { useRecruiter } from "./common"
import CandidatePanel from "./CandidatePanel"

export default function Candidate() {
  const { interactionId } = useParams()
  const { s, company } = useRecruiter()
  const ix = s.interactions.find((i) => i.id === interactionId)
  // Recruiters can only open students who shared with their own company.
  if (!ix || ix.companyId !== company.id) return <ErrorPage code={403} />
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        back={{ to: "/recruiter/pipeline", label: "Pipeline" }}
        title="Candidate"
        className="mb-4"
      />
      <CandidatePanel interactionId={ix.id} page />
    </div>
  )
}
