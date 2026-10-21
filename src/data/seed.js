import { DEFAULT_WEIGHTS, scoreStudentForJob, bestJobMatch } from '@/lib/match'

// All people, companies and scores below are illustrative demo data — not real hiring data.

function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const COMPANIES = [
  ['sys', 'Systems Limited', 'IT Services & Consulting', 'Lahore', '#1D4ED8', '5,000+', 'systemsltd.com'],
  ['arb', 'Arbisoft', 'Software Engineering', 'Lahore', '#7C3AED', '1,000–5,000', 'arbisoft.com'],
  ['netsol', 'NETSOL Technologies', 'FinTech / Leasing Software', 'Lahore', '#0F766E', '1,000–5,000', 'netsoltech.com'],
  ['tenp', '10Pearls', 'Digital Product Development', 'Karachi', '#DB2777', '1,000–5,000', '10pearls.com'],
  ['devsinc', 'Devsinc', 'Software House', 'Lahore', '#EA580C', '1,000–5,000', 'devsinc.com'],
  ['techlogix', 'Techlogix', 'Enterprise Solutions', 'Lahore', '#0369A1', '500–1,000', 'techlogix.com'],
  ['folio3', 'Folio3', 'Software & AgTech', 'Karachi', '#16A34A', '500–1,000', 'folio3.com'],
  ['contour', 'Contour Software', 'Product Engineering', 'Lahore', '#475569', '1,000–5,000', 'contour-software.com'],
  ['afiniti', 'Afiniti', 'AI / Machine Learning', 'Lahore', '#0F1F45', '1,000–5,000', 'afiniti.com'],
  ['jazz', 'Jazz', 'Telecom & Digital', 'Islamabad', '#DC2626', '5,000+', 'jazz.com.pk'],
  ['vd', 'VentureDive', 'Product Studio', 'Karachi', '#9333EA', '500–1,000', 'venturedive.com'],
  ['i2c', 'i2c Inc.', 'Payments Technology', 'Lahore', '#B45309', '1,000–5,000', 'i2cinc.com'],
]

const ABOUT = {
  sys: 'One of Pakistan\u2019s oldest IT companies, delivering digital transformation, cloud and BPO services to clients across the Middle East, Europe and North America.',
  arb: 'A global software engineering company building products for edtech, travel and enterprise clients, known for its strong engineering culture.',
  netsol: 'Builds NFS Ascent, a leasing and finance platform used by global auto-finance companies, from its Lahore Technology Campus.',
  tenp: 'A digital transformation partner designing and building products for startups and Fortune 500 companies.',
  devsinc: 'A fast-growing software house delivering web, mobile and AI solutions to clients in the US and Europe.',
  techlogix: 'Enterprise technology consultancy focused on ERP, data and digital solutions for banking and manufacturing.',
  folio3: 'Software products and services with a focus on agriculture technology, eCommerce and enterprise mobility.',
  contour: 'Product engineering center for global vertical-market software companies.',
  afiniti: 'Applies artificial intelligence to pair customers and contact-center agents for better outcomes.',
  jazz: 'Pakistan\u2019s largest mobile network and a leading digital services provider.',
  vd: 'Technology product studio building fintech, health and on-demand apps.',
  i2c: 'Provides payment and banking technology to issuers across 200+ countries.',
}

const JOBS = [
  ['arb', 'Backend Engineer (Python)', 'Full-time', ['Python', 'Django', 'PostgreSQL', 'REST', 'Docker', 'Git'], 3.0, ['BSCS', 'BSSE'], 'Build scalable REST APIs and data pipelines for edtech products serving millions of learners. Work with Django, PostgreSQL, Redis and queue systems.', ['AWS'], 3],
  ['arb', 'Frontend Developer Intern', 'Internship', ['JavaScript', 'React', 'TypeScript', 'CSS', 'Git'], 2.8, ['BSCS', 'BSSE', 'BSIT'], 'Ship accessible React interfaces with a product team. Component design, state management and testing.', [], 4],
  ['sys', 'Associate Software Engineer (.NET)', 'Full-time', ['C#', '.NET', 'SQL', 'Azure', 'REST'], 2.8, ['BSCS', 'BSSE', 'BSIT'], 'Develop enterprise web services on .NET and Azure for banking and telecom clients.', ['Azure'], 6],
  ['sys', 'Cloud & DevOps Trainee', 'Internship', ['Linux', 'Docker', 'Kubernetes', 'AWS', 'DevOps'], 2.7, ['BSCS', 'BSIT', 'BSSE'], 'Automate deployments, CI pipelines and cloud infrastructure for client workloads.', ['AWS', 'Kubernetes'], 3],
  ['netsol', 'Software Engineer (Java)', 'Full-time', ['Java', 'Spring Boot', 'SQL', 'REST', 'Git'], 3.0, ['BSCS', 'BSSE'], 'Extend the NFS Ascent leasing platform: Spring Boot microservices, Oracle/SQL, and integration APIs.', ['Oracle'], 5],
  ['netsol', 'QA Automation Intern', 'Internship', ['Selenium', 'Java', 'Testing', 'SQL'], 2.5, ['BSCS', 'BSSE', 'BSIT'], 'Write automated regression suites for financial software releases.', ['ISTQB'], 2],
  ['tenp', 'Mobile Developer (React Native)', 'Full-time', ['React Native', 'JavaScript', 'TypeScript', 'Firebase', 'REST'], 2.8, ['BSCS', 'BSSE'], 'Build cross-platform mobile apps for health and fintech clients.', [], 3],
  ['tenp', 'UI/UX Design Intern', 'Internship', ['Figma', 'UI Design', 'UX Research', 'Prototyping'], 2.5, ['BSCS', 'BSSE', 'BSIT'], 'Research, wireframe and prototype product flows with design leads.', ['Google UX'], 2],
  ['devsinc', 'MERN Stack Developer', 'Full-time', ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript'], 2.6, ['BSCS', 'BSSE', 'BSIT'], 'Full-stack JavaScript development for US startups: React frontends, Node.js APIs and MongoDB.', [], 6],
  ['devsinc', 'AI Engineer Intern', 'Internship', ['Python', 'Machine Learning', 'TensorFlow', 'NLP', 'Pandas'], 3.0, ['BSCS', 'BSAI', 'BSDS'], 'Prototype NLP and computer vision features using Python and deep learning frameworks.', ['TensorFlow', 'DeepLearning.AI'], 3],
  ['techlogix', 'Data Analyst', 'Full-time', ['SQL', 'Power BI', 'Python', 'Excel', 'Pandas'], 2.8, ['BSCS', 'BSDS', 'BSIT'], 'Model and visualise banking data; build Power BI dashboards and SQL reports.', ['Google Data Analytics', 'Power BI'], 3],
  ['techlogix', 'ERP Consultant Trainee', 'Internship', ['SQL', 'Business Analysis', 'Communication'], 2.5, ['BSCS', 'BSIT', 'BSSE'], 'Support ERP implementations: requirements, configuration and user training.', [], 2],
  ['folio3', 'Flutter Developer', 'Full-time', ['Flutter', 'Dart', 'Firebase', 'REST'], 2.7, ['BSCS', 'BSSE'], 'Build AgTech and eCommerce mobile apps in Flutter.', [], 3],
  ['folio3', 'Computer Vision Intern', 'Internship', ['Python', 'OpenCV', 'PyTorch', 'Deep Learning'], 3.0, ['BSCS', 'BSAI'], 'Crop and livestock monitoring using deep learning on drone imagery.', [], 2],
  ['contour', 'Software Engineer (C++)', 'Full-time', ['C++', 'Data Structures', 'Algorithms', 'Linux'], 3.1, ['BSCS', 'BSSE'], 'Performance-critical product engineering for vertical-market software.', [], 3],
  ['afiniti', 'Machine Learning Engineer', 'Full-time', ['Python', 'Machine Learning', 'Statistics', 'SQL', 'sklearn'], 3.3, ['BSCS', 'BSAI', 'BSDS'], 'Model customer-agent pairing outcomes; experiment design, statistics and production ML.', ['DeepLearning.AI'], 2],
  ['afiniti', 'Data Engineer Intern', 'Internship', ['Python', 'SQL', 'Spark', 'Airflow'], 3.0, ['BSCS', 'BSDS'], 'Build batch and streaming pipelines feeding ML models.', [], 2],
  ['jazz', 'Graduate Trainee — Digital', 'Full-time', ['SQL', 'Python', 'Communication', 'Business Analysis'], 3.0, ['BSCS', 'BSIT', 'BSDS', 'BSSE'], 'Rotational programme across JazzCash, Tamasha and digital product teams.', [], 8],
  ['vd', 'Full-Stack Engineer', 'Full-time', ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'], 2.8, ['BSCS', 'BSSE'], 'Build fintech and healthtech products end to end.', ['AWS'], 3],
  ['i2c', 'Associate Software Engineer (C/Java)', 'Full-time', ['Java', 'C++', 'SQL', 'Linux', 'Data Structures'], 3.0, ['BSCS', 'BSSE'], 'Payments processing systems: high-throughput services and transaction security.', [], 5],
]

const TRACKS = {
  web: { skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'CSS', 'Git', 'REST', 'Next.js'], fyp: [['ShopSphere — Multi-vendor eCommerce Platform', 'A MERN marketplace with real-time order tracking, vendor dashboards and Stripe-style payments.', ['React', 'Node.js', 'MongoDB']], ['EventHive — Campus Society Management', 'Web platform for societies to manage events, registrations and attendance using React and Express.', ['React', 'Express', 'PostgreSQL']]] },
  backend: { skills: ['Python', 'Django', 'PostgreSQL', 'REST', 'Docker', 'Git', 'Redis', 'Java', 'Spring Boot', 'SQL'], fyp: [['LedgerLite — Microfinance Loan Tracking', 'REST APIs and SQL reporting for microfinance institutions with Spring Boot services.', ['Java', 'Spring Boot', 'SQL']], ['TransitPK — Bus Route Optimiser', 'Django backend with PostgreSQL and graph algorithms to optimise Lahore metro feeder routes.', ['Python', 'Django', 'PostgreSQL']]] },
  data: { skills: ['Python', 'Machine Learning', 'Pandas', 'SQL', 'TensorFlow', 'NLP', 'sklearn', 'Statistics', 'Power BI', 'Deep Learning', 'PyTorch', 'OpenCV'], fyp: [['UrduSent — Sentiment Analysis for Roman Urdu', 'NLP pipeline using transformers and Python to classify Roman Urdu tweets with 87% accuracy.', ['Python', 'TensorFlow', 'NLP']], ['CropGuard — Wheat Disease Detection', 'Deep learning model using PyTorch and OpenCV to detect wheat rust from smartphone images.', ['Python', 'PyTorch', 'OpenCV']]] },
  mobile: { skills: ['Flutter', 'Dart', 'Firebase', 'React Native', 'JavaScript', 'REST', 'Kotlin', 'Git'], fyp: [['RideShare UOL — Campus Carpooling App', 'Flutter app with Firebase auth, live location and REST APIs for students sharing rides.', ['Flutter', 'Firebase', 'Dart']], ['Sehat Card — Health Records Wallet', 'React Native app storing family medical records with offline sync.', ['React Native', 'Firebase']]] },
  devops: { skills: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'DevOps', 'Python', 'Git', 'Terraform'], fyp: [['DeployBot — ChatOps CI/CD', 'Slack-driven deployment pipeline on Kubernetes and AWS with Docker and Terraform.', ['Docker', 'Kubernetes', 'AWS']]] },
  design: { skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'CSS', 'JavaScript'], fyp: [['Rasta — Accessible Navigation for the Visually Impaired', 'UX research and prototyping of a voice-first navigation app, tested with 30 users.', ['Figma', 'UX Research']]] },
  systems: { skills: ['C++', 'Data Structures', 'Algorithms', 'Linux', 'Java', 'SQL', 'C#', '.NET', 'Azure'], fyp: [['FastFS — Distributed File System', 'C++ distributed file system with replication and consistent hashing on Linux.', ['C++', 'Linux']], ['ClinicDesk — Hospital ERP', '.NET and Azure based clinic management system with SQL reporting.', ['C#', '.NET', 'Azure']]] },
}

const CERTS = ['AWS Cloud Practitioner', 'Google Data Analytics', 'Meta Front-End Developer', 'DeepLearning.AI ML Specialization', 'Microsoft Azure Fundamentals', 'Oracle Java SE', 'Google UX Design', 'TensorFlow Developer', 'ISTQB Foundation', 'Power BI Data Analyst', 'CKAD Kubernetes']

const NAMES = ['Hamza Malik', 'Sara Khan', 'Ali Raza', 'Fatima Noor', 'Usama Tariq', 'Zainab Iqbal', 'Bilal Ahmed', 'Hira Shah', 'Ahmed Hassan', 'Maryam Javed', 'Hassan Ali', 'Aiman Butt', 'Saad Qureshi', 'Mahnoor Akhtar', 'Talha Saeed', 'Iqra Aslam', 'Faizan Haider', 'Amna Riaz', 'Umer Farooq', 'Laiba Sheikh', 'Danish Mehmood', 'Rabia Anwar', 'Shahzaib Khan', 'Noor Fatima', 'Abdullah Zafar', 'Kinza Ashraf', 'Hammad Rafiq', 'Areeba Yousaf', 'Moiz Chaudhry', 'Sana Ilyas', 'Waleed Akram', 'Eman Siddiqui', 'Arslan Javaid', 'Mehwish Kamran', 'Taimoor Abbas', 'Huma Nadeem', 'Zeeshan Latif', 'Anum Saleem', 'Rayyan Mirza']
const DEPTS = ['BSCS', 'BSSE', 'BSAI', 'BSIT', 'BSDS']
const TRACK_BY_DEPT = { BSCS: ['web', 'backend', 'systems', 'data', 'mobile'], BSSE: ['web', 'backend', 'mobile', 'design', 'devops'], BSAI: ['data', 'data', 'backend'], BSIT: ['web', 'devops', 'design', 'mobile'], BSDS: ['data', 'data', 'backend'] }
const TINTS = ['brand', 'ai', 'success', 'orange']

function pick(r, arr) {
  return arr[Math.floor(r() * arr.length)]
}
function sample(r, arr, n) {
  const a = [...arr]
  const out = []
  while (out.length < n && a.length) out.push(a.splice(Math.floor(r() * a.length), 1)[0])
  return out
}

const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')

export function createSeed() {
  const r = rng(20251120)
  const now = new Date()
  const year = now.getFullYear()
  const fairDate = new Date(now)
  fairDate.setDate(now.getDate() + 6)
  fairDate.setHours(10, 0, 0, 0)
  const pastDate = new Date(fairDate)
  pastDate.setFullYear(year - 1)

  const university = {
    name: 'University of Lahore',
    short: 'UOL',
    city: 'Lahore',
    campus: 'Main Campus, 1-Km Defence Road',
    domains: ['uol.edu.pk', 'student.uol.edu.pk'],
    careerOffice: 'Office of Career Services & Industry Linkages',
    contactEmail: 'careers@uol.edu.pk',
  }

  const companies = COMPANIES.map(([id, name, industry, city, color, size, website]) => ({
    id,
    name,
    industry,
    city,
    color,
    size,
    website,
    about: ABOUT[id],
    status: id === 'vd' || id === 'contour' ? 'pending' : 'approved',
    rejectReason: '',
    submittedAt: new Date(now.getTime() - (id === 'vd' ? 2 : id === 'contour' ? 1 : 40) * 86400000).toISOString(),
    perks: ['Market-competitive stipend', 'Mentorship programme', 'Hybrid work'],
  }))

  const jobs = JOBS.map(([companyId, title, type, skills, minCgpa, departments, description, certifications, capacity], i) => ({
    id: `job${i + 1}`,
    companyId,
    title,
    type,
    skills,
    minCgpa,
    departments,
    description,
    certifications,
    capacity,
    location: companies.find((c) => c.id === companyId).city,
    status: 'active',
    createdAt: new Date(now.getTime() - (20 - i) * 86400000).toISOString(),
  }))

  // Students
  const ayesha = {
    id: 'st1',
    name: 'Ayesha Rehman',
    email: 'ayesha.rehman@student.uol.edu.pk',
    phone: '+92 300 1234567',
    rollNo: 'BSCS-F21-118',
    department: 'BSCS',
    batch: 'Fall 2021',
    semester: 8,
    cgpa: 3.7,
    skills: ['Python', 'Django', 'React', 'PostgreSQL', 'REST', 'Git', 'Machine Learning', 'Redis'],
    fyp: {
      title: 'MediQueue — Hospital Queue Optimisation',
      abstract: 'A scalable Django and PostgreSQL backend with REST APIs, Redis queues and a React dashboard that predicts OPD wait times for Lahore hospitals.',
      stack: ['Django', 'PostgreSQL', 'Redis', 'React'],
      supervisor: 'Dr. Kashif Javed',
    },
    certifications: ['AWS Cloud Practitioner', 'Google Data Analytics'],
    links: { github: 'github.com/ayesha-rehman', linkedin: 'linkedin.com/in/ayesharehman', portfolio: '' },
    resume: { fileName: 'Ayesha_Rehman_CV.pdf', uploadedAt: new Date(now.getTime() - 5 * 86400000).toISOString(), size: '184 KB' },
    bio: 'Final-year CS student who enjoys backend systems and turning messy hospital data into calmer queues.',
    privacy: { showCgpa: true, showLinks: true, hiddenFairs: [] },
    verification: 'verified',
    bookmarks: ['arb', 'sys'],
    tint: 'brand',
    onboarded: true,
    createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
  }
  const students = [ayesha]
  NAMES.forEach((name, i) => {
    const department = DEPTS[i % DEPTS.length]
    const track = TRACKS[pick(r, TRACK_BY_DEPT[department])]
    const skills = sample(r, track.skills, 4 + Math.floor(r() * 4))
    if (r() > 0.6) skills.push(pick(r, ['Git', 'SQL', 'Communication', 'Python', 'JavaScript']))
    const [title, abstract, stack] = pick(r, track.fyp)
    const cgpa = Math.round((2.4 + r() * 1.55) * 100) / 100
    const batchYear = 21 + (i % 3 === 0 ? 1 : 0)
    students.push({
      id: `st${i + 2}`,
      name,
      email: `${slug(name)}@student.uol.edu.pk`,
      phone: `+92 3${Math.floor(10 + r() * 40)} ${Math.floor(1000000 + r() * 8999999)}`,
      rollNo: `${department}-F${batchYear}-${String(100 + i * 7).padStart(3, '0')}`,
      department,
      batch: `Fall 20${batchYear}`,
      semester: batchYear === 21 ? 8 : 7,
      cgpa: Math.min(3.95, cgpa),
      skills: [...new Set(skills)],
      fyp: { title, abstract, stack, supervisor: pick(r, ['Dr. Kashif Javed', 'Dr. Amna Basharat', 'Mr. Fahad Ali', 'Dr. Saima Farhan']) },
      certifications: sample(r, CERTS, Math.floor(r() * 3)),
      links: { github: `github.com/${slug(name).replace('.', '-')}`, linkedin: r() > 0.3 ? `linkedin.com/in/${slug(name).replace('.', '')}` : '', portfolio: '' },
      resume: r() > 0.15 ? { fileName: `${name.replace(' ', '_')}_CV.pdf`, uploadedAt: now.toISOString(), size: `${120 + Math.floor(r() * 200)} KB` } : null,
      bio: '',
      privacy: { showCgpa: r() > 0.25, showLinks: true, hiddenFairs: [] },
      verification: i === 3 || i === 17 || i === 29 ? 'pending' : i === 11 ? 'flagged' : 'verified',
      verificationNote: i === 11 ? 'CGPA on profile (3.61) differs from registrar record (3.16).' : '',
      bookmarks: [],
      tint: TINTS[i % 4],
      onboarded: true,
      createdAt: now.toISOString(),
    })
  })
  // Registrar records uploaded later (A06) — flagged one mismatches
  const registrar = students.map((s) => ({ rollNo: s.rollNo, name: s.name, cgpa: s.id === 'st13' ? 3.16 : s.cgpa, department: s.department }))
  students.find((s) => s.id === 'st13').cgpa = 3.61

  const users = [
    { id: 'u_admin', role: 'admin', name: 'Sana Tariq', title: 'Career Services Officer', email: 'sana.tariq@uol.edu.pk', password: 'demo1234', status: 'active' },
    { id: 'u_admin2', role: 'admin', name: 'Imran Shafiq', title: 'Industry Linkages Manager', email: 'imran.shafiq@uol.edu.pk', password: 'demo1234', status: 'active' },
    ...students.map((s) => ({ id: `u_${s.id}`, role: 'student', name: s.name, email: s.email, password: 'demo1234', status: 'active', studentId: s.id })),
    { id: 'u_usman', role: 'recruiter', name: 'Usman Khalid', title: 'HR Lead', email: 'usman.khalid@arbisoft.com', password: 'demo1234', status: 'active', companyId: 'arb' },
    { id: 'u_arb2', role: 'recruiter', name: 'Mehreen Aziz', title: 'Engineering Manager', email: 'mehreen.aziz@arbisoft.com', password: 'demo1234', status: 'active', companyId: 'arb' },
    { id: 'u_bilal', role: 'recruiter', name: 'Bilal Siddiqui', title: 'Talent Partner', email: 'bilal@venturedive.com', password: 'demo1234', status: 'active', companyId: 'vd' },
    { id: 'u_contour', role: 'recruiter', name: 'Nadia Hussain', title: 'HR Manager', email: 'nadia.h@contour-software.com', password: 'demo1234', status: 'active', companyId: 'contour' },
    ...companies
      .filter((c) => !['arb', 'vd', 'contour'].includes(c.id))
      .map((c, i) => ({ id: `u_rec_${c.id}`, role: 'recruiter', name: ['Kamran Yousaf', 'Asma Rauf', 'Fahad Mir', 'Sadia Imran', 'Junaid Akhtar', 'Rida Shah', 'Omer Bashir', 'Tooba Ali', 'Haris Naveed'][i], title: 'Talent Acquisition', email: `careers@${c.website}`, password: 'demo1234', status: 'active', companyId: c.id })),
  ]

  const fairs = [
    {
      id: 'fair25',
      name: `UOL Career Fair ${fairDate.getFullYear()}`,
      date: fairDate.toISOString(),
      startTime: '10:00',
      endTime: '16:00',
      venue: 'Main Sports Complex, UOL Main Campus',
      status: 'upcoming',
      registrationOpen: new Date(now.getTime() - 14 * 86400000).toISOString(),
      registrationClose: new Date(fairDate.getTime() - 2 * 86400000).toISOString(),
      policy: { allowCgpaHiding: true, shareLinks: true, retentionDays: 90, requireVerification: true },
      weights: { ...DEFAULT_WEIGHTS },
      companyIds: companies.map((c) => c.id),
      stallCount: 24,
      description: 'The flagship annual career fair connecting final-year students with 60+ employers across software, telecom, fintech and consulting.',
    },
    {
      id: 'fair24',
      name: `UOL Career Fair ${pastDate.getFullYear()}`,
      date: pastDate.toISOString(),
      startTime: '10:00',
      endTime: '16:00',
      venue: 'Main Sports Complex, UOL Main Campus',
      status: 'ended',
      registrationOpen: new Date(pastDate.getTime() - 20 * 86400000).toISOString(),
      registrationClose: new Date(pastDate.getTime() - 2 * 86400000).toISOString(),
      policy: { allowCgpaHiding: true, shareLinks: true, retentionDays: 90, requireVerification: true },
      weights: { ...DEFAULT_WEIGHTS },
      companyIds: companies.filter((c) => c.status === 'approved').map((c) => c.id),
      stallCount: 24,
      description: 'Last year\u2019s fair. Figures shown are illustrative.',
      // Proposal-level aggregate figures for the historical fair (illustrative)
      totals: { students: 847, companies: 63, interactions: 4291, shortlisted: 1180, interviews: 312, offers: 74 },
    },
  ]

  const assigned = { arb: 14, sys: 3, netsol: 7, tenp: 9, devsinc: 11, techlogix: 16, folio3: 18, afiniti: 20, jazz: 22, i2c: 5 }
  const qrActive = ['arb', 'sys', 'netsol', 'tenp', 'devsinc', 'techlogix', 'folio3', 'afiniti']
  const stalls = []
  for (const fair of fairs) {
    for (let n = 1; n <= 24; n++) {
      const companyId = Object.keys(assigned).find((k) => assigned[k] === n) || null
      const active = companyId && (fair.id === 'fair24' || qrActive.includes(companyId))
      stalls.push({
        id: `${fair.id}_s${n}`,
        fairId: fair.id,
        number: n,
        zone: n <= 8 ? 'A' : n <= 16 ? 'B' : 'C',
        companyId,
        qr: active
          ? { status: 'active', code: `${companyId.toUpperCase().slice(0, 3)}-${n}-${fair.id.slice(-2)}${Math.floor(r() * 90 + 10)}`, generatedAt: new Date(now.getTime() - 3 * 86400000).toISOString() }
          : { status: 'none', code: '', generatedAt: null },
      })
    }
  }

  // Interview slots for the upcoming fair
  const slots = []
  const times = ['10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30']
  Object.entries(assigned).forEach(([companyId, n]) => {
    times.forEach((t) => slots.push({ id: `slot_${companyId}_${t.replace(':', '')}`, companyId, fairId: 'fair25', time: t, location: `Stall ${n} · Interview desk`, interviewId: null }))
  })

  // Historical interactions for the ended fair
  const interactions = []
  const approvedJobs = (cid) => jobs.filter((j) => j.companyId === cid)
  const histStatuses = ['rejected', 'rejected', 'reviewed', 'shortlisted', 'shortlisted', 'interview_completed', 'interview_completed', 'reviewed', 'pending']
  const hist = new Set()
  let guard = 0
  while (interactions.length < 120 && guard++ < 2000) {
    const s = students[1 + Math.floor(r() * (students.length - 1))]
    const cid = pick(r, Object.keys(assigned))
    if (hist.has(s.id + cid)) continue
    hist.add(s.id + cid)
    const best = bestJobMatch(s, approvedJobs(cid), DEFAULT_WEIGHTS)
    const at = new Date(pastDate)
    at.setHours(10 + Math.floor(Math.pow(r(), 0.8) * 6), Math.floor(r() * 60))
    const status = pick(r, histStatuses)
    interactions.push({
      id: `ix_h${interactions.length + 1}`,
      studentId: s.id,
      companyId: cid,
      fairId: 'fair24',
      jobId: best.jobId,
      score: best.score,
      breakdown: best.breakdown,
      matchedSkills: best.matchedSkills,
      missingSkills: best.missingSkills,
      status,
      createdAt: at.toISOString(),
      history: [{ status: 'pending', at: at.toISOString() }, ...(status !== 'pending' ? [{ status, at: new Date(at.getTime() + 3600000).toISOString() }] : [])],
      notes: [],
    })
  }

  const notifications = [
    { id: 'n1', to: 'student:st1', title: 'Your profile is verified', body: 'The Career Services office matched your academic record. Recruiters will see a Verified badge.', link: '/student/profile', at: new Date(now.getTime() - 2 * 86400000).toISOString(), read: false, kind: 'verify' },
    { id: 'n2', to: 'student:st1', title: `${fairs[0].name} is in 6 days`, body: 'Check which companies you may want to visit and note their stall numbers.', link: '/student/suggestions', at: new Date(now.getTime() - 86400000).toISOString(), read: false, kind: 'fair' },
    { id: 'n3', to: 'company:arb', title: 'Stall 14 assigned', body: 'Your stall QR has been generated. Print the poster before fair day.', link: '/recruiter/qr', at: new Date(now.getTime() - 3 * 86400000).toISOString(), read: false, kind: 'stall' },
    { id: 'n4', to: 'admin', title: 'VentureDive requested approval', body: 'A new company registration is waiting for review.', link: '/admin/companies', at: new Date(now.getTime() - 2 * 86400000).toISOString(), read: false, kind: 'company' },
    { id: 'n5', to: 'admin', title: 'Contour Software requested approval', body: 'A new company registration is waiting for review.', link: '/admin/companies', at: new Date(now.getTime() - 86400000).toISOString(), read: false, kind: 'company' },
  ]

  const checkins = students.slice(5, 25).map((s, i) => ({ id: `ci_h${i}`, fairId: 'fair24', studentId: s.id, at: new Date(pastDate.getTime() + i * 600000).toISOString() }))

  const audit = [
    { id: 'a1', at: new Date(now.getTime() - 3 * 86400000).toISOString(), actor: 'Sana Tariq', action: 'Generated stall QR', target: 'Arbisoft · Stall 14' },
    { id: 'a2', at: new Date(now.getTime() - 4 * 86400000).toISOString(), actor: 'Sana Tariq', action: 'Assigned stall', target: 'Arbisoft → Stall 14' },
    { id: 'a3', at: new Date(now.getTime() - 6 * 86400000).toISOString(), actor: 'Imran Shafiq', action: 'Uploaded registrar records', target: `${students.length} rows` },
    { id: 'a4', at: new Date(now.getTime() - 14 * 86400000).toISOString(), actor: 'Sana Tariq', action: 'Created fair', target: fairs[0].name },
  ]

  return {
    version: 1,
    university,
    users,
    students,
    companies,
    jobs,
    fairs,
    stalls,
    slots,
    interactions,
    interviews: [],
    notifications,
    checkins,
    registrar,
    audit,
    meta: { seededAt: now.toISOString() },
  }
}

export { scoreStudentForJob }
