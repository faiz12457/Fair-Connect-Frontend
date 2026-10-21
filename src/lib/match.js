// Deterministic stand-in for the Python matching service.
// Skills 40 / CGPA 20 / FYP 25 / Certifications 15 by default (per-fair weights override).

export const DEFAULT_WEIGHTS = { skills: 40, cgpa: 20, fyp: 25, certs: 15 }

const SYNONYMS = {
  js: 'javascript', 'react.js': 'react', reactjs: 'react', node: 'node.js', nodejs: 'node.js', 'express.js': 'express',
  ts: 'typescript', py: 'python', ml: 'machine learning', 'deep-learning': 'deep learning', postgres: 'postgresql',
  'next.js': 'nextjs', next: 'nextjs', k8s: 'kubernetes', 'c sharp': 'c#', csharp: 'c#', dotnet: '.net', 'asp.net': '.net',
  'react-native': 'react native', tf: 'tensorflow', 'scikit-learn': 'sklearn', ui: 'ui design', ux: 'ux research',
  'rest api': 'rest', 'rest apis': 'rest', aws: 'aws', gcp: 'gcp', 'ci/cd': 'devops', sql: 'sql', mysql: 'sql',
}

export function norm(skill) {
  const s = String(skill).trim().toLowerCase()
  return SYNONYMS[s] ?? s
}

const STOP = new Set('the and for with that this from into using based system your their have will able build design develop strong experience work team about across within platform application students student'.split(' '))

function tokens(text) {
  return new Set(
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9.#+ ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
      .map(norm),
  )
}

export function scoreStudentForJob(student, job, weights = DEFAULT_WEIGHTS) {
  const studentSkills = new Set(student.skills.map(norm))
  const jobSkills = [...new Set(job.skills.map(norm))]
  const matchedSkills = job.skills.filter((s) => studentSkills.has(norm(s)))
  const missingSkills = job.skills.filter((s) => !studentSkills.has(norm(s)))
  const skills = jobSkills.length ? matchedSkills.length / jobSkills.length : 0

  const cgpa = job.minCgpa ? Math.min(student.cgpa / job.minCgpa, 1) : 1

  const fypTokens = tokens(`${student.fyp?.title} ${student.fyp?.abstract} ${(student.fyp?.stack || []).join(' ')}`)
  const jobTokens = tokens(`${job.title} ${job.description} ${job.skills.join(' ')}`)
  let overlap = 0
  jobTokens.forEach((t) => fypTokens.has(t) && overlap++)
  const fyp = student.fyp?.title ? Math.min(1, overlap / Math.max(3, Math.round(jobSkills.length * 0.8))) : 0

  const studentCerts = (student.certifications || []).map((c) => c.toLowerCase())
  let certs
  if (job.certifications?.length) {
    const hits = job.certifications.filter((c) => studentCerts.some((sc) => sc.includes(c.toLowerCase()))).length
    certs = Math.min(1, hits / Math.min(3, job.certifications.length))
  } else {
    certs = Math.min(1, studentCerts.length / 3)
  }

  const breakdown = {
    skills: Math.round(skills * 100),
    cgpa: Math.round(cgpa * 100),
    fyp: Math.round(fyp * 100),
    certs: Math.round(certs * 100),
  }
  const total = Math.round(
    (skills * weights.skills + cgpa * weights.cgpa + fyp * weights.fyp + certs * weights.certs) /
      ((weights.skills + weights.cgpa + weights.fyp + weights.certs) / 100),
  )
  return { score: Math.min(99, total), breakdown, matchedSkills, missingSkills }
}

export function bestJobMatch(student, jobs, weights) {
  let best = null
  for (const job of jobs) {
    const r = scoreStudentForJob(student, job, weights)
    if (!best || r.score > best.score) best = { ...r, jobId: job.id, job }
  }
  return best
}

export function aiSummary(student, job, result) {
  const top = result.matchedSkills.slice(0, 3).join(', ') || 'general programming'
  const gap = result.missingSkills.slice(0, 2).join(' and ')
  const strength =
    result.score >= 80 ? 'a strong fit' : result.score >= 60 ? 'a reasonable fit' : 'a partial fit'
  return `${student.name.split(' ')[0]} is ${strength} for ${job.title}. Hands-on with ${top}${
    student.fyp?.title ? `, and the FYP "${student.fyp.title}" shows applied ${student.fyp.stack?.[0] || 'engineering'} work` : ''
  }.${gap ? ` Consider probing ${gap}, which the profile does not mention.` : ' Covers every listed skill for this role.'}`
}

export function completeness(student) {
  const checks = [
    !!student.department && !!student.cgpa,
    student.skills.length >= 4,
    !!student.fyp?.title,
    !!student.resume,
    !!(student.links?.github || student.links?.linkedin),
    (student.certifications || []).length > 0,
    !!student.bio,
  ]
  const w = [20, 20, 15, 15, 10, 10, 10]
  return checks.reduce((acc, ok, i) => acc + (ok ? w[i] : 0), 0)
}
