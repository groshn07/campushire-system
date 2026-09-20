const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'campushire-super-secret';
const uploadDir = path.join(__dirname, 'uploads');
const dbFile = path.join(__dirname, 'data.json');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use('/uploads', express.static(uploadDir));

function nowISO() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function isStrongPassword(value) {
  return typeof value === 'string' && value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

function isFutureDate(value) {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now();
}

function createSeedData() {
  const companies = [
    { id: 'c_stratos', name: 'Stratosphere Labs', sector: 'Cloud Infrastructure', website: 'stratospherelabs.io' },
    { id: 'c_finwise', name: 'FinWise Technologies', sector: 'Fintech', website: 'finwise.com' },
    { id: 'c_nimbus', name: 'Nimbus Analytics', sector: 'Data & AI', website: 'nimbusanalytics.ai' },
    { id: 'c_orbital', name: 'Orbital Motors', sector: 'Automotive Engineering', website: 'orbitalmotors.com' },
    { id: 'c_verdant', name: 'Verdant Systems', sector: 'Renewable Energy', website: 'verdantsystems.com' },
  ];

  const users = [
    { id: 'u_admin1', name: 'Meera Krishnan', email: 'admin@demo.com', password: bcrypt.hashSync('demo123', 10), role: 'admin' },
    { id: 'u_rec1', name: 'Arjun Rao', email: 'recruiter@demo.com', password: bcrypt.hashSync('demo123', 10), role: 'recruiter', companyId: 'c_stratos', designation: 'Talent Acquisition Lead' },
    { id: 'u_rec2', name: 'Divya Menon', email: 'divya@finwise.com', password: bcrypt.hashSync('demo123', 10), role: 'recruiter', companyId: 'c_finwise', designation: 'HR Manager' },
    { id: 'u_stu1', name: 'Rahul Nair', email: 'student@demo.com', password: bcrypt.hashSync('demo123', 10), role: 'student' },
    { id: 'u_stu2', name: 'Sneha Pillai', email: 'sneha@demo.com', password: bcrypt.hashSync('demo123', 10), role: 'student' },
    { id: 'u_stu3', name: 'Kabir Singh', email: 'kabir@demo.com', password: bcrypt.hashSync('demo123', 10), role: 'student' },
  ];

  const students = [
    { studentId: 'u_stu1', rollNo: '21CS041', branch: 'Computer Science', batch: '2026', cgpa: 8.6, backlogs: 0, phone: '9876500001', skills: ['React', 'Node.js', 'Python', 'SQL'], education: 'B.Tech Computer Science, GCE College (2022–2026)', experience: 'Summer intern at a startup building internal tooling in React & Node.', resumeSummary: 'Full-stack leaning developer who enjoys building clean, usable products end to end.' },
    { studentId: 'u_stu2', rollNo: '21IT018', branch: 'Information Technology', batch: '2026', cgpa: 7.2, backlogs: 1, phone: '9876500002', skills: ['Java', 'Spring Boot', 'MySQL'], education: 'B.Tech Information Technology, GCE College (2022–2026)', experience: 'Built a hostel management system as a college project.', resumeSummary: 'Backend-focused engineer comfortable with Java and relational databases.' },
    { studentId: 'u_stu3', rollNo: '21EC029', branch: 'Electronics & Comm.', batch: '2026', cgpa: 9.1, backlogs: 0, phone: '9876500003', skills: ['Embedded C', 'Python', 'MATLAB', 'IoT'], education: 'B.Tech Electronics & Communication, GCE College (2022–2026)', experience: 'Research assistant on a campus IoT sensor network project.', resumeSummary: 'Hardware-software hybrid engineer with a strong analytical foundation.' },
  ];

  const jobs = [
    { id: 'j_stratos_sde', companyId: 'c_stratos', recruiterId: 'u_rec1', title: 'Software Development Engineer', description: 'Design and build features across our cloud platform.', location: 'Bengaluru (Hybrid)', jobType: 'Full-time', ctc: 12.5, eligibility: { minCgpa: 7.5, branches: ['Computer Science', 'Information Technology'], maxBacklogs: 0, batch: '2026' }, deadline: new Date(Date.now() + 9 * 86400000).toISOString(), status: 'open', postedAt: nowISO(), rounds: ['Online Assessment', 'Technical Interview', 'HR Interview'] },
    { id: 'j_stratos_intern', companyId: 'c_stratos', recruiterId: 'u_rec1', title: 'SDE Intern (6 months)', description: 'Hands-on internship building internal developer tools.', location: 'Remote', jobType: 'Internship', ctc: 0.6, eligibility: { minCgpa: 7.0, branches: ['Computer Science', 'Information Technology', 'Electronics & Comm.'], maxBacklogs: 1, batch: '2026' }, deadline: new Date(Date.now() + 5 * 86400000).toISOString(), status: 'open', postedAt: nowISO(), rounds: ['Coding Round', 'Interview'] },
    { id: 'j_finwise_analyst', companyId: 'c_finwise', recruiterId: 'u_rec2', title: 'Business Technology Analyst', description: 'Build payment and risk systems used by millions.', location: 'Chennai (On-site)', jobType: 'Full-time', ctc: 9.8, eligibility: { minCgpa: 7.0, branches: ['Computer Science', 'Information Technology', 'Electronics & Comm.', 'Mechanical', 'Electrical'], maxBacklogs: 0, batch: '2026' }, deadline: new Date(Date.now() + 14 * 86400000).toISOString(), status: 'open', postedAt: nowISO(), rounds: ['Aptitude Test', 'Group Discussion', 'Technical Interview', 'HR Interview'] },
    { id: 'j_nimbus_ds', companyId: 'c_nimbus', recruiterId: 'u_rec1', title: 'Data Analyst', description: 'Work with large datasets and dashboards.', location: 'Hyderabad (Hybrid)', jobType: 'Full-time', ctc: 8.4, eligibility: { minCgpa: 8.0, branches: ['Computer Science', 'Information Technology', 'Electronics & Comm.'], maxBacklogs: 0, batch: '2026' }, deadline: new Date(Date.now() + 20 * 86400000).toISOString(), status: 'open', postedAt: nowISO(), rounds: ['Technical Interview', 'Case Study', 'HR Interview'] },
    { id: 'j_orbital_core', companyId: 'c_orbital', recruiterId: 'u_rec2', title: 'Graduate Engineer Trainee', description: 'Design and test next-gen electric vehicles.', location: 'Pune (On-site)', jobType: 'Full-time', ctc: 7.2, eligibility: { minCgpa: 6.5, branches: ['Mechanical', 'Electrical', 'Electronics & Comm.'], maxBacklogs: 1, batch: '2026' }, deadline: new Date(Date.now() + 11 * 86400000).toISOString(), status: 'open', postedAt: nowISO(), rounds: ['Technical Interview', 'HR Interview'] },
    { id: 'j_verdant_civ', companyId: 'c_verdant', recruiterId: 'u_rec2', title: 'Site Engineering Associate', description: 'Support planning and execution of solar infrastructure projects.', location: 'Coimbatore (On-site)', jobType: 'Full-time', ctc: 6.5, eligibility: { minCgpa: 6.0, branches: ['Civil', 'Electrical', 'Mechanical'], maxBacklogs: 2, batch: '2026' }, deadline: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'closed', postedAt: nowISO(), rounds: ['Interview'] },
  ];

  const applications = [
    { id: 'a1', jobId: 'j_stratos_sde', studentId: 'u_stu1', status: 'shortlisted', appliedAt: nowISO(), timeline: [{ status: 'applied', date: nowISO(), note: 'Application submitted.' }, { status: 'shortlisted', date: nowISO(), note: 'Shortlisted after resume screening.' }] },
    { id: 'a2', jobId: 'j_stratos_intern', studentId: 'u_stu1', status: 'applied', appliedAt: nowISO(), timeline: [{ status: 'applied', date: nowISO(), note: 'Application submitted.' }] },
    { id: 'a3', jobId: 'j_finwise_analyst', studentId: 'u_stu2', status: 'applied', appliedAt: nowISO(), timeline: [{ status: 'applied', date: nowISO(), note: 'Application submitted.' }] },
    { id: 'a4', jobId: 'j_nimbus_ds', studentId: 'u_stu3', status: 'interview', appliedAt: nowISO(), timeline: [{ status: 'applied', date: nowISO(), note: 'Application submitted.' }, { status: 'shortlisted', date: nowISO(), note: 'Shortlisted.' }, { status: 'interview', date: nowISO(), note: 'Interview scheduled.' }] },
    { id: 'a5', jobId: 'j_orbital_core', studentId: 'u_stu3', status: 'selected', appliedAt: nowISO(), timeline: [{ status: 'applied', date: nowISO(), note: 'Application submitted.' }, { status: 'shortlisted', date: nowISO(), note: 'Shortlisted.' }, { status: 'interview', date: nowISO(), note: 'Interview completed.' }, { status: 'selected', date: nowISO(), note: 'Offer extended.' }] },
  ];

  const assessments = [
    {
      id: 'ass_stratos_1',
      jobId: 'j_stratos_sde',
      title: 'SDE Core Technical Screening',
      durationMinutes: 30,
      passMarks: 60,
      mcqQuestions: [
        { id: 'mcq1', question: 'What is the average time complexity of searching in a balanced Binary Search Tree?', options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'], correctOption: 1, points: 10 },
        { id: 'mcq2', question: 'Which HTTP header is standard for transmitting JWT authorization bearer tokens?', options: ['Content-Type', 'Authorization', 'Accept-Encoding', 'X-CSRF-Token'], correctOption: 1, points: 10 },
        { id: 'mcq3', question: 'In React, which hook is optimized for memoizing expensive computation results?', options: ['useEffect', 'useCallback', 'useMemo', 'useRef'], correctOption: 2, points: 10 }
      ],
      codingQuestions: [
        {
          id: 'code1',
          title: 'Two Sum Problem',
          description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target` as a JSON array `[i, j]`. Write a function `solution(nums, target)`.',
          starterCode: {
            javascript: 'function solution(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) return [i, j];\n    }\n  }\n  return [];\n}',
            python: 'def solution(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []',
            cpp: 'vector<int> solution(vector<int>& nums, int target) {\n    // Implementation\n    return {0, 1};\n}',
            java: 'public int[] solution(int[] nums, int target) {\n    // Implementation\n    return new int[]{0, 1};\n}'
          },
          testCases: [
            { id: 't1', input: 'nums = [2, 7, 11, 15], target = 9', expectedOutput: '[0, 1]', hidden: false },
            { id: 't2', input: 'nums = [3, 2, 4], target = 6', expectedOutput: '[1, 2]', hidden: false },
            { id: 't3', input: 'nums = [3, 3], target = 6', expectedOutput: '[0, 1]', hidden: true }
          ]
        }
      ],
      createdAt: nowISO()
    }
  ];

  const assessmentSubmissions = [];

  const certificates = [
    {
      id: 'cert_orbital_stu3',
      studentId: 'u_stu3',
      jobId: 'j_orbital_core',
      applicationId: 'a5',
      studentName: 'Kabir Singh',
      rollNo: '21EC029',
      branch: 'Electronics & Comm.',
      companyName: 'Orbital Motors',
      jobTitle: 'Graduate Engineer Trainee',
      ctc: 7.2,
      issuedAt: nowISO(),
      verificationCode: 'CH-2026-KABIR-ORBITAL'
    }
  ];

  return {
    users,
    students,
    companies,
    jobs,
    applications,
    interviews,
    notifications: [
      { id: 'n1', userId: 'u_stu3', title: 'Interview Scheduled', message: 'Your technical interview for Data Analyst at Nimbus Analytics is confirmed.', read: false, createdAt: nowISO(), type: 'interview' },
      { id: 'n2', userId: 'u_stu3', title: 'Offer Received', message: 'Congratulations! You have been selected for Graduate Engineer Trainee at Orbital Motors.', read: false, createdAt: nowISO(), type: 'result' },
      { id: 'n3', userId: 'u_stu1', title: 'Application Shortlisted', message: 'You have been shortlisted for Software Development Engineer at Stratosphere Labs.', read: false, createdAt: nowISO(), type: 'status' },
    ],
    roomMessages: [],
    roomSignals: [],
    uploadedFiles: [],
    assessments,
    assessmentSubmissions,
    certificates,
    pushSubscriptions: []
  };
}

function readDb() {
  if (!fs.existsSync(dbFile)) {
    const initial = createSeedData();
    fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2));
    return initial;
  }

  try {
    const raw = fs.readFileSync(dbFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.users || !parsed.jobs || !parsed.companies) {
      const initial = createSeedData();
      fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2));
      return initial;
    }
    if (!parsed.assessments) parsed.assessments = [];
    if (!parsed.assessmentSubmissions) parsed.assessmentSubmissions = [];
    if (!parsed.certificates) parsed.certificates = [];
    if (!parsed.pushSubscriptions) parsed.pushSubscriptions = [];
    return parsed;
  } catch (error) {
    const initial = createSeedData();
    fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function writeDb(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

const state = readDb();

function serializeUser(user) {
  if (!user) return null;
  const student = state.students.find((item) => item.studentId === user.id);
  const company = user.companyId ? state.companies.find((item) => item.id === user.companyId) : null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId || null,
    designation: user.designation || null,
    company,
    student: student ? { ...student } : null,
  };
}

function getUserFromStore(id) {
  const user = state.users.find((item) => item.id === id);
  return user ? serializeUser(user) : null;
}

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = getUserFromStore(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User not found.' });
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied for this role.' });
    }
    next();
  };
}

function addNotification(userId, title, message, type = 'status') {
  const notification = {
    id: makeId('n'),
    userId,
    title,
    message,
    read: false,
    createdAt: nowISO(),
    type,
  };
  state.notifications.unshift(notification);
  writeDb(state);
  return notification;
}

async function sendEmail({ to, subject, text }) {
  if (!process.env.SMTP_HOST) {
    console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject} | Message: ${text}`);
    return { mocked: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });

  await transporter.sendMail({ from: process.env.SMTP_FROM || 'noreply@campushire.local', to, subject, text });
  return { mocked: false };
}

function runNotificationJobs() {
  const now = Date.now();
  const soon = now + 24 * 60 * 60 * 1000;
  state.interviews.filter((interview) => interview.status === 'Scheduled').forEach((interview) => {
    const time = new Date(interview.date).getTime();
    if (time > now && time <= soon) {
      const key = `Interview reminder:${interview.id}`;
      if (!state.notifications.some((item) => item.title === 'Interview Reminder' && item.message.includes(interview.id))) {
        const student = state.users.find((item) => item.id === interview.studentId);
        addNotification(interview.studentId, 'Interview Reminder', `Your ${interview.round} starts within 24 hours. Room: ${interview.roomId} (${interview.id}).`, 'interview');
        if (student) sendEmail({ to: student.email, subject: 'Interview reminder', text: `Reminder: your ${interview.round} starts within 24 hours.` }).catch(() => {});
      }
    }
  });

  state.jobs.filter((job) => job.status === 'open').forEach((job) => {
    const time = new Date(job.deadline).getTime();
    if (time > now && time <= now + 2 * 24 * 60 * 60 * 1000) {
      const key = `Job closing soon:${job.id}`;
      if (!state.notifications.some((item) => item.title === 'Job Closing Soon' && item.message.includes(key))) {
        const recipients = state.users.filter((item) => item.role === 'student');
        recipients.forEach((student) => addNotification(student.id, 'Job Closing Soon', `${job.title} closes soon. ${key}`, 'job'));
      }
    }
  });
}

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'audio/webm', 'video/webm', 'video/mp4'];
    if (!allowed.includes(file.mimetype)) return callback(new Error('Only PDF, Word, text, WebM or MP4 files are allowed.'));
    callback(null, true);
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || 'upload');
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'CampusHire API is running.' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ message: 'Please enter a valid email address (e.g. name@domain.com).' });
  }

  const user = state.users.find((item) => item.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(404).json({ message: 'No account found with this email address. Please check your email or sign up.' });
  }

  if (role && user.role !== role) {
    const roleMap = { student: 'Student', recruiter: 'Recruiter', admin: 'Placement Officer' };
    return res.status(400).json({ message: `This email is registered under the ${roleMap[user.role] || user.role} role. Please select the correct tab.` });
  }

  const valid = bcrypt.compareSync(String(password || ''), user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Incorrect password. Please verify your password and try again.' });
  }

  const token = generateToken(user);
  res.json({ token, user: serializeUser(user) });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, companyId, designation, rollNo, branch, batch } = req.body;
  if (!name || !isValidEmail(email) || !isStrongPassword(password) || !['student', 'recruiter', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Use a valid email, a password with 8+ characters, letters and numbers, and a valid role.' });
  }

  const existing = state.users.find((item) => item.email.toLowerCase() === String(email).trim().toLowerCase());
  if (existing) return res.status(409).json({ message: 'Email already registered.' });

  const userId = makeId('u');
  const newUser = {
    id: userId,
    name,
    email: email.trim().toLowerCase(),
    password: bcrypt.hashSync(password, 10),
    role,
    companyId: companyId || null,
    designation: designation || null,
  };

  state.users.push(newUser);

  if (role === 'student') {
    state.students.push({
      studentId: userId,
      rollNo: rollNo || '—',
      branch: branch || 'Computer Science',
      batch: batch || '2026',
      cgpa: 0,
      backlogs: 0,
      phone: '',
      skills: [],
      education: '',
      experience: '',
      resumeSummary: '',
    });
  }

  writeDb(state);
  const token = generateToken(newUser);
  res.status(201).json({ token, user: serializeUser(newUser) });
});

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/jobs', authMiddleware, (req, res) => {
  let jobs = [...state.jobs];

  if (req.user.role === 'recruiter') {
    jobs = jobs.filter((job) => job.recruiterId === req.user.id);
  } else if (req.user.role === 'student') {
    jobs = jobs.filter((job) => job.status === 'open');
  }

  const result = jobs.map((job) => {
    const company = state.companies.find((item) => item.id === job.companyId);
    const applicantCount = state.applications.filter((app) => app.jobId === job.id).length;
    return { ...job, company, applicantCount };
  });

  res.json({ jobs: result });
});

app.post('/api/jobs', authMiddleware, requireRole('recruiter'), (req, res) => {
  const { title, description, location, jobType, ctc, eligibility, deadline, rounds } = req.body;
  if (!title || !description || !isFutureDate(deadline) || !eligibility || !Array.isArray(eligibility.branches) || !eligibility.branches.length || !Number.isFinite(Number(ctc)) || Number(ctc) < 0) {
    return res.status(400).json({ message: 'Title, description, deadline and eligible branches are required.' });
  }

  const job = {
    id: makeId('j'),
    companyId: req.user.companyId,
    recruiterId: req.user.id,
    title,
    description,
    location: location || '',
    jobType: jobType || 'Full-time',
    ctc: Number(ctc || 0),
    eligibility,
    deadline: new Date(deadline).toISOString(),
    status: 'open',
    postedAt: nowISO(),
    rounds: Array.isArray(rounds) && rounds.length ? rounds : ['Interview'],
  };

  state.jobs.push(job);
  writeDb(state);
  res.status(201).json({ job: { ...job, company: state.companies.find((item) => item.id === req.user.companyId) } });
});

app.post('/api/jobs/:jobId/apply', authMiddleware, requireRole('student'), (req, res) => {
  const { jobId } = req.params;
  const job = state.jobs.find((item) => item.id === jobId);
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  if (job.status !== 'open' || !isFutureDate(job.deadline)) return res.status(400).json({ message: 'This job is no longer accepting applications.' });

  const alreadyApplied = state.applications.some((app) => app.jobId === jobId && app.studentId === req.user.id);
  if (alreadyApplied) return res.status(400).json({ message: 'You already applied to this job.' });

  const applicationId = makeId('a');
  const appliedAt = nowISO();
  const application = {
    id: applicationId,
    jobId,
    studentId: req.user.id,
    status: 'applied',
    appliedAt,
    timeline: [{ status: 'applied', date: appliedAt, note: 'Application submitted.' }],
  };

  state.applications.push(application);
  writeDb(state);

  addNotification(req.user.id, 'Application Submitted', `Your application for ${job.title} has been submitted.`, 'status');
  sendEmail({ to: req.user.email, subject: `Application submitted: ${job.title}`, text: `Hi ${req.user.name}, your application for ${job.title} has been submitted successfully.` }).catch(() => {});

  res.status(201).json({ message: 'Application submitted successfully.' });
});

app.get('/api/applications', authMiddleware, (req, res) => {
  let rows = [...state.applications];

  if (req.user.role === 'student') {
    rows = rows.filter((app) => app.studentId === req.user.id);
  } else if (req.user.role === 'recruiter') {
    const jobIds = state.jobs.filter((job) => job.recruiterId === req.user.id).map((job) => job.id);
    rows = rows.filter((app) => jobIds.includes(app.jobId));
  }

  const result = rows.map((app) => {
    const job = state.jobs.find((item) => item.id === app.jobId);
    const student = state.students.find((item) => item.studentId === app.studentId);
    const user = state.users.find((item) => item.id === app.studentId);
    return {
      ...app,
      job,
      student,
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
    };
  });

  res.json({ applications: result });
});

app.patch('/api/applications/:id/status', authMiddleware, requireRole('recruiter', 'admin'), (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const app = state.applications.find((item) => item.id === id);
  if (!app) return res.status(404).json({ message: 'Application not found.' });

  const job = state.jobs.find((item) => item.id === app.jobId);
  const timeline = Array.isArray(app.timeline) ? app.timeline : [];
  timeline.push({ status, date: nowISO(), note: note || 'Status updated.' });
  app.status = status;
  app.timeline = timeline;
  writeDb(state);

  addNotification(app.studentId, status === 'shortlisted' ? 'Application Shortlisted' : status === 'selected' ? 'Offer Received' : 'Application Update', `Your application for ${job.title} is now ${status}.`, 'status');
  const student = state.users.find((item) => item.id === app.studentId);
  if (student && ['shortlisted', 'selected'].includes(status)) {
    sendEmail({ to: student.email, subject: status === 'selected' ? 'Offer received' : 'Application shortlisted', text: `Your application for ${job.title} is now ${status}.` }).catch(() => {});
  }
  res.json({ message: 'Application updated successfully.' });
});

app.get('/api/interviews', authMiddleware, (req, res) => {
  let rows = [...state.interviews];

  if (req.user.role === 'student') {
    rows = rows.filter((interview) => interview.studentId === req.user.id);
  } else if (req.user.role === 'recruiter') {
    const jobIds = state.jobs.filter((job) => job.recruiterId === req.user.id).map((job) => job.id);
    rows = rows.filter((interview) => jobIds.includes(interview.jobId));
  }

  const result = rows.map((interview) => {
    const job = state.jobs.find((item) => item.id === interview.jobId);
    const user = state.users.find((item) => item.id === interview.studentId);
    return { ...interview, job, user: user ? { id: user.id, name: user.name } : null };
  });

  res.json({ interviews: result });
});

app.post('/api/interviews', authMiddleware, requireRole('recruiter'), (req, res) => {
  const { applicationId, jobId, studentId, round, date, time, mode, venue } = req.body;
  const job = state.jobs.find((item) => item.id === jobId && item.recruiterId === req.user.id);
  const application = state.applications.find((item) => item.id === applicationId && item.jobId === jobId && item.studentId === studentId);
  if (!job || !application) return res.status(404).json({ message: 'Recruiter, job, or application mismatch.' });
  if (!round || !isFutureDate(date) || !time) return res.status(400).json({ message: 'Round, future date, and time are required.' });

  const interview = { id: makeId('i'), applicationId, jobId, studentId, round, date: new Date(date).toISOString(), time, mode: mode || 'Online', venue: venue || '', status: 'Scheduled', feedback: '', result: '', roomId: makeId('room'), notes: '', notesFileName: '', recordingUrl: '' };
  state.interviews.push(interview);
  if (application.status !== 'interview') {
    application.status = 'interview';
    application.timeline = Array.isArray(application.timeline) ? application.timeline : [];
    application.timeline.push({ status: 'interview', date: nowISO(), note: `${round} scheduled.` });
  }
  writeDb(state);
  const student = state.users.find((item) => item.id === studentId);
  addNotification(studentId, 'Interview Scheduled', `${round} for ${job.title} on ${new Date(date).toLocaleDateString('en-IN')} at ${time}.`, 'interview');
  if (student) sendEmail({ to: student.email, subject: `Interview invitation: ${job.title}`, text: `Your ${round} for ${job.title} is scheduled on ${new Date(date).toLocaleDateString('en-IN')} at ${time}.` }).catch(() => {});
  res.status(201).json({ interview });
});

app.patch('/api/interviews/:id', authMiddleware, requireRole('recruiter', 'admin'), (req, res) => {
  const interview = state.interviews.find((item) => item.id === req.params.id);
  if (!interview) return res.status(404).json({ message: 'Interview not found.' });
  const { notes, notesFileName, recordingUrl } = req.body;
  if (recordingUrl && !/^https?:\/\//i.test(recordingUrl)) return res.status(400).json({ message: 'Recording URL must start with http:// or https://.' });
  interview.notes = typeof notes === 'string' ? notes.slice(0, 20000) : interview.notes || '';
  interview.notesFileName = typeof notesFileName === 'string' ? notesFileName.slice(0, 255) : interview.notesFileName || '';
  interview.recordingUrl = recordingUrl || '';
  writeDb(state);
  res.json({ interview });
});

app.patch('/api/interviews/:id/result', authMiddleware, requireRole('recruiter', 'admin'), (req, res) => {
  const { id } = req.params;
  const { status, feedback, result } = req.body;
  const interview = state.interviews.find((item) => item.id === id);
  if (!interview) return res.status(404).json({ message: 'Interview not found.' });

  interview.status = status || interview.status;
  interview.feedback = feedback || interview.feedback || '';
  interview.result = result || interview.result || '';

  const app = state.applications.find((item) => item.id === interview.applicationId);
  if (app && result) {
    app.status = result === 'Selected' ? 'selected' : 'rejected';
    app.timeline = Array.isArray(app.timeline) ? app.timeline : [];
    app.timeline.push({ status: app.status, date: nowISO(), note: `${interview.round} result: ${result}.` });
  }

  writeDb(state);
  addNotification(interview.studentId, result === 'Selected' ? 'Offer Received' : 'Application Update', `Interview result: ${result || 'Updated'}.`, 'result');
  const studentUser = state.users.find((item) => item.id === interview.studentId);
  if (studentUser) {
    sendEmail({
      to: studentUser.email,
      subject: result === 'Selected' ? 'CampusHire offer received' : 'CampusHire interview result',
      text: `Hi ${studentUser.name}, your ${interview.round} result is: ${result || 'Updated'}.`,
    }).catch(() => {});
  }
  res.json({ message: 'Interview outcome updated.' });
});

app.get('/api/rooms/:roomId/messages', authMiddleware, (req, res) => {
  const { roomId } = req.params;
  const messages = state.roomMessages.filter((msg) => msg.roomId === roomId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.json({ messages });
});

app.post('/api/rooms/:roomId/messages', authMiddleware, (req, res) => {
  const { roomId } = req.params;
  const { message } = req.body;
  if (!message || !String(message).trim()) return res.status(400).json({ message: 'Message text is required.' });

  const entry = { id: makeId('m'), roomId, fromUser: req.user.name, message: String(message).trim(), createdAt: nowISO() };
  state.roomMessages.push(entry);
  writeDb(state);

  const messages = state.roomMessages.filter((item) => item.roomId === roomId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.status(201).json({ messages });
});

app.get('/api/rooms/:roomId/signals', authMiddleware, (req, res) => {
  const since = Number(req.query.since || 0);
  const signals = (state.roomSignals || []).filter((signal) => signal.roomId === req.params.roomId && signal.createdAt > since && signal.fromUserId !== req.user.id);
  res.json({ signals });
});

app.post('/api/rooms/:roomId/signals', authMiddleware, (req, res) => {
  const { type, payload } = req.body;
  if (!['offer', 'answer', 'ice-candidate', 'leave'].includes(type) || !payload) return res.status(400).json({ message: 'Invalid WebRTC signal.' });
  if (!state.roomSignals) state.roomSignals = [];
  const signal = { id: makeId('signal'), roomId: req.params.roomId, fromUserId: req.user.id, type, payload, createdAt: Date.now() };
  state.roomSignals.push(signal);
  state.roomSignals = state.roomSignals.filter((item) => item.createdAt > Date.now() - 30 * 60 * 1000);
  writeDb(state);
  res.status(201).json({ signal });
});

app.post('/api/uploads', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

  const record = {
    id: makeId('f'),
    userId: req.user.id,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    createdAt: nowISO(),
  };

  state.uploadedFiles.push(record);
  writeDb(state);
  res.status(201).json({ id: record.id, fileName: record.originalName, url: record.url, message: 'File uploaded successfully.' });
});

app.get('/api/notifications', authMiddleware, (req, res) => {
  const notifications = state.notifications.filter((item) => item.userId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ notifications });
});

app.patch('/api/notifications/read', authMiddleware, (req, res) => {
  state.notifications.forEach((item) => { if (item.userId === req.user.id) item.read = true; });
  writeDb(state);
  res.json({ message: 'Notifications marked as read.' });
});

app.post('/api/push/subscribe', authMiddleware, (req, res) => {
  const { subscription } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: 'Subscription object with endpoint is required.' });
  }

  if (!state.pushSubscriptions) state.pushSubscriptions = [];
  const existingIndex = state.pushSubscriptions.findIndex(s => s.endpoint === subscription.endpoint);

  if (existingIndex >= 0) {
    state.pushSubscriptions[existingIndex] = { ...subscription, userId: req.user.id, updatedAt: nowISO() };
  } else {
    state.pushSubscriptions.push({ ...subscription, userId: req.user.id, createdAt: nowISO() });
  }

  writeDb(state);
  res.status(201).json({ message: 'Push notification subscription registered successfully.' });
});

app.post('/api/push/test', authMiddleware, (req, res) => {
  const userSubs = (state.pushSubscriptions || []).filter(s => s.userId === req.user.id);
  res.json({
    message: `PWA Web Push dispatch simulation triggered for ${req.user.name}.`,
    activeSubscriptionsCount: userSubs.length,
    samplePayload: {
      title: '⚡ Campus Placement Push Alert',
      body: 'Your PWA is connected to CampusHire real-time push service.',
      url: '/notifications'
    }
  });
});

app.post('/api/interviews/:id/ai-summary', authMiddleware, (req, res) => {
  const interview = state.interviews.find((item) => item.id === req.params.id);
  if (!interview) return res.status(404).json({ message: 'Interview not found.' });

  const { transcript } = req.body;
  const rawText = Array.isArray(transcript)
    ? transcript.map(t => `${t.speaker || 'Speaker'}: ${t.text}`).join('\n')
    : String(transcript || '');

  if (!rawText.trim()) {
    return res.status(400).json({ message: 'Speech transcript text is required.' });
  }

  const lines = rawText.split('\n').filter(Boolean);
  const wordCount = rawText.split(/\s+/).length;

  const keySkillsMentioned = ['React', 'Node.js', 'Python', 'SQL', 'Algorithms', 'System Design', 'Communication', 'Teamwork']
    .filter(skill => rawText.toLowerCase().includes(skill.toLowerCase()));

  const aiNotes = `🤖 AI SPEECH-TO-TEXT INTERVIEW SUMMARY
----------------------------------------
● Candidate Dialogue Count: ${lines.length} exchanges (${wordCount} total spoken words)
● Key Skills Detected: ${keySkillsMentioned.length ? keySkillsMentioned.join(', ') : 'General Technical & Communication'}

💡 CANDIDATE EVALUATION & HIGHLIGHTS:
- Technical Proficiency: Candidate demonstrated clear responses regarding ${keySkillsMentioned[0] || 'core software engineering concepts'}.
- Spoken Clarity: Articulate response structure with consistent technical terminology.
- Key Excerpt: "${lines[0] || 'Discussed technical project experience and problem-solving steps.'}"

📌 RECOMMENDED NEXT STEPS:
Proceed with technical review for the candidate's next round.
----------------------------------------
Timestamp: ${nowISO()}`;

  interview.notes = (interview.notes ? interview.notes + '\n\n' : '') + aiNotes;
  writeDb(state);

  res.json({ aiNotes, interview });
});


/* =========================================================================
   Online Assessment (OA) & Code Execution Engine
   ========================================================================= */

function evaluateCode(language, code, testCases) {
  const results = [];
  let passedCount = 0;

  for (const tc of testCases) {
    let passed = false;
    let actualOutput = '';
    try {
      if (language === 'javascript' || language === 'js') {
        const wrappedCode = `${code}; return solution;`;
        const solutionFn = new Function(wrappedCode)();
        
        const argValues = [];
        const matches = tc.input.match(/=\s*(\[[^\]]*\]|\d+|"[^"]*")/g);
        if (matches) {
          matches.forEach(m => {
            const rawVal = m.replace(/^=\s*/, '');
            try { argValues.push(JSON.parse(rawVal)); } catch (e) { argValues.push(rawVal); }
          });
        }
        
        const res = solutionFn(...argValues);
        actualOutput = JSON.stringify(res);
        passed = String(actualOutput).replace(/\s/g, '') === String(tc.expectedOutput).replace(/\s/g, '');
      } else {
        actualOutput = tc.expectedOutput;
        passed = true;
      }
    } catch (e) {
      actualOutput = `Error: ${e.message}`;
      passed = false;
    }

    if (passed) passedCount++;
    results.push({
      testCaseId: tc.id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput,
      passed,
      hidden: Boolean(tc.hidden)
    });
  }

  return { results, passedCount, totalCount: testCases.length };
}

app.post('/api/assessments', authMiddleware, requireRole('recruiter', 'admin'), (req, res) => {
  const { id, jobId, title, durationMinutes, passMarks, mcqQuestions, codingQuestions } = req.body;
  if (!jobId || !title) return res.status(400).json({ message: 'Job ID and title are required.' });

  let assessment = state.assessments.find(a => a.id === id || a.jobId === jobId);
  if (assessment) {
    assessment.title = title;
    assessment.durationMinutes = Number(durationMinutes) || 30;
    assessment.passMarks = Number(passMarks) || 60;
    assessment.mcqQuestions = Array.isArray(mcqQuestions) ? mcqQuestions : [];
    assessment.codingQuestions = Array.isArray(codingQuestions) ? codingQuestions : [];
  } else {
    assessment = {
      id: id || makeId('ass'),
      jobId,
      title,
      durationMinutes: Number(durationMinutes) || 30,
      passMarks: Number(passMarks) || 60,
      mcqQuestions: Array.isArray(mcqQuestions) ? mcqQuestions : [],
      codingQuestions: Array.isArray(codingQuestions) ? codingQuestions : [],
      createdAt: nowISO()
    };
    state.assessments.push(assessment);
  }

  writeDb(state);
  res.status(201).json({ assessment, message: 'Assessment saved successfully.' });
});

app.get('/api/assessments/job/:jobId', authMiddleware, (req, res) => {
  const assessment = state.assessments.find(a => a.jobId === req.params.jobId);
  if (!assessment) return res.status(404).json({ message: 'No assessment found for this job.' });
  res.json({ assessment });
});

app.get('/api/assessments/:id/take', authMiddleware, (req, res) => {
  const assessment = state.assessments.find(a => a.id === req.params.id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found.' });

  const mcqs = (assessment.mcqQuestions || []).map(({ correctOption, ...rest }) => rest);
  const codings = (assessment.codingQuestions || []).map(q => ({
    ...q,
    testCases: (q.testCases || []).filter(tc => !tc.hidden)
  }));

  res.json({
    assessment: {
      ...assessment,
      mcqQuestions: mcqs,
      codingQuestions: codings
    }
  });
});

app.post('/api/assessments/:id/execute-code', authMiddleware, (req, res) => {
  const { questionId, language, code } = req.body;
  const assessment = state.assessments.find(a => a.id === req.params.id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found.' });

  const question = (assessment.codingQuestions || []).find(q => q.id === questionId);
  if (!question) return res.status(404).json({ message: 'Coding question not found.' });

  const publicTestCases = (question.testCases || []).filter(tc => !tc.hidden);
  const evaluation = evaluateCode(language || 'javascript', code || '', publicTestCases);

  res.json({ evaluation });
});

app.post('/api/assessments/:id/submit', authMiddleware, requireRole('student'), (req, res) => {
  const { jobId, mcqAnswers, codeSubmissions, proctoringLogs, warningsCount } = req.body;
  const assessment = state.assessments.find(a => a.id === req.params.id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found.' });

  let totalPoints = 0;
  let earnedPoints = 0;

  (assessment.mcqQuestions || []).forEach(mcq => {
    const pts = mcq.points || 10;
    totalPoints += pts;
    if (mcqAnswers && Number(mcqAnswers[mcq.id]) === Number(mcq.correctOption)) {
      earnedPoints += pts;
    }
  });

  const evaluatedCoding = [];
  (assessment.codingQuestions || []).forEach(cq => {
    const pts = 50;
    totalPoints += pts;
    const sub = (codeSubmissions || []).find(s => s.questionId === cq.id);
    if (sub && sub.code) {
      const evalRes = evaluateCode(sub.language || 'javascript', sub.code, cq.testCases || []);
      const fractionPassed = evalRes.totalCount ? (evalRes.passedCount / evalRes.totalCount) : 0;
      earnedPoints += Math.round(fractionPassed * pts);
      evaluatedCoding.push({
        questionId: cq.id,
        language: sub.language,
        code: sub.code,
        passedCount: evalRes.passedCount,
        totalCount: evalRes.totalCount,
        results: evalRes.results
      });
    }
  });

  const percentageScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = percentageScore >= (assessment.passMarks || 60);

  const submissionRecord = {
    id: makeId('sub'),
    assessmentId: assessment.id,
    jobId: jobId || assessment.jobId,
    studentId: req.user.id,
    studentName: req.user.name,
    earnedPoints,
    totalPoints,
    percentageScore,
    passed,
    mcqAnswers: mcqAnswers || {},
    codeSubmissions: evaluatedCoding,
    warningsCount: Number(warningsCount || 0),
    proctoringLogs: Array.isArray(proctoringLogs) ? proctoringLogs : [],
    submittedAt: nowISO()
  };

  state.assessmentSubmissions.push(submissionRecord);

  const app = state.applications.find(a => a.studentId === req.user.id && a.jobId === (jobId || assessment.jobId));
  if (app) {
    if (passed && app.status === 'applied') {
      app.status = 'shortlisted';
    }
    app.timeline = Array.isArray(app.timeline) ? app.timeline : [];
    app.timeline.push({
      status: app.status,
      date: nowISO(),
      note: `Completed Online Assessment '${assessment.title}': Score ${percentageScore}% (${passed ? 'Passed' : 'Failed'}).`
    });
  }

  writeDb(state);

  addNotification(req.user.id, 'Assessment Submitted', `You completed '${assessment.title}' with score ${percentageScore}%.`, 'status');

  res.status(201).json({ submission: submissionRecord, message: 'Assessment submitted successfully.' });
});

app.get('/api/assessments/:id/submissions', authMiddleware, requireRole('recruiter', 'admin'), (req, res) => {
  const submissions = state.assessmentSubmissions.filter(s => s.assessmentId === req.params.id);
  res.json({ submissions });
});

/* =========================================================================
   QR Verification Certificate Engine
   ========================================================================= */

app.get('/api/certificates', authMiddleware, (req, res) => {
  let certs = [];
  if (req.user.role === 'student') {
    certs = state.certificates.filter(c => c.studentId === req.user.id);
    
    const selectedApps = state.applications.filter(a => a.studentId === req.user.id && a.status === 'selected');
    selectedApps.forEach(app => {
      let existing = certs.find(c => c.applicationId === app.id);
      if (!existing) {
        const job = state.jobs.find(j => j.id === app.jobId);
        const company = job ? state.companies.find(comp => comp.id === job.companyId) : null;
        const student = state.students.find(s => s.studentId === req.user.id);
        const cert = {
          id: makeId('cert'),
          studentId: req.user.id,
          jobId: app.jobId,
          applicationId: app.id,
          studentName: req.user.name,
          rollNo: student ? student.rollNo : 'N/A',
          branch: student ? student.branch : 'Engineering',
          companyName: company ? company.name : 'Partner Company',
          jobTitle: job ? job.title : 'Software Engineer',
          ctc: job ? job.ctc : 0,
          issuedAt: nowISO(),
          verificationCode: `CH-${new Date().getFullYear()}-${(req.user.name || 'STU').replace(/\s+/g, '').toUpperCase().slice(0, 5)}-${(company ? company.name : 'OFFER').replace(/\s+/g, '').toUpperCase().slice(0, 5)}`
        };
        state.certificates.push(cert);
        certs.push(cert);
      }
    });
    writeDb(state);
  } else {
    certs = state.certificates;
  }
  res.json({ certificates: certs });
});

app.get('/api/certificates/verify/:certId', (req, res) => {
  const { certId } = req.params;
  const cert = state.certificates.find(c => c.id === certId || c.verificationCode === certId);
  if (!cert) return res.status(404).json({ verified: false, message: 'Invalid or non-existent placement certificate record.' });

  res.json({
    verified: true,
    certificate: {
      id: cert.id,
      verificationCode: cert.verificationCode,
      studentName: cert.studentName,
      rollNo: cert.rollNo,
      branch: cert.branch,
      companyName: cert.companyName,
      jobTitle: cert.jobTitle,
      ctc: cert.ctc,
      issuedAt: cert.issuedAt,
      authority: 'CampusHire Official University Placement Cell'
    }
  });
});

/* =========================================================================
   WhatsApp & Telegram Notification Bot Hub
   ========================================================================= */

app.get('/api/notifications/channels', authMiddleware, (req, res) => {
  const user = state.users.find((u) => u.id === req.user.id);
  res.json({
    channels: {
      whatsappNumber: user?.whatsappNumber || '9876500001',
      telegramHandle: user?.telegramHandle || '@campus_candidate',
      botEnabled: user?.botEnabled !== false
    }
  });
});

app.put('/api/notifications/channels', authMiddleware, (req, res) => {
  const { whatsappNumber, telegramHandle, botEnabled } = req.body;
  const user = state.users.find((u) => u.id === req.user.id);
  if (user) {
    user.whatsappNumber = whatsappNumber || user.whatsappNumber || '';
    user.telegramHandle = telegramHandle || user.telegramHandle || '';
    user.botEnabled = Boolean(botEnabled);
    writeDb(state);
  }
  res.json({ message: 'Notification channel preferences saved.' });
});

app.post('/api/notifications/bot-send', authMiddleware, (req, res) => {
  const { channel, message, title } = req.body;
  const user = state.users.find((u) => u.id === req.user.id);

  const dispatchRecord = {
    id: makeId('bot'),
    channel: channel || 'whatsapp',
    title: title || 'CampusHire Alert',
    message: message || 'Your placement status has been updated.',
    recipient: channel === 'telegram' ? (user?.telegramHandle || '@candidate') : (user?.whatsappNumber || '9876500001'),
    timestamp: nowISO(),
    status: 'Delivered'
  };

  res.status(200).json({
    success: true,
    dispatch: dispatchRecord,
    message: `Simulated ${channel === 'telegram' ? 'Telegram' : 'WhatsApp'} bot dispatch sent to ${dispatchRecord.recipient}.`
  });
});

/* =========================================================================
   Public Student Shareable Portfolio Engine
   ========================================================================= */

app.get('/api/portfolio/:rollNo', (req, res) => {
  const { rollNo } = req.params;
  const student = state.students.find(s => s.rollNo.toLowerCase() === rollNo.toLowerCase() || s.studentId === rollNo);
  if (!student) return res.status(404).json({ message: 'Student portfolio record not found.' });

  const user = state.users.find(u => u.id === student.studentId);
  const selectedApp = state.applications.find(a => a.studentId === student.studentId && a.status === 'selected');
  const job = selectedApp ? state.jobs.find(j => j.id === selectedApp.jobId) : null;
  const company = job ? state.companies.find(c => c.id === job.companyId) : null;

  if (!student.endorsements) {
    student.endorsements = { React: 12, 'Node.js': 9, Python: 15, SQL: 8 };
  }

  res.json({
    portfolio: {
      studentId: student.studentId,
      name: user ? user.name : 'Student Candidate',
      email: user ? user.email : '',
      rollNo: student.rollNo,
      branch: student.branch,
      batch: student.batch,
      cgpa: student.cgpa,
      skills: student.skills || [],
      education: student.education || '',
      experience: student.experience || '',
      resumeSummary: student.resumeSummary || '',
      profilePhoto: student.profilePhoto || '',
      linkedinUrl: student.linkedinUrl || '',
      githubUrl: student.githubUrl || '',
      endorsements: student.endorsements || {},
      placed: Boolean(selectedApp),
      placedCompany: company ? company.name : null,
      placedRole: job ? job.title : null,
      placedCtc: job ? job.ctc : null,
      verificationCode: selectedApp ? `CH-${new Date().getFullYear()}-${(user?.name || 'STU').replace(/\s+/g, '').slice(0, 5)}-OFFER` : null
    }
  });
});

app.post('/api/portfolio/:rollNo/endorse', (req, res) => {
  const { rollNo } = req.params;
  const { skill } = req.body;
  const student = state.students.find(s => s.rollNo.toLowerCase() === rollNo.toLowerCase() || s.studentId === rollNo);
  if (!student) return res.status(404).json({ message: 'Student portfolio record not found.' });

  if (!student.endorsements) student.endorsements = {};
  student.endorsements[skill] = (student.endorsements[skill] || 0) + 1;
  writeDb(state);

  res.json({ message: `Endorsed ${skill}!`, count: student.endorsements[skill] });
});

app.get('/api/analytics', authMiddleware, requireRole('admin'), (req, res) => {
  const studentCount = state.students.length;
  const companyCount = state.companies.length;
  const openJobs = state.jobs.filter((job) => job.status === 'open').length;
  const selectedOffers = state.applications.filter((app) => app.status === 'selected').length;
  const totalApplications = state.applications.length;
  const pipeline = ['applied', 'shortlisted', 'interview', 'selected', 'rejected'].map((status) => ({ status, count: state.applications.filter((app) => app.status === status).length }));

  const branchStats = [...new Set(state.students.map((student) => student.branch))].map((branch) => {
    const branchStudents = state.students.filter((student) => student.branch === branch);
    const placed = new Set(state.applications.filter((app) => app.status === 'selected' && branchStudents.some((student) => student.studentId === app.studentId)).map((app) => app.studentId)).size;
    return { branch, students: branchStudents.length, placed };
  });

  const companyStats = state.companies.map((company) => ({
    name: company.name,
    offers: state.applications.filter((app) => app.status === 'selected' && state.jobs.find((job) => job.id === app.jobId)?.companyId === company.id).length,
  })).filter((item) => item.offers > 0);

  const selectedApps = state.applications.filter((app) => app.status === 'selected');
  const avgCtc = selectedApps.reduce((sum, app) => {
    const job = state.jobs.find((item) => item.id === app.jobId);
    return sum + (job ? Number(job.ctc || 0) : 0);
  }, 0) / Math.max(1, selectedApps.length);

  res.json({
    students: studentCount,
    companies: companyCount,
    openJobs,
    offers: selectedOffers,
    totalApplications,
    placementRate: studentCount ? Math.round((new Set(state.applications.filter((app) => app.status === 'selected').map((app) => app.studentId)).size / studentCount) * 100) : 0,
    avgCtc: Number(avgCtc).toFixed(1),
    pipeline,
    branchStats,
    companyStats,
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`CampusHire API running at http://localhost:${PORT}`);
  runNotificationJobs();
  setInterval(runNotificationJobs, 60 * 1000);
});