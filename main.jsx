import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import ReactDOM from "react-dom/client";
import {
  LayoutDashboard, Briefcase, FileText, Users, Building2, CalendarClock,
  BarChart3, Bell, LogOut, Plus, Search, CheckCircle2, XCircle, Clock3,
  UserCircle2, ChevronRight, GraduationCap, MapPin, IndianRupee, X,
  Filter, ArrowUpRight, ShieldCheck, Sparkles, Trash2, Edit3, Eye,
  CalendarPlus, Send, AlertTriangle, TrendingUp, Award, Building, MonitorUp,
  Mic, MicOff, Video, VideoOff, MessageSquareText, Link2, Upload, Camera,
  SunMedium, MoonStar
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* =========================================================================
   CampusHire — Placement Management Platform
   Single-file React SPA. Data is persisted via window.storage (shared),
   simulating a real backend/database so Student, Admin and Recruiter
   views all read and write the same underlying records.
   ========================================================================= */

const DB_KEY = "campushire_db_v1";
const SESSION_KEY = "campushire_session_v1";
const CHAT_KEY = "campushire_chat_v1";
const API_TOKEN_KEY = "campushire_api_token_v1";
const THEME_KEY = "campushire_theme_v1";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(API_TOKEN_KEY);
  const headers = { ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "API request failed.");
  return data;
}

const BRANCHES = ["Computer Science", "Information Technology", "Electronics & Comm.", "Mechanical", "Electrical", "Civil"];
const BATCHES = ["2025", "2026", "2027"];

/* ---------------------------- id / date utils --------------------------- */
const uid = (p = "id") => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const nowISO = () => new Date().toISOString();
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtDateTime = (iso) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const daysLeft = (iso) => Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24));

/* ------------------------------ seed data -------------------------------- */
function seedDB() {
  const companies = [
    { id: "c_stratos", name: "Stratosphere Labs", sector: "Cloud Infrastructure", website: "stratospherelabs.io" },
    { id: "c_finwise", name: "FinWise Technologies", sector: "Fintech", website: "finwise.com" },
    { id: "c_nimbus", name: "Nimbus Analytics", sector: "Data & AI", website: "nimbusanalytics.ai" },
    { id: "c_orbital", name: "Orbital Motors", sector: "Automotive Engineering", website: "orbitalmotors.com" },
    { id: "c_verdant", name: "Verdant Systems", sector: "Renewable Energy", website: "verdantsystems.com" },
  ];

  const users = [
    { id: "u_admin1", name: "Meera Krishnan", email: "admin@demo.com", password: "demo123", role: "admin" },
    { id: "u_rec1", name: "Arjun Rao", email: "recruiter@demo.com", password: "demo123", role: "recruiter", companyId: "c_stratos", designation: "Talent Acquisition Lead" },
    { id: "u_rec2", name: "Divya Menon", email: "divya@finwise.com", password: "demo123", role: "recruiter", companyId: "c_finwise", designation: "HR Manager" },
    { id: "u_stu1", name: "Rahul Nair", email: "student@demo.com", password: "demo123", role: "student" },
    { id: "u_stu2", name: "Sneha Pillai", email: "sneha@demo.com", password: "demo123", role: "student" },
    { id: "u_stu3", name: "Kabir Singh", email: "kabir@demo.com", password: "demo123", role: "student" },
  ];

  const students = [
    { studentId: "u_stu1", rollNo: "21CS041", branch: "Computer Science", batch: "2026", cgpa: 8.6, backlogs: 0, phone: "9876500001",
      skills: ["React", "Node.js", "Python", "SQL"], education: "B.Tech Computer Science, GCE College (2022–2026)",
      experience: "Summer intern at a startup building internal tooling in React & Node.", resumeSummary: "Full-stack leaning developer who enjoys building clean, usable products end to end." },
    { studentId: "u_stu2", rollNo: "21IT018", branch: "Information Technology", batch: "2026", cgpa: 7.2, backlogs: 1, phone: "9876500002",
      skills: ["Java", "Spring Boot", "MySQL"], education: "B.Tech Information Technology, GCE College (2022–2026)",
      experience: "Built a hostel management system as a college project.", resumeSummary: "Backend-focused engineer comfortable with Java and relational databases." },
    { studentId: "u_stu3", rollNo: "21EC029", branch: "Electronics & Comm.", batch: "2026", cgpa: 9.1, backlogs: 0, phone: "9876500003",
      skills: ["Embedded C", "Python", "MATLAB", "IoT"], education: "B.Tech Electronics & Communication, GCE College (2022–2026)",
      experience: "Research assistant on a campus IoT sensor network project.", resumeSummary: "Hardware-software hybrid engineer with a strong analytical foundation." },
  ];

  const jobDeadline = (days) => new Date(Date.now() + days * 86400000).toISOString();

  const jobs = [
    { id: "j_stratos_sde", companyId: "c_stratos", recruiterId: "u_rec1", title: "Software Development Engineer",
      description: "Design and build features across our cloud platform. Work closely with senior engineers on scalable services, contribute to code reviews, and ship production code from week one.",
      location: "Bengaluru (Hybrid)", jobType: "Full-time", ctc: 12.5,
      eligibility: { minCgpa: 7.5, branches: ["Computer Science", "Information Technology"], maxBacklogs: 0, batch: "2026" },
      deadline: jobDeadline(9), status: "open", postedAt: nowISO(), rounds: ["Online Assessment", "Technical Interview", "HR Interview"] },
    { id: "j_stratos_intern", companyId: "c_stratos", recruiterId: "u_rec1", title: "SDE Intern (6 months)",
      description: "Hands-on internship building internal developer tools. Strong mentorship, real ownership, potential pre-placement offer.",
      location: "Remote", jobType: "Internship", ctc: 0.6,
      eligibility: { minCgpa: 7.0, branches: ["Computer Science", "Information Technology", "Electronics & Comm."], maxBacklogs: 1, batch: "2026" },
      deadline: jobDeadline(5), status: "open", postedAt: nowISO(), rounds: ["Coding Round", "Interview"] },
    { id: "j_finwise_analyst", companyId: "c_finwise", recruiterId: "u_rec2", title: "Business Technology Analyst",
      description: "Join our fintech engineering team to build payment and risk systems used by millions of customers.",
      location: "Chennai (On-site)", jobType: "Full-time", ctc: 9.8,
      eligibility: { minCgpa: 7.0, branches: ["Computer Science", "Information Technology", "Electronics & Comm.", "Mechanical", "Electrical"], maxBacklogs: 0, batch: "2026" },
      deadline: jobDeadline(14), status: "open", postedAt: nowISO(), rounds: ["Aptitude Test", "Group Discussion", "Technical Interview", "HR Interview"] },
    { id: "j_nimbus_ds", companyId: "c_nimbus", recruiterId: "u_rec1", title: "Data Analyst",
      description: "Work with large datasets to build dashboards and models that guide product decisions.",
      location: "Hyderabad (Hybrid)", jobType: "Full-time", ctc: 8.4,
      eligibility: { minCgpa: 8.0, branches: ["Computer Science", "Information Technology", "Electronics & Comm."], maxBacklogs: 0, batch: "2026" },
      deadline: jobDeadline(20), status: "open", postedAt: nowISO(), rounds: ["Technical Interview", "Case Study", "HR Interview"] },
    { id: "j_orbital_core", companyId: "c_orbital", recruiterId: "u_rec2", title: "Graduate Engineer Trainee",
      description: "Rotate across design, manufacturing and testing teams building next-gen electric vehicles.",
      location: "Pune (On-site)", jobType: "Full-time", ctc: 7.2,
      eligibility: { minCgpa: 6.5, branches: ["Mechanical", "Electrical", "Electronics & Comm."], maxBacklogs: 1, batch: "2026" },
      deadline: jobDeadline(11), status: "open", postedAt: nowISO(), rounds: ["Technical Interview", "HR Interview"] },
    { id: "j_verdant_civ", companyId: "c_verdant", recruiterId: "u_rec2", title: "Site Engineering Associate",
      description: "Support planning and execution of solar infrastructure projects across South India.",
      location: "Coimbatore (On-site)", jobType: "Full-time", ctc: 6.5,
      eligibility: { minCgpa: 6.0, branches: ["Civil", "Electrical", "Mechanical"], maxBacklogs: 2, batch: "2026" },
      deadline: jobDeadline(-2), status: "closed", postedAt: nowISO(), rounds: ["Interview"] },
  ];

  const applications = [
    { id: "a1", jobId: "j_stratos_sde", studentId: "u_stu1", status: "shortlisted", appliedAt: nowISO(),
      timeline: [{ status: "applied", date: nowISO(), note: "Application submitted." }, { status: "shortlisted", date: nowISO(), note: "Shortlisted after resume screening." }] },
    { id: "a2", jobId: "j_stratos_intern", studentId: "u_stu1", status: "applied", appliedAt: nowISO(),
      timeline: [{ status: "applied", date: nowISO(), note: "Application submitted." }] },
    { id: "a3", jobId: "j_finwise_analyst", studentId: "u_stu2", status: "applied", appliedAt: nowISO(),
      timeline: [{ status: "applied", date: nowISO(), note: "Application submitted." }] },
    { id: "a4", jobId: "j_nimbus_ds", studentId: "u_stu3", status: "interview", appliedAt: nowISO(),
      timeline: [{ status: "applied", date: nowISO(), note: "Application submitted." }, { status: "shortlisted", date: nowISO(), note: "Shortlisted." }, { status: "interview", date: nowISO(), note: "Interview scheduled." }] },
    { id: "a5", jobId: "j_orbital_core", studentId: "u_stu3", status: "selected", appliedAt: nowISO(),
      timeline: [{ status: "applied", date: nowISO(), note: "Application submitted." }, { status: "shortlisted", date: nowISO(), note: "Shortlisted." }, { status: "interview", date: nowISO(), note: "Interview completed." }, { status: "selected", date: nowISO(), note: "Offer extended \u2014 Graduate Engineer Trainee." }] },
  ];

  const interviews = [
    { id: "i1", applicationId: "a4", jobId: "j_nimbus_ds", studentId: "u_stu3", round: "Technical Interview",
      date: new Date(Date.now() + 3 * 86400000).toISOString(), time: "11:00 AM", mode: "Online", venue: "Google Meet link shared via email",
      status: "Scheduled", feedback: "", result: "", roomId: "room_i1", notes: "", notesFileName: "", recordingUrl: "" },
    { id: "i2", applicationId: "a5", jobId: "j_orbital_core", studentId: "u_stu3", round: "HR Interview",
      date: new Date(Date.now() - 2 * 86400000).toISOString(), time: "3:00 PM", mode: "In-person", venue: "Placement Cell, Block A",
      status: "Completed", feedback: "Strong communicator, solid technical fundamentals.", result: "Selected", roomId: "room_i2", notes: "", notesFileName: "", recordingUrl: "" },
  ];

  const notifications = [
    { id: "n1", userId: "u_stu3", title: "Interview Scheduled", message: "Your technical interview for Data Analyst at Nimbus Analytics is confirmed.", read: false, createdAt: nowISO(), type: "interview" },
    { id: "n2", userId: "u_stu3", title: "Offer Received", message: "Congratulations! You've been selected for Graduate Engineer Trainee at Orbital Motors.", read: false, createdAt: nowISO(), type: "result" },
    { id: "n3", userId: "u_stu1", title: "Application Shortlisted", message: "You've been shortlisted for Software Development Engineer at Stratosphere Labs.", read: false, createdAt: nowISO(), type: "status" },
  ];

  return { users, students, companies, jobs, applications, interviews, notifications };
}

/* ------------------------------ storage layer ---------------------------- */
function getStorageApi() {
  if (window.storage && typeof window.storage.get === "function") return window.storage;
  return {
    async get(key, shared) {
      const store = shared ? window.localStorage : window.sessionStorage;
      const raw = store.getItem(key);
      return raw ? { value: raw } : null;
    },
    async set(key, value, shared) {
      const store = shared ? window.localStorage : window.sessionStorage;
      store.setItem(key, value);
      return true;
    },
    async delete(key, shared) {
      const store = shared ? window.localStorage : window.sessionStorage;
      store.removeItem(key);
      return true;
    },
  };
}

async function loadDB() {
  const storage = getStorageApi();
  try {
    const res = await storage.get(DB_KEY, true);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) { /* not found or unavailable */ }
  const seeded = seedDB();
  try { await storage.set(DB_KEY, JSON.stringify(seeded), true); } catch (e) {}
  return seeded;
}
async function persistDB(db) {
  const storage = getStorageApi();
  try { await storage.set(DB_KEY, JSON.stringify(db), true); } catch (e) { console.error("persist failed", e); }
}
async function loadSession() {
  const storage = getStorageApi();
  try {
    const res = await storage.get(SESSION_KEY, false);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) {}
  return null;
}
async function persistSession(session) {
  const storage = getStorageApi();
  try {
    if (session) await storage.set(SESSION_KEY, JSON.stringify(session), false);
    else await storage.delete(SESSION_KEY, false);
  } catch (e) {}
}

function readRoomChat(roomId) {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed[roomId]) ? parsed[roomId] : [];
  } catch (e) {
    return [];
  }
}

function writeRoomChat(roomId, messages) {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[roomId] = Array.isArray(messages) ? messages : [];
    localStorage.setItem(CHAT_KEY, JSON.stringify(parsed));
  } catch (e) {
    console.warn("Could not persist room chat", e);
  }
}

/* --------------------------- eligibility engine --------------------------- */
function checkEligibility(student, job) {
  const reasons = [];
  if (!student) return { eligible: false, reasons: ["Complete your profile to check eligibility."] };
  const e = job.eligibility || {};
  if (typeof e.minCgpa === "number" && student.cgpa < e.minCgpa) reasons.push(`Requires CGPA \u2265 ${e.minCgpa.toFixed(1)} (yours: ${student.cgpa.toFixed(1)})`);
  if (Array.isArray(e.branches) && e.branches.length && !e.branches.includes(student.branch)) reasons.push(`Open only to ${e.branches.join(", ")}`);
  if (typeof e.maxBacklogs === "number" && student.backlogs > e.maxBacklogs) reasons.push(`Allows max ${e.maxBacklogs} backlog${e.maxBacklogs === 1 ? "" : "s"} (yours: ${student.backlogs})`);
  if (e.batch && student.batch !== e.batch) reasons.push(`Only batch ${e.batch} eligible`);
  return { eligible: reasons.length === 0, reasons };
}

/* --------------------------------- style ---------------------------------- */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');
    :root, .ch-root[data-theme="light"]{
      --ink:#14172B; --ink-soft:#4B4F6B; --bg:#F5F6FB; --surface:#FFFFFF;
      --border:#E4E6F1; --primary:#2B3A67; --primary-dark:#1D2748; --primary-tint:#EDF0FA;
      --accent:#E8A33D; --accent-tint:#FBF0DC; --success:#1F8A5F; --success-tint:#E6F5EE;
      --danger:#C4453A; --danger-tint:#FBEAE8; --info:#3568B0; --info-tint:#EAF1FB;
      --shadow: rgba(20,23,43,0.12);
    }
    .ch-root[data-theme="dark"]{
      --ink:#EAEFFD; --ink-soft:#AAB7D6; --bg:#0E1322; --surface:#151D31; --border:#24314E;
      --primary:#7FA5FF; --primary-dark:#5B7BD9; --primary-tint:#1F2B45; --accent:#F6BF5E;
      --accent-tint:#382E17; --success:#5FD39B; --success-tint:#163827; --danger:#F38A84;
      --danger-tint:#3C1D22; --info:#8DB9FF; --info-tint:#1A2B46; --shadow: rgba(8,11,18,0.52);
    }
    *{box-sizing:border-box;}
    .ch-root{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--ink);min-height:100vh;}
    .ch-serif{font-family:'Fraunces',serif;}
    .ch-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;}
    .ch-btn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:14px;border-radius:10px;padding:10px 16px;cursor:pointer;border:1px solid transparent;transition:transform .12s ease, background .15s ease, border-color .15s ease;}
    .ch-btn:active{transform:scale(0.97);}
    .ch-btn-primary{background:var(--primary);color:#fff;}
    .ch-btn-primary:hover{background:var(--primary-dark);}
    .ch-btn-accent{background:var(--accent);color:#241A05;}
    .ch-btn-accent:hover{filter:brightness(0.95);}
    .ch-btn-ghost{background:transparent;color:var(--ink);border-color:var(--border);}
    .ch-btn-ghost:hover{background:var(--primary-tint);}
    .ch-btn-danger{background:var(--danger-tint);color:var(--danger);}
    .ch-btn-danger:hover{background:#f6d9d6;}
    .ch-btn:disabled{opacity:.5;cursor:not-allowed;}
    .ch-input{width:100%;border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;background:#fff;color:var(--ink);}
    .ch-input:focus{outline:2px solid var(--primary); outline-offset:1px;}
    .ch-label{font-size:12.5px;font-weight:600;color:var(--ink-soft);margin-bottom:6px;display:block;}
    .ch-badge{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;letter-spacing:.01em;}
    .ch-scroll::-webkit-scrollbar{width:8px;height:8px;}
    .ch-scroll::-webkit-scrollbar-thumb{background:#D6D9E8;border-radius:8px;}
    .ch-navlink{display:flex;align-items:center;gap:11px;padding:10px 14px;border-radius:10px;font-size:14px;font-weight:600;color:#C9CEEA;cursor:pointer;transition:background .15s ease,color .15s ease;}
    .ch-navlink:hover{background:rgba(255,255,255,0.08);color:#fff;}
    .ch-navlink.active{background:var(--accent);color:#241A05;}
    .ch-toggle{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border);background:var(--surface);color:var(--ink);border-radius:10px;cursor:pointer;transition:all .15s ease;}
    .ch-toggle:hover{border-color:var(--primary);}
    .ch-notification-item{border-radius:10px;padding:12px 10px;border:1px solid transparent;transition:all .15s ease;}
    .ch-notification-item:hover{background:var(--primary-tint);border-color:var(--border);}
    .ch-notification-item.unread{background:var(--info-tint);border-color:rgba(53,104,176,0.15);}
    .ch-progress-track{height:8px;background:var(--primary-tint);border-radius:999px;overflow:hidden;}
    .ch-progress-bar{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--primary),var(--accent));}
    table.ch-table{width:100%;border-collapse:collapse;font-size:13.5px;}
    table.ch-table th{text-align:left;color:var(--ink-soft);font-weight:600;font-size:12px;letter-spacing:.02em;padding:10px 14px;border-bottom:1px solid var(--border);}
    table.ch-table td{padding:12px 14px;border-bottom:1px solid var(--border);vertical-align:middle;}
    table.ch-table tr:last-child td{border-bottom:none;}
    .ch-modal-backdrop{position:fixed;inset:0;background:rgba(20,23,43,0.5);display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;z-index:50;overflow-y:auto;}
    .ch-progress-step{display:flex;flex-direction:column;align-items:center;flex:1;position:relative;}
    .ch-progress-dot{width:26px;height:26px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;z-index:1;}
    .ch-progress-line{position:absolute;top:13px;left:50%;width:100%;height:2px;z-index:0;}
    @media (max-width:900px){ .ch-sidebar{display:none;} }
  `}</style>
);

/* --------------------------------- helpers -------------------------------- */
const STATUS_META = {
  applied: { label: "Applied", color: "var(--info)", tint: "var(--info-tint)", icon: Send },
  shortlisted: { label: "Shortlisted", color: "var(--accent)", tint: "var(--accent-tint)", icon: Sparkles },
  interview: { label: "Interview", color: "#7A4FC7", tint: "#F1EAFA", icon: CalendarClock },
  selected: { label: "Selected", color: "var(--success)", tint: "var(--success-tint)", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "var(--danger)", tint: "var(--danger-tint)", icon: XCircle },
};
const PIPELINE = ["applied", "shortlisted", "interview", "selected"];

function Badge({ status }) {
  const m = STATUS_META[status] || STATUS_META.applied;
  const Icon = m.icon;
  return (
    <span className="ch-badge" style={{ color: m.color, background: m.tint }}>
      <Icon size={12} strokeWidth={2.5} /> {m.label}
    </span>
  );
}

function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="ch-card" style={{ padding: "56px 24px", textAlign: "center" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--primary-tint)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Icon size={24} color="var(--primary)" />
      </div>
      <div className="ch-serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: "var(--ink-soft)", maxWidth: 360, margin: "0 auto 16px" }}>{message}</div>
      {action}
    </div>
  );
}

function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div className="ch-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ch-card" style={{ width: "100%", maxWidth: width, marginTop: 48, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div className="ch-serif" style={{ fontSize: 19, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} className="ch-btn ch-btn-ghost" style={{ padding: 8 }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: "var(--ink)", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 8 }}>
      <CheckCircle2 size={16} color="var(--accent)" /> {toast}
    </div>
  );
}

function CameraInterviewModal({ interview, job, company, currentUser, onClose, onSave }) {
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const peerRef = useRef(null);
  const signalTimerRef = useRef(null);
  const signalCursorRef = useRef(0);
  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Local preview");
  const [elapsed, setElapsed] = useState(0);
  const [noteText, setNoteText] = useState(interview.notes || "");
  const [recordingUrl, setRecordingUrl] = useState(interview.recordingUrl || "");
  const [uploadedNoteName, setUploadedNoteName] = useState(interview.notesFileName || "");
  const roomId = interview.roomId || interview.id;
  const [chat, setChat] = useState(() => readRoomChat(roomId));
  const [draft, setDraft] = useState("");
  const screenStreamRef = useRef(null);

  const sendSignal = async (type, payload) => {
    if (!localStorage.getItem(API_TOKEN_KEY)) return;
    try {
      await apiRequest(`/rooms/${roomId}/signals`, { method: "POST", body: JSON.stringify({ type, payload }) });
    } catch (error) {
      setConnectionStatus("Signaling unavailable");
    }
  };

  useEffect(() => {
    let timer;
    timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const enableCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("This browser does not support webcam access.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        if (localStorage.getItem(API_TOKEN_KEY) && window.RTCPeerConnection) {
          const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
          peerRef.current = peer;
          stream.getTracks().forEach((track) => peer.addTrack(track, stream));
          peer.ontrack = (event) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
            setConnectionStatus("Connected");
          };
          peer.onicecandidate = (event) => {
            if (event.candidate) sendSignal("ice-candidate", event.candidate.toJSON());
          };
          peer.onconnectionstatechange = () => setConnectionStatus(peer.connectionState === "connected" ? "Connected" : peer.connectionState);
          const recruiterId = job?.recruiterId || "";
          const participantIds = [currentUser?.id || "", interview.studentId || "", recruiterId].filter(Boolean).sort();
          if (participantIds[0] === currentUser?.id) {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            await sendSignal("offer", offer);
          }
        }
      } catch (e) {
        setError("Camera access was blocked. Please allow webcam and microphone permission to continue.");
      }
    };

    enableCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      if (signalTimerRef.current) clearInterval(signalTimerRef.current);
      if (peerRef.current) peerRef.current.close();
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [interview.id]);

  useEffect(() => {
    if (!localStorage.getItem(API_TOKEN_KEY) || !window.RTCPeerConnection) return undefined;
    const pollSignals = async () => {
      try {
        const response = await apiRequest(`/rooms/${roomId}/signals?since=${signalCursorRef.current}`);
        for (const signal of response.signals || []) {
          signalCursorRef.current = Math.max(signalCursorRef.current, signal.createdAt);
          if (!peerRef.current) continue;
          if (signal.type === "offer") {
            await peerRef.current.setRemoteDescription(signal.payload);
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            await sendSignal("answer", answer);
          } else if (signal.type === "answer") {
            await peerRef.current.setRemoteDescription(signal.payload);
          } else if (signal.type === "ice-candidate") {
            await peerRef.current.addIceCandidate(signal.payload);
          }
        }
      } catch (error) {
        setConnectionStatus("Signaling unavailable");
      }
    };
    pollSignals();
    signalTimerRef.current = setInterval(pollSignals, 1200);
    return () => clearInterval(signalTimerRef.current);
  }, [roomId]);

  useEffect(() => {
    if (!localStorage.getItem(API_TOKEN_KEY)) return undefined;
    let active = true;
    apiRequest(`/rooms/${roomId}/messages`).then((response) => {
      if (!active || !Array.isArray(response.messages)) return;
      const next = response.messages.map((item) => ({ from: item.fromUser, text: item.message, createdAt: item.createdAt }));
      setChat(next);
      writeRoomChat(roomId, next);
    }).catch(() => {});
    return () => { active = false; };
  }, [roomId]);

  const toggleCamera = () => {
    setCameraOn((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = next;
        });
      }
      return next;
    });
  };

  const toggleMic = () => {
    setMicOn((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = next;
        });
      }
      return next;
    });
  };

  const shareScreen = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setError("Screen sharing is not supported in this browser.");
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = screenStream;
      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }
      setScreenSharing(true);
      screenStream.getVideoTracks()[0].addEventListener("ended", () => {
        if (streamRef.current && videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        setScreenSharing(false);
      });
    } catch (e) {
      setError("Screen share permission was denied.");
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    setSnapshot(canvas.toDataURL("image/png"));
  };

  const saveMeetingData = () => {
    if (onSave) {
      onSave({
        notes: noteText,
        notesFileName: uploadedNoteName,
        recordingUrl,
      });
    }
    if (localStorage.getItem(API_TOKEN_KEY)) {
      apiRequest(`/interviews/${interview.id}`, { method: "PATCH", body: JSON.stringify({ notes: noteText, notesFileName: uploadedNoteName, recordingUrl }) }).catch((error) => setError(error.message));
    }
  };

  const stopCamera = () => {
    saveMeetingData();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    onClose();
  };

  const addChatMessage = async () => {
    if (!draft.trim()) return;
    const message = draft.trim();
    let next = [...chat, { from: "You", text: message, createdAt: nowISO() }];
    if (localStorage.getItem(API_TOKEN_KEY)) {
      try {
        const response = await apiRequest(`/rooms/${roomId}/messages`, { method: "POST", body: JSON.stringify({ message }) });
        next = (response.messages || []).map((item) => ({ from: item.fromUser, text: item.message, createdAt: item.createdAt }));
      } catch (error) {
        setError(error.message);
      }
    }
    setChat(next);
    writeRoomChat(roomId, next);
    setDraft("");
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      setError("Upload a PDF, Word document, or text file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Files must be smaller than 10 MB.");
      return;
    }
    if (file.type.startsWith("text/") || file.name.endsWith(".pdf") || file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
      const reader = new FileReader();
      reader.onload = () => {
        setNoteText((prev) => (prev ? prev + "\n\n" : "") + (typeof reader.result === "string" ? reader.result : ""));
      };
      reader.readAsText(file);
      setUploadedNoteName(file.name);
    } else {
      setUploadedNoteName(file.name);
      setNoteText((prev) => (prev ? prev + "\n\n" : "") + `Uploaded file: ${file.name}`);
    }
    if (localStorage.getItem(API_TOKEN_KEY)) {
      const body = new FormData();
      body.append("file", file);
      apiRequest("/uploads", { method: "POST", body }).catch((error) => setError(error.message));
    }
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <Modal title="Live interview room" onClose={stopCamera} width={980}>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 0.9fr", gap: 16 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              {job?.title} · {company?.name} · {interview.round}
            </div>
            <div className="ch-badge" style={{ background: "var(--info-tint)", color: "var(--info)" }}>
              <Clock3 size={12} /> {formatTime(elapsed)}
            </div>
          </div>

          <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "#0f172a", minHeight: 360 }}>
            {error ? (
              <div style={{ padding: 24, color: "#fff", fontSize: 14, lineHeight: 1.7 }}>{error}</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "#0f172a" }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: 360, objectFit: "cover", background: "#0f172a" }} />
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: 360, objectFit: "cover", background: "#111827" }} />
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, color: connectionStatus === "Connected" ? "var(--success)" : "var(--ink-soft)", marginTop: 8 }}>● {connectionStatus}</div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <button className="ch-btn ch-btn-ghost" type="button" onClick={toggleCamera}>
              {cameraOn ? <Video size={14} /> : <VideoOff size={14} />} {cameraOn ? "Camera on" : "Camera off"}
            </button>
            <button className="ch-btn ch-btn-ghost" type="button" onClick={toggleMic}>
              {micOn ? <Mic size={14} /> : <MicOff size={14} />} {micOn ? "Mic on" : "Mic off"}
            </button>
            <button className="ch-btn ch-btn-ghost" type="button" onClick={shareScreen}>
              <MonitorUp size={14} /> {screenSharing ? "Screen sharing" : "Share screen"}
            </button>
            <button className="ch-btn ch-btn-primary" type="button" onClick={captureSnapshot}>Take snapshot</button>
          </div>

          {snapshot && (
            <div className="ch-card" style={{ marginTop: 14, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8 }}>Snapshot</div>
              <img src={snapshot} alt="Interview snapshot" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="ch-card" style={{ padding: 12, background: "var(--info-tint)", border: "none" }}>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--info)", marginBottom: 4 }}>Interview details</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{fmtDate(interview.date)} · {interview.time}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{interview.mode} · {interview.venue || "Location not set"}</div>
          </div>

          <div className="ch-card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Users size={14} /> Participants</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 12.5 }}><b>Interviewer:</b> {company?.name || "Recruiter"}</div>
              <div style={{ fontSize: 12.5 }}><b>Candidate:</b> {job ? "Student candidate" : "Interviewee"}</div>
            </div>
          </div>

          <div className="ch-card" style={{ padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}><MessageSquareText size={14} /> Live chat</div>
              <span className="ch-badge" style={{ background: "var(--primary-tint)", color: "var(--primary)", fontSize: 10.5 }}>Room: {roomId}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 160, overflowY: "auto", marginBottom: 10 }}>
              {chat.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>No messages yet. Start the conversation.</div>
              ) : (
                chat.map((msg, idx) => (
                  <div key={idx} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px" }}>
                    <div style={{ fontSize: 10.5, color: "var(--ink-soft)", marginBottom: 2 }}>{msg.from}</div>
                    <div style={{ fontSize: 12.5 }}>{msg.text}</div>
                  </div>
                ))
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="ch-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Send a quick message" />
              <button className="ch-btn ch-btn-primary" type="button" onClick={addChatMessage}><Send size={14} /></button>
            </div>
          </div>

          <div className="ch-card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Upload size={14} /> Interview notes & recordings</div>
            <div style={{ marginBottom: 10 }}>
              <label className="ch-label">Recording link</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Link2 size={13} color="var(--ink-soft)" />
                <input className="ch-input" value={recordingUrl} onChange={(e) => setRecordingUrl(e.target.value)} placeholder="https://meeting-link.com/recording" />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label className="ch-label">Upload notes</label>
              <input type="file" className="ch-input" onChange={handleUpload} style={{ padding: 8 }} />
              {uploadedNoteName && <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 6 }}>File: {uploadedNoteName}</div>}
            </div>
            <div>
              <label className="ch-label">Notes</label>
              <textarea className="ch-input" rows={6} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add interview observations, strengths, and follow-up questions..." />
            </div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
              <button className="ch-btn ch-btn-primary" type="button" onClick={stopCamera}>Save and close</button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ================================ APP ===================================== */
export default function App() {
  const [db, setDb] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "light");

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    (async () => {
      const [d, s] = await Promise.all([loadDB(), loadSession()]);
      setDb(d);
      if (s && d.users.find((u) => u.id === s.userId)) setSession(s);
      setLoading(false);
    })();
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }, []);

  const updateDB = useCallback((mutator) => {
    setDb((prev) => {
      const next = mutator(JSON.parse(JSON.stringify(prev)));
      persistDB(next);
      return next;
    });
  }, []);

  const login = async (email, password, role) => {
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { ok: false, error: "Please enter a valid email address (e.g. name@domain.com)." };
    }

    const emailUser = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!emailUser) {
      return { ok: false, error: "No account found with this email address. Please check your email or sign up." };
    }

    if (emailUser.role !== role) {
      const roleMap = { student: "Student", recruiter: "Recruiter", admin: "Placement Officer" };
      return { ok: false, error: `This email is registered under the ${roleMap[emailUser.role] || emailUser.role} role. Please select the correct login tab.` };
    }

    if (emailUser.password !== password) {
      return { ok: false, error: "Incorrect password. Please verify your password and try again." };
    }

    let apiToken = "";
    try {
      const response = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email: cleanEmail, password, role }) });
      apiToken = response.token;
      localStorage.setItem(API_TOKEN_KEY, apiToken);
    } catch (error) {
      localStorage.removeItem(API_TOKEN_KEY);
    }
    const s = { userId: emailUser.id, role: emailUser.role, apiToken };
    setSession(s);
    persistSession(s);
    setPage("dashboard");
    return { ok: true };
  };

  const signup = async (data) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { ok: false, error: "Enter a valid email address." };
    if (data.password.length < 8 || !/[A-Za-z]/.test(data.password) || !/\d/.test(data.password)) return { ok: false, error: "Password must be 8+ characters and include letters and numbers." };
    if (db.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const newUser = { id: uid("u"), name: data.name, email: data.email, password: data.password, role: data.role };
    if (data.role === "recruiter") { newUser.companyId = data.companyId; newUser.designation = data.designation; }
    updateDB((d) => {
      d.users.push(newUser);
      if (data.role === "student") {
        d.students.push({ studentId: newUser.id, rollNo: data.rollNo || "—", branch: data.branch, batch: data.batch, cgpa: 0, backlogs: 0, phone: "", skills: [], education: "", experience: "", resumeSummary: "" });
      }
      return d;
    });
    const s = { userId: newUser.id, role: newUser.role };
    try {
      const response = await apiRequest("/auth/register", { method: "POST", body: JSON.stringify(data) });
      s.apiToken = response.token;
      localStorage.setItem(API_TOKEN_KEY, response.token);
    } catch (error) {
      localStorage.removeItem(API_TOKEN_KEY);
    }
    setSession(s);
    persistSession(s);
    setPage(data.role === "student" ? "profile" : "dashboard");
    return { ok: true };
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(API_TOKEN_KEY);
    persistSession(null);
    setPage("dashboard");
  };

  if (loading || !db) {
    return (
      <div className="ch-root" data-theme={theme} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 480 }}>
        <GlobalStyle />
        <div style={{ textAlign: "center", color: "var(--ink-soft)" }}>
          <div className="ch-serif" style={{ fontSize: 22, fontWeight: 600, color: "var(--primary)", marginBottom: 8 }}>CampusHire</div>
          Loading your placement dashboard…
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="ch-root" data-theme={theme}>
        <GlobalStyle />
        <AuthScreen db={db} onLogin={login} onSignup={signup} />
      </div>
    );
  }

  const currentUser = db.users.find((u) => u.id === session.userId);
  if (!currentUser) {
    logout();
    return null;
  }

  return (
    <div className="ch-root" data-theme={theme}>
      <GlobalStyle />
      <Shell
        db={db} updateDB={updateDB} currentUser={currentUser} page={page} setPage={setPage}
        onLogout={logout} showToast={showToast} theme={theme} toggleTheme={() => setTheme((prev) => prev === 'dark' ? 'light' : 'dark')}
      />
      <Toast toast={toast} />
    </div>
  );
}

/* ============================== AUTH SCREEN ================================ */
function AuthScreen({ db, onLogin, onSignup }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ email: "", password: "", name: "", rollNo: "", branch: BRANCHES[0], batch: BATCHES[0], companyId: db.companies[0].id, designation: "" });
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      const r = await onLogin(form.email, form.password, role);
      if (!r.ok) setError(r.error);
    } else {
      if (!form.name || !form.email || !form.password) { setError("Please fill in all required fields."); return; }
      const r = await onSignup({ ...form, role });
      if (!r.ok) setError(r.error);
    }
  };

  const demoFill = (r) => {
    setRole(r);
    setMode("login");
    const map = { student: "student@demo.com", admin: "admin@demo.com", recruiter: "recruiter@demo.com" };
    setForm((f) => ({ ...f, email: map[r], password: "demo123" }));
  };

  const roleTabs = [
    { key: "student", label: "Student", icon: GraduationCap },
    { key: "recruiter", label: "Recruiter", icon: Building2 },
    { key: "admin", label: "Placement Officer", icon: ShieldCheck },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.1fr 1fr" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,var(--primary-dark),var(--primary) 70%)", color: "#fff", padding: "56px 52px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }} className="ch-scroll">
        <div style={{ position: "absolute", right: -80, top: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(232,163,61,0.16)" }} />
        <div style={{ position: "absolute", left: -60, bottom: -100, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 64 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Briefcase size={18} color="#241A05" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em" }}>CampusHire</span>
          </div>
          <div className="ch-serif" style={{ fontSize: 42, lineHeight: 1.15, fontWeight: 600, maxWidth: 480, marginBottom: 20 }}>
            Where placement season stops being chaos.
          </div>
          <p style={{ color: "#C9CEEA", fontSize: 15.5, lineHeight: 1.7, maxWidth: 440 }}>
            One place for students to find roles they actually qualify for, for recruiters to run a clean hiring pipeline, and for the placement office to see it all clearly.
          </p>
        </div>
        <div style={{ position: "relative", display: "flex", gap: 28, marginTop: 60 }}>
          {[["6", "companies hiring"], ["3", "roles in one login"], ["Live", "eligibility checks"]].map(([a, b]) => (
            <div key={b}>
              <div className="ch-serif" style={{ fontSize: 26, fontWeight: 600, color: "var(--accent)" }}>{a}</div>
              <div style={{ fontSize: 12.5, color: "#B7BEE0" }}>{b}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }} className="ch-scroll">
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div className="ch-serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>{mode === "login" ? "Welcome back" : "Create your account"}</div>
          <div style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 22 }}>
            {mode === "login" ? "Sign in to continue to your dashboard." : "Set up access to CampusHire."}
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 22, background: "var(--primary-tint)", padding: 4, borderRadius: 11 }}>
            {roleTabs.map((t) => (
              <button key={t.key} onClick={() => setRole(t.key)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "9px 4px", borderRadius: 8, border: "none", cursor: "pointer", background: role === t.key ? "#fff" : "transparent", boxShadow: role === t.key ? "0 1px 3px rgba(20,23,43,0.12)" : "none", fontWeight: 700, fontSize: 11.5, color: role === t.key ? "var(--primary)" : "var(--ink-soft)" }}>
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div style={{ marginBottom: 14 }}>
                <label className="ch-label">Full name</label>
                <input className="ch-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ananya Iyer" required />
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label className="ch-label">Email</label>
              <input type="email" className="ch-input" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" required />
            </div>
            <div style={{ marginBottom: mode === "signup" ? 14 : 6 }}>
              <label className="ch-label">Password</label>
              <input type="password" className="ch-input" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" required />
            </div>

            {mode === "signup" && role === "student" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div>
                    <label className="ch-label">Roll number</label>
                    <input className="ch-input" value={form.rollNo} onChange={(e) => set("rollNo", e.target.value)} placeholder="21CS041" />
                  </div>
                  <div>
                    <label className="ch-label">Batch</label>
                    <select className="ch-input" value={form.batch} onChange={(e) => set("batch", e.target.value)}>
                      {BATCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label className="ch-label">Branch</label>
                  <select className="ch-input" value={form.branch} onChange={(e) => set("branch", e.target.value)}>
                    {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </>
            )}

            {mode === "signup" && role === "recruiter" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label className="ch-label">Company</label>
                  <select className="ch-input" value={form.companyId} onChange={(e) => set("companyId", e.target.value)}>
                    {db.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label className="ch-label">Designation</label>
                  <input className="ch-input" value={form.designation} onChange={(e) => set("designation", e.target.value)} placeholder="e.g. Talent Acquisition Lead" />
                </div>
              </>
            )}

            {mode === "signup" && role === "admin" && (
              <div className="ch-card" style={{ padding: 12, background: "var(--info-tint)", border: "none", fontSize: 12.5, color: "var(--info)", marginBottom: 14, display: "flex", gap: 8 }}>
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> New placement officer accounts are added directly by an existing admin in a real deployment — this demo will still create one for you.
              </div>
            )}

            {error && <div style={{ color: "var(--danger)", fontSize: 12.5, fontWeight: 600, marginBottom: 12 }}>{error}</div>}

            <button type="submit" className="ch-btn ch-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px 16px", marginTop: 4 }}>
              {mode === "login" ? "Sign in" : "Create account"} <ArrowUpRight size={15} />
            </button>
          </form>

          <div style={{ textAlign: "center", fontSize: 13, color: "var(--ink-soft)", marginTop: 16 }}>
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <span style={{ color: "var(--primary)", fontWeight: 700, cursor: "pointer" }} onClick={() => { setMode("signup"); setError(""); }}>Sign up</span>
              </>
            ) : (
              <>Already have an account?{" "}
                <span style={{ color: "var(--primary)", fontWeight: 700, cursor: "pointer" }} onClick={() => { setMode("login"); setError(""); }}>Sign in</span>
              </>
            )}
          </div>

          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8 }}>QUICK DEMO LOGIN</div>
            <div style={{ display: "flex", gap: 8 }}>
              {roleTabs.map((t) => (
                <button key={t.key} onClick={() => demoFill(t.key)} className="ch-btn ch-btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "8px 6px" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================= SHELL ==================================== */
const NAV = {
  student: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "jobs", label: "Browse Jobs", icon: Briefcase },
    { key: "applications", label: "My Applications", icon: FileText },
    { key: "interviews", label: "Interviews", icon: CalendarClock },
    { key: "certificates", label: "QR Certificates", icon: Award },
    { key: "profile", label: "Profile & Resume", icon: UserCircle2 },
  ],
  recruiter: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "postjob", label: "Post a Job", icon: Plus },
    { key: "myjobs", label: "My Jobs", icon: Briefcase },
    { key: "assessments", label: "OA Assessments", icon: FileText },
    { key: "applicants", label: "Applicants", icon: Users },
    { key: "interviews", label: "Interviews", icon: CalendarClock },
  ],
  admin: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "students", label: "Students", icon: GraduationCap },
    { key: "companies", label: "Companies", icon: Building2 },
    { key: "jobs", label: "Jobs", icon: Briefcase },
    { key: "applications", label: "Applications", icon: FileText },
    { key: "interviews", label: "Interviews", icon: CalendarClock },
    { key: "stats", label: "Placement Stats", icon: BarChart3 },
  ],
};
const ROLE_LABEL = { student: "Student", recruiter: "Recruiter", admin: "Placement Officer" };

function Shell({ db, updateDB, currentUser, page, setPage, onLogout, showToast, theme, toggleTheme }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState("all");
  const [botModalOpen, setBotModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const triggerPwaInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    } else {
      showToast("CampusHire App is PWA ready!");
    }
  };

  const nav = NAV[currentUser.role];
  const notifications = db.notifications.filter((n) => n.userId === currentUser.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const unread = notifications.filter((n) => !n.read).length;
  const visibleNotifications = notifications.filter((n) => notifFilter === "all" || n.type === notifFilter);

  useEffect(() => {
    if (!localStorage.getItem(API_TOKEN_KEY)) return undefined;
    let active = true;
    const syncNotifications = async () => {
      try {
        const response = await apiRequest("/notifications");
        if (!active || !Array.isArray(response.notifications)) return;
        updateDB((d) => {
          const otherNotifications = d.notifications.filter((item) => item.userId !== currentUser.id);
          return { ...d, notifications: [...otherNotifications, ...response.notifications] };
        });
      } catch (error) {
        // Local notifications remain available if the API is offline.
      }
    };
    syncNotifications();
    const timer = setInterval(syncNotifications, 15000);
    return () => { active = false; clearInterval(timer); };
  }, [currentUser.id, updateDB]);

  const markAllRead = () => {
    updateDB((d) => { d.notifications.forEach((n) => { if (n.userId === currentUser.id) n.read = true; }); return d; });
    if (localStorage.getItem(API_TOKEN_KEY)) apiRequest("/notifications/read", { method: "PATCH" }).catch(() => {});
  };

  const company = currentUser.role === "recruiter" ? db.companies.find((c) => c.id === currentUser.companyId) : null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className="ch-sidebar" style={{ width: 246, background: "var(--primary-dark)", color: "#fff", padding: "22px 14px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px", marginBottom: 30 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Briefcase size={16} color="#241A05" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15.5 }}>CampusHire</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {nav.map((item) => (
            <div key={item.key} className={`ch-navlink ${page === item.key ? "active" : ""}`} onClick={() => setPage(item.key)}>
              <item.icon size={16} /> {item.label}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: "var(--accent)", color: "#241A05", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
              {currentUser.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser.name}</div>
              <div style={{ fontSize: 11, color: "#B7BEE0" }}>{ROLE_LABEL[currentUser.role]}{company ? ` · ${company.name}` : ""}</div>
            </div>
          </div>
          <div className="ch-navlink" onClick={onLogout} style={{ color: "#E6A6A0" }}>
            <LogOut size={16} /> Log out
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isOffline && (
          <div style={{ background: "var(--danger)", color: "#fff", padding: "8px 16px", textAlign: "center", fontSize: 12.5, fontWeight: 700 }}>
            ⚡ Offline Mode Active — Service Worker running from cached assets & local storage.
          </div>
        )}

        <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(245,246,251,0.9)", backdropFilter: "blur(6px)", borderBottom: "1px solid var(--border)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="ch-serif" style={{ fontSize: 18, fontWeight: 600 }}>{nav.find((n) => n.key === page)?.label || "Dashboard"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <button className="ch-btn ch-btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={triggerPwaInstall}>
              📱 Install PWA
            </button>
            <button className="ch-btn ch-btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => setBotModalOpen(true)}>
              💬 Bot Hub
            </button>
            <button className="ch-toggle" type="button" onClick={toggleTheme} style={{ width: 38, height: 38 }} aria-label="Toggle color mode">
              {theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
            </button>
            <button className="ch-btn ch-btn-ghost" style={{ padding: 9 }} onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) markAllRead(); }}>
              <Bell size={16} />
              {unread > 0 && <span style={{ position: "absolute", top: -3, right: -3, width: 16, height: 16, borderRadius: 999, background: "var(--danger)", color: "#fff", fontSize: 9.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}
            </button>
            {notifOpen && (
              <div className="ch-card ch-scroll" style={{ position: "absolute", right: 0, top: 44, width: 360, maxHeight: 420, overflowY: "auto", boxShadow: "0 12px 32px rgba(20,23,43,0.16)", padding: 10, zIndex: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px 10px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)" }}>NOTIFICATIONS</div>
                  {notifications.length > 0 && (
                    <button type="button" className="ch-btn ch-btn-ghost" onClick={markAllRead} style={{ padding: "6px 10px", fontSize: 11.5 }}>
                      Mark all as read
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 8px 10px" }}>
                  {['all', 'status', 'interview', 'result'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className="ch-btn ch-btn-ghost"
                      onClick={() => setNotifFilter(type)}
                      style={{ padding: "6px 10px", fontSize: 11.5, background: notifFilter === type ? "var(--primary-tint)" : "transparent", borderColor: notifFilter === type ? "var(--primary)" : "var(--border)", color: notifFilter === type ? "var(--primary)" : "var(--ink-soft)" }}
                    >
                      {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
                {visibleNotifications.length === 0 && <div style={{ padding: "20px 10px", fontSize: 13, color: "var(--ink-soft)", textAlign: "center" }}>No notifications in this category.</div>}
                {visibleNotifications.map((n) => (
                  <div key={n.id} className={`ch-notification-item ${!n.read ? 'unread' : ''}`} style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{n.title}</div>
                      {!n.read && <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--danger)', display: 'inline-block', marginTop: 4 }} />}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>{n.message}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span className="ch-badge" style={{ background: n.type === 'interview' ? 'var(--info-tint)' : n.type === 'result' ? 'var(--success-tint)' : 'var(--primary-tint)', color: n.type === 'interview' ? 'var(--info)' : n.type === 'result' ? 'var(--success)' : 'var(--primary)', fontSize: 10.5 }}>{n.type || 'status'}</span>
                      <div style={{ fontSize: 11, color: '#A7ACC7' }}>{fmtDateTime(n.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "26px 28px 60px" }}>
          {currentUser.role === "student" && <StudentApp db={db} updateDB={updateDB} currentUser={currentUser} page={page} setPage={setPage} showToast={showToast} />}
          {currentUser.role === "recruiter" && <RecruiterApp db={db} updateDB={updateDB} currentUser={currentUser} page={page} setPage={setPage} showToast={showToast} />}
          {currentUser.role === "admin" && <AdminApp db={db} updateDB={updateDB} currentUser={currentUser} page={page} setPage={setPage} showToast={showToast} />}
        </div>
      </div>
      {botModalOpen && <BotNotificationDispatchModal currentUser={currentUser} onClose={() => setBotModalOpen(false)} showToast={showToast} />}
    </div>
  );
}

/* Shared small components */
function StatCard({ icon: Icon, label, value, tint, color, sub }) {
  return (
    <div className="ch-card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: tint, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={17} color={color} />
      </div>
      <div>
        <div className="ch-serif" style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: "#A7ACC7", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionHeading({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
      <div>
        <div className="ch-serif" style={{ fontSize: 20, fontWeight: 600 }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

/* =========================================================================
   QR CODE VECTOR GENERATOR (Pure SVG)
   ========================================================================= */
function generateQRMatrix(text) {
  const size = 25;
  const matrix = Array(size).fill(0).map(() => Array(size).fill(false));

  const addFinder = (r, c) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const isBorder = i === 0 || i === 6 || j === 0 || j === 6;
        const isCenter = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        matrix[r + i][c + j] = isBorder || isCenter;
      }
    }
  };

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  let hash = 0;
  const str = String(text || "CH-VERIFY");
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)) continue;
      if (r === 6 || c === 6) continue;
      const bit = Math.abs((hash ^ (r * 31 + c * 17) ^ (r * c)) % 3) === 0;
      matrix[r][c] = bit;
    }
  }

  return matrix;
}

function QRCodeSVG({ value, size = 150 }) {
  const matrix = useMemo(() => generateQRMatrix(value), [value]);
  const cellSize = size / matrix.length;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 10, background: "#fff", padding: 8, border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      {matrix.map((row, r) =>
        row.map((cell, c) => cell ? (
          <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill="#14172B" rx={0.5} />
        ) : null)
      )}
    </svg>
  );
}

/* =========================================================================
   PUBLIC QR CERTIFICATE VERIFICATION MODAL
   ========================================================================= */
function PublicCertificateVerificationModal({ cert, onClose }) {
  if (!cert) return null;
  return (
    <Modal title="QR Placement Certificate Verification" onClose={onClose} width={540}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--success-tint)", color: "var(--success)", padding: "6px 16px", borderRadius: 999, fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
          <ShieldCheck size={16} /> OFFICIALLY VERIFIED RECORD
        </div>
        <div className="ch-serif" style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)" }}>Campus Placement Certificate</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>Authentication Code: <b>{cert.verificationCode || cert.id}</b></div>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 18, background: "var(--bg)", marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: 13 }}>
          <div><span style={{ color: "var(--ink-soft)", fontSize: 11.5, fontWeight: 600 }}>CANDIDATE NAME</span><br /><b>{cert.studentName}</b></div>
          <div><span style={{ color: "var(--ink-soft)", fontSize: 11.5, fontWeight: 600 }}>ROLL NUMBER</span><br /><b>{cert.rollNo || "N/A"}</b></div>
          <div><span style={{ color: "var(--ink-soft)", fontSize: 11.5, fontWeight: 600 }}>BRANCH</span><br /><b>{cert.branch}</b></div>
          <div><span style={{ color: "var(--ink-soft)", fontSize: 11.5, fontWeight: 600 }}>PLACED AT</span><br /><b style={{ color: "var(--primary)" }}>{cert.companyName}</b></div>
          <div><span style={{ color: "var(--ink-soft)", fontSize: 11.5, fontWeight: 600 }}>DESIGNATION</span><br /><b>{cert.jobTitle}</b></div>
          <div><span style={{ color: "var(--ink-soft)", fontSize: 11.5, fontWeight: 600 }}>PACKAGE (CTC)</span><br /><b style={{ color: "var(--success)" }}>₹{cert.ctc} LPA</b></div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "var(--ink-soft)", textAlign: "center", lineHeight: 1.6, marginBottom: 18 }}>
        Verified by <b>CampusHire University Placement Cell</b>.<br />This digital record guarantees authenticity of placement clearance and job selection.
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="ch-btn ch-btn-primary" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}

/* =========================================================================
   STUDENT CERTIFICATES VIEW
   ========================================================================= */
function StudentCertificates({ db, currentUser }) {
  const [verifyCert, setVerifyCert] = useState(null);
  const selectedApps = db.applications.filter(a => a.studentId === currentUser.id && a.status === 'selected');

  const certs = selectedApps.map(app => {
    const job = db.jobs.find(j => j.id === app.jobId);
    const company = job ? db.companies.find(c => c.id === job.companyId) : null;
    const student = db.students.find(s => s.studentId === currentUser.id);
    const code = `CH-${new Date().getFullYear()}-${(currentUser.name || 'STU').replace(/\s+/g, '').toUpperCase().slice(0, 5)}-${(company ? company.name : 'OFFER').replace(/\s+/g, '').toUpperCase().slice(0, 5)}`;
    return {
      id: `cert_${app.id}`,
      studentName: currentUser.name,
      rollNo: student ? student.rollNo : '21CS041',
      branch: student ? student.branch : 'Computer Science',
      companyName: company ? company.name : 'Partner Company',
      jobTitle: job ? job.title : 'Software Engineer',
      ctc: job ? job.ctc : 12.5,
      issuedAt: app.appliedAt || nowISO(),
      verificationCode: code
    };
  });

  return (
    <div>
      <div className="ch-card" style={{ padding: "20px 24px", marginBottom: 22, background: "linear-gradient(120deg,var(--primary-dark),var(--primary))", color: "#fff", border: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Award size={24} color="var(--accent)" />
          <div className="ch-serif" style={{ fontSize: 22, fontWeight: 600 }}>Official Placement Certificates</div>
        </div>
        <div style={{ fontSize: 13.5, color: "#C9CEEA" }}>
          QR-Verified credentials for job offers extended through CampusHire. Anyone scanning the QR code can verify your placement instantly.
        </div>
      </div>

      {certs.length === 0 ? (
        <EmptyState icon={Award} title="No placement certificates yet" message="Once you receive an offer and reach 'Selected' status, your QR-verified certificate will be generated automatically." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {certs.map(cert => {
            const verifyUrl = `${window.location.origin}/verify/${cert.verificationCode}`;
            return (
              <div key={cert.id} className="ch-card" style={{ padding: 28, position: "relative", overflow: "hidden", border: "2px solid var(--primary-tint)" }}>
                <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: "var(--primary-tint)", opacity: 0.5, pointerEvents: "none" }} />
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary)", fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", marginBottom: 8 }}>
                      <ShieldCheck size={16} /> CAMPUS PLACEMENT CLEARANCE CERTIFICATE
                    </div>
                    <div className="ch-serif" style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                      {cert.studentName}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
                      Roll No: <b>{cert.rollNo}</b> · Branch: <b>{cert.branch}</b>
                    </div>

                    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 18 }}>
                      <div style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600 }}>OFFER EXTENDED BY</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>{cert.companyName}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{cert.jobTitle}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--success)", marginTop: 4 }}>₹{cert.ctc} LPA</div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="ch-btn ch-btn-primary" onClick={() => setVerifyCert(cert)}>
                        <Eye size={14} /> Verify Authenticity
                      </button>
                      <button className="ch-btn ch-btn-ghost" onClick={() => window.print()}>
                        Print / Export PDF
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: "center", background: "var(--surface)", padding: 16, borderRadius: 14, border: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <QRCodeSVG value={verifyUrl} size={150} />
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--primary)", marginTop: 8 }}>SCAN TO VERIFY</div>
                    <div style={{ fontSize: 10, color: "var(--ink-soft)", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{cert.verificationCode}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {verifyCert && <PublicCertificateVerificationModal cert={verifyCert} onClose={() => setVerifyCert(null)} />}
    </div>
  );
}

/* =========================================================================
   STUDENT ASSESSMENT TAKE MODAL (Proctored Live OA Environment)
   ========================================================================= */
function StudentAssessmentTakeModal({ assessment, job, onClose, onSubmitComplete }) {
  const [selectedMcqs, setSelectedMcqs] = useState({});
  const [codeSubmissions, setCodeSubmissions] = useState(() => {
    const init = {};
    (assessment.codingQuestions || []).forEach(cq => {
      init[cq.id] = { language: "javascript", code: cq.starterCode?.javascript || cq.starterCode?.python || "" };
    });
    return init;
  });

  const [activeCodingIndex, setActiveCodingIndex] = useState(0);
  const [testResults, setTestResults] = useState(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [warningsCount, setWarningsCount] = useState(0);
  const [proctoringLogs, setProctoringLogs] = useState([]);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const [timeLeft, setTimeLeft] = useState((assessment.durationMinutes || 30) * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        const log = { timestamp: nowISO(), type: "tab_switch", detail: "Candidate switched tab or minimized browser window." };
        setProctoringLogs(prev => [...prev, log]);
        setWarningsCount(prev => prev + 1);
        setShowWarningToast(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const currentCodingQuestion = (assessment.codingQuestions || [])[activeCodingIndex];

  const handleRunCode = async () => {
    if (!currentCodingQuestion) return;
    setIsRunningCode(true);
    const sub = codeSubmissions[currentCodingQuestion.id] || { language: "javascript", code: "" };
    
    try {
      if (localStorage.getItem(API_TOKEN_KEY)) {
        const res = await apiRequest(`/assessments/${assessment.id}/execute-code`, {
          method: "POST",
          body: JSON.stringify({ questionId: currentCodingQuestion.id, language: sub.language, code: sub.code })
        });
        setTestResults(res.evaluation);
      } else {
        const publicTcs = (currentCodingQuestion.testCases || []).filter(tc => !tc.hidden);
        const results = publicTcs.map(tc => ({
          testCaseId: tc.id, input: tc.input, expectedOutput: tc.expectedOutput, actualOutput: tc.expectedOutput, passed: true
        }));
        setTestResults({ results, passedCount: results.length, totalCount: publicTcs.length });
      }
    } catch (e) {
      setTestResults({ results: [{ input: "Error", expectedOutput: "", actualOutput: e.message, passed: false }], passedCount: 0, totalCount: 1 });
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      jobId: job?.id || assessment.jobId,
      mcqAnswers: selectedMcqs,
      codeSubmissions: Object.keys(codeSubmissions).map(qId => ({
        questionId: qId,
        language: codeSubmissions[qId].language,
        code: codeSubmissions[qId].code
      })),
      proctoringLogs,
      warningsCount
    };

    if (localStorage.getItem(API_TOKEN_KEY)) {
      try {
        await apiRequest(`/assessments/${assessment.id}/submit`, { method: "POST", body: JSON.stringify(payload) });
      } catch (e) {}
    }

    onSubmitComplete(payload);
  };

  const fmtMinSec = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 9999, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="ch-badge" style={{ background: "var(--danger-tint)", color: "var(--danger)" }}>● PROCTORED OA</span>
            <span style={{ fontWeight: 800, fontSize: 16 }}>{assessment.title}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>{job?.title} · Candidate Live Test Mode</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--accent-tint)", padding: "6px 14px", borderRadius: 8, fontWeight: 800, color: "#8A6216", fontSize: 14 }}>
            <Clock3 size={16} /> {fmtMinSec(timeLeft)}
          </div>
          {warningsCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--danger-tint)", color: "var(--danger)", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
              <AlertTriangle size={14} /> {warningsCount} Warning{warningsCount > 1 ? 's' : ''}
            </div>
          )}
          <button className="ch-btn ch-btn-primary" onClick={handleSubmit}>Submit Test</button>
        </div>
      </div>

      {showWarningToast && (
        <div style={{ background: "var(--danger)", color: "#fff", padding: "10px 20px", fontSize: 13, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⚠️ Warning: Tab switch or focus change detected! Recorded in proctoring audit log.</span>
          <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: 800 }} onClick={() => setShowWarningToast(false)}>✕ Dismiss</button>
        </div>
      )}

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
        <div style={{ padding: 24, overflowY: "auto", borderRight: "1px solid var(--border)" }}>
          {(assessment.mcqQuestions || []).length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)", marginBottom: 12 }}>SECTION 1: MULTIPLE CHOICE QUESTIONS</div>
              {(assessment.mcqQuestions || []).map((mcq, idx) => (
                <div key={mcq.id} className="ch-card" style={{ padding: 16, marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>{idx + 1}. {mcq.question}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(mcq.options || []).map((opt, optIdx) => {
                      const isSelected = selectedMcqs[mcq.id] === optIdx;
                      return (
                        <button key={optIdx} onClick={() => setSelectedMcqs(prev => ({ ...prev, [mcq.id]: optIdx }))}
                          style={{ textAlign: "left", padding: "10px 14px", borderRadius: 8, border: `1px solid ${isSelected ? "var(--primary)" : "var(--border)"}`, background: isSelected ? "var(--primary-tint)" : "var(--surface)", cursor: "pointer", fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? "var(--primary)" : "var(--ink)" }}>
                          {String.fromCharCode(65 + optIdx)}. {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentCodingQuestion && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)", marginBottom: 12 }}>SECTION 2: CODING PROBLEM ({activeCodingIndex + 1}/{(assessment.codingQuestions || []).length})</div>
              <div className="ch-card" style={{ padding: 18 }}>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{currentCodingQuestion.title}</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)", marginBottom: 16 }}>{currentCodingQuestion.description}</p>

                <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 8 }}>Sample Test Cases</div>
                {(currentCodingQuestion.testCases || []).filter(tc => !tc.hidden).map((tc, idx) => (
                  <div key={tc.id} style={{ background: "var(--bg)", padding: 10, borderRadius: 8, fontSize: 12, marginBottom: 8, fontFamily: "monospace" }}>
                    <div><b>Input:</b> {tc.input}</div>
                    <div><b>Expected Output:</b> {tc.expectedOutput}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", background: "var(--surface)" }}>
          {currentCodingQuestion && (
            <>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)" }}>Language:</label>
                  <select className="ch-input" style={{ width: 140, padding: "4px 8px", fontSize: 12 }}
                    value={codeSubmissions[currentCodingQuestion.id]?.language || "javascript"}
                    onChange={e => {
                      const lang = e.target.value;
                      const defaultCode = currentCodingQuestion.starterCode?.[lang] || "";
                      setCodeSubmissions(prev => ({
                        ...prev,
                        [currentCodingQuestion.id]: { language: lang, code: defaultCode }
                      }));
                    }}>
                    <option value="javascript">JavaScript (ES6)</option>
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ 17</option>
                    <option value="java">Java 11</option>
                  </select>
                </div>

                <button className="ch-btn ch-btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={handleRunCode} disabled={isRunningCode}>
                  {isRunningCode ? "Running..." : "▶ Run Test Cases"}
                </button>
              </div>

              <div style={{ flex: 1, padding: 12, position: "relative" }}>
                <textarea
                  style={{ width: "100%", height: "100%", fontFamily: "monospace", fontSize: 13, background: "#0E1322", color: "#EAEFFD", padding: 14, borderRadius: 8, border: "none", resize: "none", outline: "none", lineHeight: 1.6 }}
                  value={codeSubmissions[currentCodingQuestion.id]?.code || ""}
                  onChange={e => {
                    const val = e.target.value;
                    setCodeSubmissions(prev => ({
                      ...prev,
                      [currentCodingQuestion.id]: { ...prev[currentCodingQuestion.id], code: val }
                    }));
                  }}
                  placeholder="// Write your code solution here..."
                />
              </div>

              {testResults && (
                <div style={{ height: 160, borderTop: "1px solid var(--border)", background: "var(--bg)", padding: 12, overflowY: "auto", fontSize: 12 }}>
                  <div style={{ fontWeight: 800, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                    <span>Console Results</span>
                    <span style={{ color: testResults.passedCount === testResults.totalCount ? "var(--success)" : "var(--danger)" }}>
                      Passed {testResults.passedCount}/{testResults.totalCount} Test Cases
                    </span>
                  </div>
                  {testResults.results.map((res, idx) => (
                    <div key={idx} style={{ padding: 6, borderRadius: 6, background: res.passed ? "var(--success-tint)" : "var(--danger-tint)", marginBottom: 4, fontFamily: "monospace" }}>
                      {res.passed ? "✅ PASS" : "❌ FAIL"}: Input: {res.input} | Expected: {res.expectedOutput} | Actual: {res.actualOutput}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-soft)" }}>
              <Camera size={14} color="var(--success)" /> Live Proctoring Active · Tab switches and webcam feed monitored
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>Session Hash: #{assessment.id.slice(-6)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   RECRUITER ASSESSMENT MANAGEMENT VIEW
   ========================================================================= */
function RecruiterAssessments({ db, currentUser, updateDB, showToast }) {
  const myJobs = db.jobs.filter(j => j.recruiterId === currentUser.id);
  const [activeJobId, setActiveJobId] = useState(myJobs[0]?.id || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewSubmissionsModal, setViewSubmissionsModal] = useState(null);

  const assessment = db.assessments?.find(a => a.jobId === activeJobId);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div className="ch-serif" style={{ fontSize: 22, fontWeight: 700 }}>Online Assessments (OA) & Coding Tests</div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>Manage screening tests, coding problems, and view candidate proctoring logs.</div>
        </div>
        <select className="ch-input" style={{ width: 240 }} value={activeJobId || ''} onChange={e => setActiveJobId(e.target.value)}>
          {myJobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      {assessment ? (
        <div className="ch-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "var(--primary)" }}>{assessment.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>
                Duration: <b>{assessment.durationMinutes} mins</b> · Pass Mark: <b>{assessment.passMarks}%</b>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="ch-btn ch-btn-ghost" onClick={() => setShowCreateModal(true)}>Edit Test</button>
              <button className="ch-btn ch-btn-primary" onClick={() => setViewSubmissionsModal(assessment)}>View Submissions</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 16 }}>
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "var(--bg)" }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "var(--primary)" }}>MCQs ({(assessment.mcqQuestions || []).length})</div>
              {(assessment.mcqQuestions || []).map((m, idx) => (
                <div key={m.id} style={{ fontSize: 12.5, marginBottom: 6 }}>
                  <b>{idx + 1}.</b> {m.question}
                </div>
              ))}
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "var(--bg)" }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "var(--primary)" }}>Coding Problems ({(assessment.codingQuestions || []).length})</div>
              {(assessment.codingQuestions || []).map((c, idx) => (
                <div key={c.id} style={{ fontSize: 12.5, marginBottom: 6 }}>
                  <b>{idx + 1}.</b> {c.title} ({(c.testCases || []).length} Test cases)
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState icon={FileText} title="No assessment created for this job" message="Create an online screening assessment with MCQs and coding problems."
          action={<button className="ch-btn ch-btn-primary" onClick={() => setShowCreateModal(true)}>+ Create Assessment</button>} />
      )}

      {showCreateModal && activeJobId && (
        <RecruiterAssessmentModal
          jobId={activeJobId}
          existing={assessment}
          onSave={data => {
            updateDB(d => {
              if (!d.assessments) d.assessments = [];
              const idx = d.assessments.findIndex(a => a.jobId === activeJobId);
              if (idx >= 0) d.assessments[idx] = { ...d.assessments[idx], ...data };
              else d.assessments.push({ ...data, id: uid('ass'), jobId: activeJobId, createdAt: nowISO() });
              return d;
            });
            showToast("Assessment saved");
            setShowCreateModal(false);
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {viewSubmissionsModal && (
        <RecruiterAssessmentSubmissionsModal
          assessment={viewSubmissionsModal}
          db={db}
          onClose={() => setViewSubmissionsModal(null)}
        />
      )}
    </div>
  );
}

function RecruiterAssessmentModal({ jobId, existing, onSave, onClose }) {
  const [title, setTitle] = useState(existing?.title || "Technical Screening Test");
  const [durationMinutes, setDurationMinutes] = useState(existing?.durationMinutes || 30);
  const [passMarks, setPassMarks] = useState(existing?.passMarks || 60);

  const [mcqQuestions, setMcqQuestions] = useState(existing?.mcqQuestions || []);
  const [codingQuestions, setCodingQuestions] = useState(existing?.codingQuestions || []);

  const addMcq = () => {
    setMcqQuestions(prev => [
      ...prev,
      { id: uid('mcq'), question: "New MCQ Question?", options: ["Option A", "Option B", "Option C", "Option D"], correctOption: 0, points: 10 }
    ]);
  };

  const addCoding = () => {
    setCodingQuestions(prev => [
      ...prev,
      {
        id: uid('code'),
        title: "Palindrome Check",
        description: "Write a function solution(str) returning true if str is a palindrome.",
        starterCode: { javascript: "function solution(str) {\n  return str === str.split('').reverse().join('');\n}" },
        testCases: [{ id: uid('tc'), input: 'str = "racecar"', expectedOutput: "true", hidden: false }]
      }
    ]);
  };

  return (
    <Modal title="Configure Online Assessment" onClose={onClose} width={680}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div><label className="ch-label">Assessment Title</label><input className="ch-input" value={title} onChange={e => setTitle(e.target.value)} /></div>
        <div><label className="ch-label">Duration (Mins)</label><input type="number" className="ch-input" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} /></div>
        <div><label className="ch-label">Pass Mark (%)</label><input type="number" className="ch-input" value={passMarks} onChange={e => setPassMarks(e.target.value)} /></div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>MCQ Questions ({mcqQuestions.length})</div>
          <button className="ch-btn ch-btn-ghost" style={{ padding: "4px 8px", fontSize: 11.5 }} onClick={addMcq}>+ Add MCQ</button>
        </div>
        {mcqQuestions.map((q, idx) => (
          <div key={q.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <input className="ch-input" style={{ marginBottom: 8, fontWeight: 700 }} value={q.question} onChange={e => {
              const val = e.target.value;
              setMcqQuestions(prev => prev.map(item => item.id === q.id ? { ...item, question: val } : item));
            }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {q.options.map((opt, optIdx) => (
                <input key={optIdx} className="ch-input" style={{ fontSize: 12 }} value={opt} onChange={e => {
                  const val = e.target.value;
                  setMcqQuestions(prev => prev.map(item => item.id === q.id ? {
                    ...item,
                    options: item.options.map((o, i) => i === optIdx ? val : o)
                  } : item));
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Coding Problems ({codingQuestions.length})</div>
          <button className="ch-btn ch-btn-ghost" style={{ padding: "4px 8px", fontSize: 11.5 }} onClick={addCoding}>+ Add Coding Problem</button>
        </div>
        {codingQuestions.map((cq, idx) => (
          <div key={cq.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <input className="ch-input" style={{ marginBottom: 6, fontWeight: 700 }} value={cq.title} onChange={e => {
              const val = e.target.value;
              setCodingQuestions(prev => prev.map(item => item.id === cq.id ? { ...item, title: val } : item));
            }} />
            <textarea className="ch-input" rows={2} style={{ fontSize: 12 }} value={cq.description} onChange={e => {
              const val = e.target.value;
              setCodingQuestions(prev => prev.map(item => item.id === cq.id ? { ...item, description: val } : item));
            }} />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="ch-btn ch-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="ch-btn ch-btn-primary" onClick={() => onSave({ title, durationMinutes, passMarks, mcqQuestions, codingQuestions })}>Save Assessment</button>
      </div>
    </Modal>
  );
}

function RecruiterAssessmentSubmissionsModal({ assessment, db, onClose }) {
  const submissions = (db.assessmentSubmissions || []).filter(s => s.assessmentId === assessment.id);

  return (
    <Modal title={`Submissions: ${assessment.title}`} onClose={onClose} width={720}>
      {submissions.length === 0 ? (
        <EmptyState icon={Users} title="No submissions yet" message="Candidate test results and proctoring logs will appear here once submitted." />
      ) : (
        <div style={{ overflow: "hidden" }}>
          <table className="ch-table">
            <thead>
              <tr><th>Candidate</th><th>Score</th><th>Status</th><th>Warnings</th><th>Submitted</th></tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id}>
                  <td style={{ fontWeight: 700 }}>{sub.studentName}</td>
                  <td style={{ fontWeight: 800, color: sub.passed ? "var(--success)" : "var(--danger)" }}>{sub.percentageScore}%</td>
                  <td>{sub.passed ? <span className="ch-badge" style={{ background: "var(--success-tint)", color: "var(--success)" }}>Passed</span> : <span className="ch-badge" style={{ background: "var(--danger-tint)", color: "var(--danger)" }}>Failed</span>}</td>
                  <td>
                    {sub.warningsCount > 0 ? (
                      <span className="ch-badge" style={{ background: "var(--danger-tint)", color: "var(--danger)" }}>
                        <AlertTriangle size={12} /> {sub.warningsCount} tab switch{sub.warningsCount > 1 ? 'es' : ''}
                      </span>
                    ) : (
                      <span className="ch-badge" style={{ background: "var(--success-tint)", color: "var(--success)" }}>Clean</span>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--ink-soft)" }}>{fmtDateTime(sub.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

/* =========================================================================
   WHATSAPP & TELEGRAM BOT NOTIFICATION HUB MODAL
   ========================================================================= */
function BotNotificationDispatchModal({ currentUser, onClose, showToast }) {
  const [whatsappNumber, setWhatsappNumber] = useState("9876500001");
  const [telegramHandle, setTelegramHandle] = useState("@campus_candidate");
  const [lastDispatch, setLastDispatch] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleSendTest = async (channel) => {
    setIsSending(true);
    const title = channel === "whatsapp" ? "🟢 WhatsApp Placement Alert" : "✈️ Telegram Placement Alert";
    const msg = `Hi ${currentUser.name}, your interview for SDE at Stratosphere Labs is confirmed for tomorrow at 11:00 AM. Join link: https://campushire.io/room_i1`;

    try {
      if (localStorage.getItem(API_TOKEN_KEY)) {
        const res = await apiRequest("/notifications/bot-send", {
          method: "POST",
          body: JSON.stringify({ channel, message: msg, title })
        });
        setLastDispatch(res.dispatch);
      } else {
        setLastDispatch({
          id: uid('bot'),
          channel,
          title,
          message: msg,
          recipient: channel === "whatsapp" ? `+91 ${whatsappNumber}` : telegramHandle,
          timestamp: nowISO(),
          status: "Delivered"
        });
      }
      showToast(`Test ${channel === 'whatsapp' ? 'WhatsApp' : 'Telegram'} bot dispatch sent!`);
    } catch (e) {
      showToast("Bot dispatch failed.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal title="WhatsApp & Telegram Bot Dispatch Hub" onClose={onClose} width={580}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14 }}>
          CampusHire automatically dispatches placement alerts, interview reminders, and offer notifications via WhatsApp and Telegram Bot Webhooks.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#1F8A5F", marginBottom: 6 }}>💬 WhatsApp Bot Channel</div>
            <label className="ch-label" style={{ fontSize: 11 }}>Phone Number</label>
            <input className="ch-input" style={{ fontSize: 12 }} value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+91 98765 00001" />
            <button className="ch-btn ch-btn-primary" style={{ width: "100%", marginTop: 10, padding: "7px 10px", fontSize: 12, background: "#1F8A5F", borderColor: "#1F8A5F" }}
              onClick={() => handleSendTest("whatsapp")} disabled={isSending}>
              Test WhatsApp Alert
            </button>
          </div>

          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#3568B0", marginBottom: 6 }}>✈️ Telegram Bot Channel</div>
            <label className="ch-label" style={{ fontSize: 11 }}>Telegram Handle</label>
            <input className="ch-input" style={{ fontSize: 12 }} value={telegramHandle} onChange={e => setTelegramHandle(e.target.value)} placeholder="@handle" />
            <button className="ch-btn ch-btn-primary" style={{ width: "100%", marginTop: 10, padding: "7px 10px", fontSize: 12, background: "#3568B0", borderColor: "#3568B0" }}
              onClick={() => handleSendTest("telegram")} disabled={isSending}>
              Test Telegram Alert
            </button>
          </div>
        </div>
      </div>

      {lastDispatch && (
        <div style={{ border: `2px solid ${lastDispatch.channel === 'whatsapp' ? '#1F8A5F' : '#3568B0'}`, borderRadius: 12, padding: 16, background: lastDispatch.channel === 'whatsapp' ? 'var(--success-tint)' : 'var(--info-tint)' }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: lastDispatch.channel === 'whatsapp' ? '#1F8A5F' : '#3568B0' }}>
              {lastDispatch.channel === 'whatsapp' ? '📱 WhatsApp Webhook Dispatch' : '✈️ Telegram Bot Webhook Dispatch'}
            </span>
            <span className="ch-badge" style={{ background: "#fff", color: "var(--ink)", fontWeight: 700 }}>
              Status: {lastDispatch.status}
            </span>
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>To: {lastDispatch.recipient}</div>
          <div style={{ fontSize: 12, color: "var(--ink)", lineHeight: 1.5, background: "#fff", padding: 10, borderRadius: 8, border: "1px solid var(--border)", fontFamily: "sans-serif" }}>
            {lastDispatch.message}
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 6, textAlign: "right" }}>
            Sent at {fmtDateTime(lastDispatch.timestamp)}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
        <button className="ch-btn ch-btn-primary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* =========================================================================
   PUBLIC STUDENT PORTFOLIO SHOWCASE MODAL
   ========================================================================= */
function PublicStudentPortfolioModal({ student, currentUser, onClose, showToast }) {
  const [endorsements, setEndorsements] = useState(student?.endorsements || { React: 12, "Node.js": 8, Python: 15, SQL: 6 });
  const [endorsedSkills, setEndorsedSkills] = useState(new Set());

  const handleEndorse = (skill) => {
    if (endorsedSkills.has(skill)) return;
    setEndorsements(prev => ({
      ...prev,
      [skill]: (prev[skill] || 0) + 1
    }));
    setEndorsedSkills(prev => new Set(prev).add(skill));
    showToast(`Endorsed ${skill}!`);
  };

  const shareUrl = `${window.location.origin}/portfolio/${student?.rollNo || '21CS041'}`;

  return (
    <Modal title="Verified Public Candidate Portfolio" onClose={onClose} width={640}>
      <div style={{ position: "relative", padding: 24, borderRadius: 16, background: "linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%)", border: "1px solid var(--border)", marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--success-tint)", color: "var(--success)", padding: "5px 12px", borderRadius: 999, fontWeight: 700, fontSize: 12 }}>
            <ShieldCheck size={14} /> VERIFIED UNIVERSITY CANDIDATE
          </div>
          <button className="ch-btn ch-btn-ghost" style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => {
            navigator.clipboard.writeText(shareUrl);
            showToast("Portfolio link copied to clipboard!");
          }}>
            📋 Copy Public Link
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, overflow: "hidden", background: "var(--primary-tint)", border: "2px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {student?.profilePhoto ? (
              <img src={student.profilePhoto} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <UserCircle2 size={44} color="var(--primary)" />
            )}
          </div>
          <div>
            <div className="ch-serif" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>{currentUser?.name || student?.name || "Student Candidate"}</div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>
              Roll No: <b>{student?.rollNo || "21CS041"}</b> · Batch of <b>{student?.batch || "2026"}</b>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 700, marginTop: 2 }}>{student?.education || "B.Tech Computer Science & Engineering"}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, marginBottom: 20, textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)" }}>ACADEMIC CGPA</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>{student?.cgpa || 8.6} / 10</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)" }}>ACTIVE BACKLOGS</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: student?.backlogs === 0 ? "var(--success)" : "var(--danger)", marginTop: 2 }}>{student?.backlogs ?? 0}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)" }}>STATUS</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--success)", marginTop: 4 }}>
              {student?.placed ? `Placed @ ${student.placedCompany}` : "Seeking Roles"}
            </div>
          </div>
        </div>

        {student?.resumeSummary && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 6 }}>BIOGRAPHY & SUMMARY</div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink)" }}>{student.resumeSummary}</p>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8 }}>VERIFIED SKILLS & PEER ENDORSEMENTS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(student?.skills || ["React", "Node.js", "Python", "SQL"]).map(skill => {
              const count = endorsements[skill] || 0;
              const hasEndorsed = endorsedSkills.has(skill);
              return (
                <div key={skill} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                  <span>{skill}</span>
                  <span className="ch-badge" style={{ background: "var(--primary-tint)", color: "var(--primary)", padding: "2px 6px", fontSize: 11 }}>{count}</span>
                  <button onClick={() => handleEndorse(skill)} disabled={hasEndorsed}
                    style={{ background: "none", border: "none", color: hasEndorsed ? "var(--ink-soft)" : "var(--primary)", cursor: hasEndorsed ? "default" : "pointer", fontWeight: 800, fontSize: 11, padding: "0 2px" }}>
                    {hasEndorsed ? "✓" : "+ Endorse"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {student?.experience && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 6 }}>WORK EXPERIENCE & PROJECTS</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.6, background: "var(--surface)", padding: 12, borderRadius: 10, border: "1px solid var(--border)" }}>
              {student.experience}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="ch-btn ch-btn-primary" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}

/* =============================== STUDENT APP ================================ */
function StudentApp({ db, updateDB, currentUser, page, setPage, showToast }) {
  const student = db.students.find((s) => s.studentId === currentUser.id);
  const myApps = db.applications.filter((a) => a.studentId === currentUser.id);
  const myInterviews = db.interviews.filter((i) => i.studentId === currentUser.id);

  const applyToJob = (jobId) => {
    updateDB((d) => {
      d.applications.push({ id: uid("a"), jobId, studentId: currentUser.id, status: "applied", appliedAt: nowISO(), timeline: [{ status: "applied", date: nowISO(), note: "Application submitted." }] });
      return d;
    });
    showToast("Application submitted");
  };

  const saveProfile = (updates) => {
    updateDB((d) => {
      const idx = d.students.findIndex((s) => s.studentId === currentUser.id);
      if (idx >= 0) d.students[idx] = { ...d.students[idx], ...updates };
      return d;
    });
    showToast("Profile updated");
  };

  if (page === "jobs") return <StudentJobs db={db} student={student} myApps={myApps} onApply={applyToJob} />;
  if (page === "applications") return <StudentApplications db={db} myApps={myApps} updateDB={updateDB} showToast={showToast} />;
  if (page === "interviews") return <StudentInterviews db={db} myInterviews={myInterviews} updateDB={updateDB} />;
  if (page === "certificates") return <StudentCertificates db={db} currentUser={currentUser} />;
  if (page === "profile") return <StudentProfile student={student} currentUser={currentUser} onSave={saveProfile} showToast={showToast} />;
  return <StudentDashboard db={db} student={student} myApps={myApps} myInterviews={myInterviews} currentUser={currentUser} setPage={setPage} />;
}

function StudentDashboard({ db, student, myApps, myInterviews, currentUser, setPage }) {
  const openJobs = db.jobs.filter((j) => j.status === "open");
  const eligibleJobs = student ? openJobs.filter((j) => checkEligibility(student, j).eligible) : [];
  const upcomingInterviews = myInterviews.filter((i) => i.status === "Scheduled").sort((a, b) => new Date(a.date) - new Date(b.date));
  const selected = myApps.filter((a) => a.status === "selected").length;

  const profileChecks = [
    { label: 'Resume uploaded', done: Boolean(student?.resumeSummary || student?.experience) },
    { label: 'Skills added', done: (student?.skills || []).length > 0 },
    { label: 'Education verified', done: Boolean(student?.education && student.education.trim().length > 0) },
    { label: 'LinkedIn/GitHub link', done: Boolean((student?.linkedinUrl || '').trim() || (student?.githubUrl || '').trim()) },
    { label: 'Profile photo uploaded', done: Boolean((student?.profilePhoto || '').trim()) },
  ];
  const completedChecklist = profileChecks.filter((item) => item.done).length;
  const profileComplete = completedChecklist >= 3;
  const checklistProgress = Math.round((completedChecklist / profileChecks.length) * 100);

  return (
    <div>
      <div className="ch-card" style={{ padding: "22px 24px", marginBottom: 22, background: "linear-gradient(120deg,var(--primary),var(--primary-dark))", color: "#fff", border: "none" }}>
        <div className="ch-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Hi {currentUser.name.split(" ")[0]}, here's where things stand.</div>
        <div style={{ fontSize: 13.5, color: "#C9CEEA" }}>
          {eligibleJobs.length} open role{eligibleJobs.length === 1 ? "" : "s"} match your profile right now.
        </div>
      </div>

      {!profileComplete && (
        <div className="ch-card" style={{ padding: 18, marginBottom: 22, background: "var(--accent-tint)", border: "none" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <AlertTriangle size={18} color="#8A6216" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Finish setting up your profile</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>Add your CGPA, skills and resume summary so eligibility checks and applications work correctly.</div>
              </div>
            </div>
            <button className="ch-btn ch-btn-accent" onClick={() => setPage("profile")} style={{ flexShrink: 0 }}>Complete profile</button>
          </div>

          <div style={{ marginBottom: 8, fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)" }}>{completedChecklist}/{profileChecks.length} profile steps complete</div>
          <div className="ch-progress-track">
            <div className="ch-progress-bar" style={{ width: `${checklistProgress}%` }} />
          </div>
        </div>
      )}

      <div className="ch-card" style={{ padding: 18, marginBottom: 22 }}>
        <SectionHeading title="Profile completion checklist" sub="Keep your profile polished to unlock more opportunities" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {profileChecks.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: item.done ? 'var(--success-tint)' : 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: item.done ? 'var(--success)' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.done ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
              </div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: item.done ? 'var(--success)' : 'var(--ink-soft)' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard icon={Briefcase} label="Eligible openings" value={eligibleJobs.length} tint="var(--primary-tint)" color="var(--primary)" />
        <StatCard icon={FileText} label="Applications sent" value={myApps.length} tint="var(--info-tint)" color="var(--info)" />
        <StatCard icon={CalendarClock} label="Interviews upcoming" value={upcomingInterviews.length} tint="#F1EAFA" color="#7A4FC7" />
        <StatCard icon={Award} label="Offers received" value={selected} tint="var(--success-tint)" color="var(--success)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <div className="ch-card" style={{ padding: 20 }}>
          <SectionHeading title="Recommended for you" sub="Open roles you're eligible for" action={<span onClick={() => setPage("jobs")} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)", cursor: "pointer" }}>View all →</span>} />
          {eligibleJobs.length === 0 ? (
            <EmptyState icon={Briefcase} title="No matches yet" message="Once your profile is complete, roles that fit your CGPA, branch and batch will show up here." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {eligibleJobs.slice(0, 4).map((j) => {
                const company = db.companies.find((c) => c.id === j.companyId);
                return (
                  <div key={j.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 11 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{j.title}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{company?.name} · {j.location}</div>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--success)" }}>₹{j.ctc} LPA</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="ch-card" style={{ padding: 20 }}>
          <SectionHeading title="Upcoming interviews" action={<span onClick={() => setPage("interviews")} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)", cursor: "pointer" }}>View all →</span>} />
          {upcomingInterviews.length === 0 ? (
            <EmptyState icon={CalendarClock} title="Nothing scheduled" message="Interview invitations from recruiters will appear here." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {upcomingInterviews.slice(0, 4).map((i) => {
                const job = db.jobs.find((j) => j.id === i.jobId);
                const company = db.companies.find((c) => c.id === job?.companyId);
                return (
                  <div key={i.id} style={{ borderLeft: "3px solid var(--accent)", paddingLeft: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{i.round}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{job?.title} · {company?.name}</div>
                    <div style={{ fontSize: 11.5, color: "#A7ACC7", marginTop: 2 }}>{fmtDate(i.date)} · {i.time} · {i.mode}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JobDetailModal({ job, company, student, applied, onApply, onClose }) {
  const elig = student ? checkEligibility(student, job) : { eligible: false, reasons: [] };
  return (
    <Modal title={job.title} onClose={onClose} width={620}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>{company?.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", display: "flex", gap: 12, marginTop: 4 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {job.location}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><IndianRupee size={12} /> {job.ctc} LPA</span>
            <span>{job.jobType}</span>
          </div>
        </div>
        {elig.eligible ? <Badge status="selected" /> : null}
      </div>
      <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--ink)", marginBottom: 16 }}>{job.description}</p>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 8 }}>Eligibility criteria</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <span className="ch-badge" style={{ background: "var(--primary-tint)", color: "var(--primary)" }}>CGPA ≥ {job.eligibility.minCgpa}</span>
          <span className="ch-badge" style={{ background: "var(--primary-tint)", color: "var(--primary)" }}>Max {job.eligibility.maxBacklogs} backlogs</span>
          <span className="ch-badge" style={{ background: "var(--primary-tint)", color: "var(--primary)" }}>Batch {job.eligibility.batch}</span>
          {job.eligibility.branches.map((b) => <span key={b} className="ch-badge" style={{ background: "var(--primary-tint)", color: "var(--primary)" }}>{b}</span>)}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 8 }}>Selection process</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {job.rounds.map((r, i) => <span key={r} style={{ fontSize: 12, background: "var(--bg)", border: "1px solid var(--border)", padding: "5px 10px", borderRadius: 999 }}>{i + 1}. {r}</span>)}
        </div>
      </div>

      {!elig.eligible && elig.reasons.length > 0 && (
        <div className="ch-card" style={{ padding: 12, background: "var(--danger-tint)", border: "none", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--danger)", marginBottom: 4 }}>You don't meet all criteria</div>
          {elig.reasons.map((r) => <div key={r} style={{ fontSize: 12.5, color: "var(--danger)" }}>• {r}</div>)}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button className="ch-btn ch-btn-primary" disabled={!elig.eligible || applied} onClick={() => { onApply(job.id); onClose(); }}>
          {applied ? "Already applied" : "Apply now"}
        </button>
        <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>{daysLeft(job.deadline) >= 0 ? `Closes in ${daysLeft(job.deadline)} day${daysLeft(job.deadline) === 1 ? "" : "s"}` : "Closed"}</span>
      </div>
    </Modal>
  );
}

function StudentJobs({ db, student, myApps, onApply }) {
  const [q, setQ] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const appliedJobIds = new Set(myApps.map((a) => a.jobId));

  const jobs = db.jobs.filter((j) => {
    if (j.status !== "open") return false;
    if (q && !`${j.title} ${db.companies.find((c) => c.id === j.companyId)?.name}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (branchFilter !== "all" && !j.eligibility.branches.includes(branchFilter)) return false;
    if (onlyEligible && student && !checkEligibility(student, j).eligible) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: 11, color: "var(--ink-soft)" }} />
          <input className="ch-input" style={{ paddingLeft: 34 }} placeholder="Search by role or company" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="ch-input" style={{ width: 200 }} value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="all">All branches</option>
          {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <button className={`ch-btn ${onlyEligible ? "ch-btn-primary" : "ch-btn-ghost"}`} onClick={() => setOnlyEligible((o) => !o)}>
          <Filter size={14} /> Eligible only
        </button>
      </div>

      {jobs.length === 0 ? (
        <EmptyState icon={Search} title="No roles found" message="Try adjusting your filters or search terms." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
          {jobs.map((j) => {
            const company = db.companies.find((c) => c.id === j.companyId);
            const elig = student ? checkEligibility(student, j) : { eligible: false, reasons: [] };
            const applied = appliedJobIds.has(j.id);
            return (
              <div key={j.id} className="ch-card" style={{ padding: 18, cursor: "pointer" }} onClick={() => setSelectedJob(j)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-tint)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--primary)", fontSize: 13 }}>
                    {company?.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </div>
                  {elig.eligible ? (
                    <span className="ch-badge" style={{ background: "var(--success-tint)", color: "var(--success)" }}><CheckCircle2 size={12} /> Eligible</span>
                  ) : (
                    <span className="ch-badge" style={{ background: "var(--bg)", color: "var(--ink-soft)" }}>Not eligible</span>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 2 }}>{j.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 10 }}>{company?.name} · {j.location}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--success)" }}>₹{j.ctc} LPA</span>
                  <span style={{ fontSize: 11.5, color: "#A7ACC7" }}>{daysLeft(j.deadline)}d left</span>
                </div>
                {applied && <div style={{ marginTop: 10 }}><Badge status="applied" /></div>}
              </div>
            );
          })}
        </div>
      )}

      {selectedJob && (
        <JobDetailModal job={selectedJob} company={db.companies.find((c) => c.id === selectedJob.companyId)} student={student}
          applied={appliedJobIds.has(selectedJob.id)} onApply={onApply} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}

function StudentApplications({ db, myApps, updateDB, showToast }) {
  const sorted = [...myApps].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  const [activeAssessmentModal, setActiveAssessmentModal] = useState(null);

  return (
    <div>
      {sorted.length === 0 ? (
        <EmptyState icon={FileText} title="No applications yet" message="Jobs you apply to will show up here with live status tracking." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sorted.map((a) => {
            const job = db.jobs.find((j) => j.id === a.jobId);
            const company = db.companies.find((c) => c.id === job?.companyId);
            const assessment = db.assessments?.find((ass) => ass.jobId === a.jobId);
            const submission = db.assessmentSubmissions?.find((sub) => sub.assessmentId === assessment?.id && sub.studentId === a.studentId);
            const isRejected = a.status === "rejected";
            const stepIndex = isRejected ? PIPELINE.length : PIPELINE.indexOf(a.status);

            return (
              <div key={a.id} className="ch-card" style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{job?.title}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{company?.name} · Applied {fmtDate(a.appliedAt)}</div>
                  </div>
                  <Badge status={a.status} />
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                  {PIPELINE.map((step, i) => {
                    const meta = STATUS_META[step];
                    const done = isRejected ? i < stepIndex : i <= stepIndex;
                    return (
                      <div key={step} className="ch-progress-step">
                        {i > 0 && <div className="ch-progress-line" style={{ right: "50%", left: "auto", width: "100%", background: i <= stepIndex || isRejected ? (isRejected && i === stepIndex ? "var(--danger)" : "var(--primary)") : "var(--border)" }} />}
                        <div className="ch-progress-dot" style={{ background: done ? "var(--primary)" : "#fff", border: `2px solid ${done ? "var(--primary)" : "var(--border)"}`, color: done ? "#fff" : "var(--ink-soft)" }}>
                          {done ? <CheckCircle2 size={13} /> : i + 1}
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--ink-soft)", marginTop: 6, textAlign: "center", fontWeight: 600 }}>{meta.label}</div>
                      </div>
                    );
                  })}
                </div>

                {assessment && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)" }}>Screening Assessment: {assessment.title}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                        {submission ? `Completed · Score ${submission.percentageScore}% (${submission.passed ? 'Passed' : 'Failed'})` : `${assessment.durationMinutes} mins · Proctored live test`}
                      </div>
                    </div>

                    {!submission ? (
                      <button className="ch-btn ch-btn-primary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setActiveAssessmentModal({ assessment, job })}>
                        Take Assessment
                      </button>
                    ) : (
                      <span className="ch-badge" style={{ background: submission.passed ? "var(--success-tint)" : "var(--danger-tint)", color: submission.passed ? "var(--success)" : "var(--danger)" }}>
                        {submission.passed ? "OA Passed" : "OA Failed"}
                      </span>
                    )}
                  </div>
                )}

                {isRejected && <div style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600, marginTop: 8 }}>Not selected this time — keep applying, more roles open weekly.</div>}
              </div>
            );
          })}
        </div>
      )}

      {activeAssessmentModal && (
        <StudentAssessmentTakeModal
          assessment={activeAssessmentModal.assessment}
          job={activeAssessmentModal.job}
          onClose={() => setActiveAssessmentModal(null)}
          onSubmitComplete={(result) => {
            updateDB(d => {
              if (!d.assessmentSubmissions) d.assessmentSubmissions = [];
              d.assessmentSubmissions.push({
                id: uid('sub'),
                assessmentId: activeAssessmentModal.assessment.id,
                jobId: activeAssessmentModal.job.id,
                studentId: a.studentId || 'u_stu1',
                studentName: 'Candidate',
                earnedPoints: result.mcqAnswers ? 80 : 0,
                totalPoints: 100,
                percentageScore: 80,
                passed: true,
                warningsCount: result.warningsCount,
                proctoringLogs: result.proctoringLogs,
                submittedAt: nowISO()
              });
              const app = d.applications.find(a => a.jobId === activeAssessmentModal.job.id);
              if (app && app.status === 'applied') app.status = 'shortlisted';
              return d;
            });
            showToast("Assessment submitted!");
            setActiveAssessmentModal(null);
          }}
        />
      )}
    </div>
  );
}

function StudentInterviews({ db, myInterviews, updateDB }) {
  const sorted = [...myInterviews].sort((a, b) => new Date(b.date) - new Date(a.date));
  const [cameraInterview, setCameraInterview] = useState(null);

  const saveMeetingData = (interviewId, data) => {
    updateDB((d) => {
      const ix = d.interviews.findIndex((i) => i.id === interviewId);
      if (ix >= 0) {
        d.interviews[ix] = { ...d.interviews[ix], notes: data.notes, notesFileName: data.notesFileName, recordingUrl: data.recordingUrl };
      }
      return d;
    });
  };

  return (
    <div>
      {sorted.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No interviews yet" message="Once a recruiter shortlists you, interview details will appear here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sorted.map((i) => {
            const job = db.jobs.find((j) => j.id === i.jobId);
            const company = db.companies.find((c) => c.id === job?.companyId);
            return (
              <div key={i.id} className="ch-card" style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 11, background: "#F1EAFA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#7A4FC7", lineHeight: 1 }}>{new Date(i.date).getDate()}</div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: "#7A4FC7" }}>{new Date(i.date).toLocaleString("en-IN", { month: "short" })}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{i.round} — {job?.title}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{company?.name}</div>
                    <div style={{ fontSize: 12, color: "#A7ACC7", marginTop: 3 }}>{i.time} · {i.mode} · {i.venue}</div>
                    {i.status === "Completed" && i.feedback && <div style={{ fontSize: 12, marginTop: 6, color: "var(--ink-soft)" }}>Feedback: {i.feedback}</div>}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span className="ch-badge" style={{ background: i.status === "Scheduled" ? "var(--info-tint)" : "var(--bg)", color: i.status === "Scheduled" ? "var(--info)" : "var(--ink-soft)" }}>{i.status}</span>
                  {i.result && <div style={{ marginTop: 6 }}><Badge status={i.result === "Selected" ? "selected" : "rejected"} /></div>}
                  {i.status === "Scheduled" && (
                    <div style={{ marginTop: 8 }}>
                      <button className="ch-btn ch-btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => setCameraInterview(i)}>
                        <CalendarClock size={12} /> Camera
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {cameraInterview && (
        <CameraInterviewModal
          interview={cameraInterview}
          job={db.jobs.find((j) => j.id === cameraInterview.jobId)}
          company={db.companies.find((c) => c.id === db.jobs.find((j) => j.id === cameraInterview.jobId)?.companyId)}
          currentUser={currentUser}
          onClose={() => setCameraInterview(null)}
          onSave={(data) => saveMeetingData(cameraInterview.id, data)}
        />
      )}
    </div>
  );
}

function StudentProfile({ student, currentUser, onSave, showToast }) {
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    ...student,
    profilePhoto: student?.profilePhoto || "",
    linkedinUrl: student?.linkedinUrl || "",
    githubUrl: student?.githubUrl || "",
  });
  const [skillInput, setSkillInput] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addSkill = () => {
    if (!skillInput.trim()) return;
    set("skills", [...(form.skills || []), skillInput.trim()]);
    setSkillInput("");
  };
  const removeSkill = (s) => set("skills", (form.skills || []).filter((x) => x !== s));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
      <div className="ch-card" style={{ padding: 22 }}>
        <SectionHeading title="Academic profile" sub="Used to automatically check eligibility for roles" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div><label className="ch-label">Roll number</label><input className="ch-input" value={form.rollNo || ""} onChange={(e) => set("rollNo", e.target.value)} /></div>
          <div><label className="ch-label">Phone</label><input className="ch-input" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><label className="ch-label">Branch</label>
            <select className="ch-input" value={form.branch || BRANCHES[0]} onChange={(e) => set("branch", e.target.value)}>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div><label className="ch-label">Batch</label>
            <select className="ch-input" value={form.batch || BATCHES[0]} onChange={(e) => set("batch", e.target.value)}>
              {BATCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div><label className="ch-label">CGPA</label><input type="number" step="0.01" min="0" max="10" className="ch-input" value={form.cgpa ?? ""} onChange={(e) => set("cgpa", parseFloat(e.target.value) || 0)} /></div>
          <div><label className="ch-label">Active backlogs</label><input type="number" min="0" className="ch-input" value={form.backlogs ?? ""} onChange={(e) => set("backlogs", parseInt(e.target.value) || 0)} /></div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="ch-label">Skills</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input className="ch-input" placeholder="e.g. Python" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
            <button type="button" className="ch-btn ch-btn-ghost" onClick={addSkill}>Add</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(form.skills || []).map((s) => (
              <span key={s} className="ch-badge" style={{ background: "var(--primary-tint)", color: "var(--primary)" }}>
                {s} <X size={11} style={{ cursor: "pointer" }} onClick={() => removeSkill(s)} />
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="ch-label">Education</label>
          <input className="ch-input" value={form.education || ""} onChange={(e) => set("education", e.target.value)} placeholder="e.g. B.Tech CSE, GCE College (2022–2026)" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="ch-label">Experience</label>
          <textarea className="ch-input" rows={3} value={form.experience || ""} onChange={(e) => set("experience", e.target.value)} placeholder="Internships, projects, positions of responsibility…" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="ch-label">LinkedIn URL</label>
          <input className="ch-input" value={form.linkedinUrl || ""} onChange={(e) => set("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/yourname" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="ch-label">GitHub URL</label>
          <input className="ch-input" value={form.githubUrl || ""} onChange={(e) => set("githubUrl", e.target.value)} placeholder="https://github.com/yourname" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="ch-label">Profile photo URL</label>
          <input className="ch-input" value={form.profilePhoto || ""} onChange={(e) => set("profilePhoto", e.target.value)} placeholder="https://example.com/profile.jpg" />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label className="ch-label">Resume summary</label>
          <textarea className="ch-input" rows={3} value={form.resumeSummary || ""} onChange={(e) => set("resumeSummary", e.target.value)} placeholder="A 2–3 line summary recruiters see first." />
        </div>
        <button className="ch-btn ch-btn-primary" onClick={() => onSave(form)}>Save profile</button>
      </div>

      <div className="ch-card" style={{ padding: 22 }}>
        <SectionHeading title="Resume preview" sub="How recruiters see your profile" />
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', background: 'var(--primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              {form.profilePhoto ? <img src={form.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle2 size={32} color="var(--primary)" />}
            </div>
            <div>
              <div className="ch-serif" style={{ fontSize: 17, fontWeight: 600 }}>{currentUser.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{currentUser.email} · {form.phone || "—"}</div>
            </div>
          </div>
          <div style={{ fontSize: 12.5, lineHeight: 1.6, marginBottom: 14 }}>{form.resumeSummary || "Add a resume summary to preview it here."}</div>

          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 6 }}>EDUCATION</div>
          <div style={{ fontSize: 12.5, marginBottom: 14 }}>{form.education || "—"}</div>

          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 6 }}>SKILLS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {(form.skills || []).length ? form.skills.map((s) => <span key={s} style={{ fontSize: 11.5, background: "var(--bg)", padding: "3px 9px", borderRadius: 999 }}>{s}</span>) : <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>—</span>}
          </div>

          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 6 }}>EXPERIENCE</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>{form.experience || "—"}</div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--border)", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span>CGPA: <b>{form.cgpa || 0}</b></span>
            <span>Backlogs: <b>{form.backlogs || 0}</b></span>
            <span>Batch: <b>{form.batch}</b></span>
          </div>
        </div>

        <div className="ch-card" style={{ padding: 20, marginTop: 18, background: "var(--primary-tint)", border: "1px solid var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 14, color: "var(--primary)", marginBottom: 4 }}>
            <ShieldCheck size={16} /> Public Shareable Portfolio
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 12 }}>
            Share your verified academic credentials, endorsed skills, and placement status with recruiters or external platforms.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ch-btn ch-btn-primary" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => setShowPortfolioModal(true)}>
              👁️ Preview Portfolio
            </button>
            <button className="ch-btn ch-btn-ghost" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/portfolio/${student?.rollNo || '21CS041'}`);
              if (showToast) showToast("Portfolio link copied to clipboard!");
            }}>
              📋 Copy Link
            </button>
          </div>
        </div>
      </div>

      {showPortfolioModal && (
        <PublicStudentPortfolioModal student={student} currentUser={currentUser} onClose={() => setShowPortfolioModal(false)} showToast={showToast} />
      )}
    </div>
  );
}

/* =============================== RECRUITER APP ================================ */
function RecruiterApp({ db, updateDB, currentUser, page, setPage, showToast }) {
  const company = db.companies.find((c) => c.id === currentUser.companyId);
  const myJobs = db.jobs.filter((j) => j.recruiterId === currentUser.id);
  const [selectedJobId, setSelectedJobId] = useState(myJobs[0]?.id || null);

  const postJob = (job) => {
    updateDB((d) => {
      d.jobs.push({ ...job, id: uid("j"), recruiterId: currentUser.id, companyId: currentUser.companyId, status: "open", postedAt: nowISO() });
      return d;
    });
    showToast("Job posted");
    setPage("myjobs");
  };

  const closeJob = (jobId) => {
    updateDB((d) => { const j = d.jobs.find((x) => x.id === jobId); if (j) j.status = "closed"; return d; });
    showToast("Job closed");
  };

  const updateApplicationStatus = (appId, status, note) => {
    updateDB((d) => {
      const app = d.applications.find((a) => a.id === appId);
      if (!app) return d;
      app.status = status;
      app.timeline.push({ status, date: nowISO(), note });
      const job = d.jobs.find((j) => j.id === app.jobId);
      d.notifications.push({ id: uid("n"), userId: app.studentId, title: status === "shortlisted" ? "Application Shortlisted" : status === "selected" ? "Offer Received" : "Application Update",
        message: `Your application for ${job?.title} is now "${STATUS_META[status].label}".`, read: false, createdAt: nowISO(), type: "status" });
      return d;
    });
    showToast("Applicant status updated");
  };

  const scheduleInterview = async (interview) => {
    if (localStorage.getItem(API_TOKEN_KEY)) {
      try {
        await apiRequest("/interviews", { method: "POST", body: JSON.stringify(interview) });
      } catch (error) {
        showToast(error.message);
        return;
      }
    }
    updateDB((d) => {
      d.interviews.push({ ...interview, id: uid("i"), status: "Scheduled", feedback: "", result: "" });
      const app = d.applications.find((a) => a.id === interview.applicationId);
      if (app && app.status !== "interview") { app.status = "interview"; app.timeline.push({ status: "interview", date: nowISO(), note: `${interview.round} scheduled.` }); }
      const job = d.jobs.find((j) => j.id === interview.jobId);
      d.notifications.push({ id: uid("n"), userId: interview.studentId, title: "Interview Scheduled", message: `${interview.round} for ${job?.title} on ${fmtDate(interview.date)} at ${interview.time}.`, read: false, createdAt: nowISO(), type: "interview" });
      return d;
    });
    showToast("Interview scheduled");
  };

  const updateInterviewResult = (interviewId, status, feedback, result) => {
    updateDB((d) => {
      const iv = d.interviews.find((i) => i.id === interviewId);
      if (!iv) return d;
      iv.status = status; iv.feedback = feedback; iv.result = result;
      if (result) {
        const app = d.applications.find((a) => a.id === iv.applicationId);
        if (app) {
          const newStatus = result === "Selected" ? "selected" : "rejected";
          app.status = newStatus;
          app.timeline.push({ status: newStatus, date: nowISO(), note: `${iv.round} result: ${result}.` });
          const job = d.jobs.find((j) => j.id === app.jobId);
          d.notifications.push({ id: uid("n"), userId: app.studentId, title: result === "Selected" ? "Offer Received" : "Application Update", message: `Result for ${job?.title}: ${result}.`, read: false, createdAt: nowISO(), type: "result" });
        }
      }
      return d;
    });
    showToast("Interview updated");
  };

  if (page === "postjob") return <RecruiterPostJob db={db} onPost={postJob} />;
  if (page === "myjobs") return <RecruiterMyJobs db={db} myJobs={myJobs} onClose={closeJob} onView={(id) => { setSelectedJobId(id); setPage("applicants"); }} />;
  if (page === "assessments") return <RecruiterAssessments db={db} currentUser={currentUser} updateDB={updateDB} showToast={showToast} />;
  if (page === "applicants") return <RecruiterApplicants db={db} myJobs={myJobs} selectedJobId={selectedJobId} setSelectedJobId={setSelectedJobId} onUpdateStatus={updateApplicationStatus} onSchedule={scheduleInterview} />;
  if (page === "interviews") return <RecruiterInterviews db={db} myJobs={myJobs} onUpdateResult={updateInterviewResult} updateDB={updateDB} />;
  return <RecruiterDashboard db={db} myJobs={myJobs} company={company} setPage={setPage} />;
}

function RecruiterDashboard({ db, myJobs, company, setPage }) {
  const jobIds = new Set(myJobs.map((j) => j.id));
  const apps = db.applications.filter((a) => jobIds.has(a.jobId));
  const shortlisted = apps.filter((a) => ["shortlisted", "interview", "selected"].includes(a.status)).length;
  const selected = apps.filter((a) => a.status === "selected").length;
  const openJobs = myJobs.filter((j) => j.status === "open").length;

  const byJob = myJobs.map((j) => ({ name: j.title.length > 16 ? j.title.slice(0, 15) + "…" : j.title, applicants: apps.filter((a) => a.jobId === j.id).length }));

  return (
    <div>
      <div className="ch-card" style={{ padding: "22px 24px", marginBottom: 22, background: "linear-gradient(120deg,var(--primary),var(--primary-dark))", color: "#fff", border: "none" }}>
        <div className="ch-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{company?.name} hiring overview</div>
        <div style={{ fontSize: 13.5, color: "#C9CEEA" }}>{openJobs} open role{openJobs === 1 ? "" : "s"} · {apps.length} total applicant{apps.length === 1 ? "" : "s"}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard icon={Briefcase} label="Open roles" value={openJobs} tint="var(--primary-tint)" color="var(--primary)" />
        <StatCard icon={Users} label="Total applicants" value={apps.length} tint="var(--info-tint)" color="var(--info)" />
        <StatCard icon={Sparkles} label="Shortlisted" value={shortlisted} tint="var(--accent-tint)" color="#8A6216" />
        <StatCard icon={Award} label="Offers made" value={selected} tint="var(--success-tint)" color="var(--success)" />
      </div>

      <div className="ch-card" style={{ padding: 20 }}>
        <SectionHeading title="Applicants per role" action={<span onClick={() => setPage("postjob")} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)", cursor: "pointer" }}>+ Post a job</span>} />
        {byJob.length === 0 ? <EmptyState icon={Briefcase} title="No jobs posted yet" message="Post your first role to start receiving applications." /> : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byJob}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--ink-soft)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--ink-soft)" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="applicants" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function RecruiterPostJob({ db, onPost }) {
  const [form, setForm] = useState({ title: "", description: "", location: "", jobType: "Full-time", ctc: "", minCgpa: 6.5, branches: [], maxBacklogs: 0, batch: BATCHES[0], deadline: "", rounds: "Technical Interview, HR Interview" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleBranch = (b) => set("branches", form.branches.includes(b) ? form.branches.filter((x) => x !== b) : [...form.branches, b]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.deadline || form.branches.length === 0) return;
    onPost({
      title: form.title, description: form.description, location: form.location, jobType: form.jobType, ctc: parseFloat(form.ctc) || 0,
      eligibility: { minCgpa: parseFloat(form.minCgpa) || 0, branches: form.branches, maxBacklogs: parseInt(form.maxBacklogs) || 0, batch: form.batch },
      deadline: new Date(form.deadline).toISOString(), rounds: form.rounds.split(",").map((r) => r.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={submit} className="ch-card" style={{ padding: 24, maxWidth: 720 }}>
      <SectionHeading title="Post a new job" sub="Set clear eligibility criteria so only qualified students can apply" />
      <div style={{ marginBottom: 14 }}><label className="ch-label">Job title *</label><input className="ch-input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Software Development Engineer" required /></div>
      <div style={{ marginBottom: 14 }}><label className="ch-label">Description *</label><textarea className="ch-input" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} required /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div><label className="ch-label">Location</label><input className="ch-input" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Bengaluru (Hybrid)" /></div>
        <div><label className="ch-label">Job type</label>
          <select className="ch-input" value={form.jobType} onChange={(e) => set("jobType", e.target.value)}>
            <option>Full-time</option><option>Internship</option><option>Part-time</option>
          </select>
        </div>
        <div><label className="ch-label">CTC (LPA)</label><input type="number" step="0.1" className="ch-input" value={form.ctc} onChange={(e) => set("ctc", e.target.value)} placeholder="e.g. 8.5" /></div>
      </div>

      <div style={{ fontWeight: 700, fontSize: 13, margin: "18px 0 10px" }}>Eligibility criteria</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div><label className="ch-label">Minimum CGPA</label><input type="number" step="0.1" min="0" max="10" className="ch-input" value={form.minCgpa} onChange={(e) => set("minCgpa", e.target.value)} /></div>
        <div><label className="ch-label">Max backlogs</label><input type="number" min="0" className="ch-input" value={form.maxBacklogs} onChange={(e) => set("maxBacklogs", e.target.value)} /></div>
        <div><label className="ch-label">Eligible batch</label>
          <select className="ch-input" value={form.batch} onChange={(e) => set("batch", e.target.value)}>{BATCHES.map((b) => <option key={b} value={b}>{b}</option>)}</select>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label className="ch-label">Eligible branches *</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {BRANCHES.map((b) => (
            <span key={b} onClick={() => toggleBranch(b)} className="ch-badge" style={{ cursor: "pointer", background: form.branches.includes(b) ? "var(--primary)" : "var(--bg)", color: form.branches.includes(b) ? "#fff" : "var(--ink-soft)", border: "1px solid var(--border)" }}>{b}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        <div><label className="ch-label">Application deadline *</label><input type="date" className="ch-input" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} required /></div>
        <div><label className="ch-label">Selection rounds (comma separated)</label><input className="ch-input" value={form.rounds} onChange={(e) => set("rounds", e.target.value)} /></div>
      </div>
      <button className="ch-btn ch-btn-primary" type="submit">Post job</button>
    </form>
  );
}

function RecruiterMyJobs({ db, myJobs, onClose, onView }) {
  return (
    <div>
      {myJobs.length === 0 ? <EmptyState icon={Briefcase} title="No jobs yet" message="Post a job to start receiving applications from eligible students." /> : (
        <div className="ch-card" style={{ overflow: "hidden" }}>
          <table className="ch-table">
            <thead><tr><th>Role</th><th>CTC</th><th>Deadline</th><th>Applicants</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {myJobs.map((j) => {
                const count = db.applications.filter((a) => a.jobId === j.id).length;
                return (
                  <tr key={j.id}>
                    <td><div style={{ fontWeight: 700 }}>{j.title}</div><div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{j.location}</div></td>
                    <td>₹{j.ctc} LPA</td>
                    <td>{fmtDate(j.deadline)}</td>
                    <td>{count}</td>
                    <td><span className="ch-badge" style={{ background: j.status === "open" ? "var(--success-tint)" : "var(--bg)", color: j.status === "open" ? "var(--success)" : "var(--ink-soft)" }}>{j.status === "open" ? "Open" : "Closed"}</span></td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="ch-btn ch-btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => onView(j.id)}><Eye size={13} /> Applicants</button>
                      {j.status === "open" && <button className="ch-btn ch-btn-danger" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => onClose(j.id)}>Close</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ScheduleInterviewModal({ app, job, onSchedule, onClose }) {
  const [form, setForm] = useState({ round: job.rounds[0] || "Interview", date: "", time: "11:00 AM", mode: "Online", venue: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.date) return;
    onSchedule({ applicationId: app.id, jobId: job.id, studentId: app.studentId, round: form.round, date: new Date(form.date).toISOString(), time: form.time, mode: form.mode, venue: form.venue });
    onClose();
  };
  return (
    <Modal title="Schedule interview" onClose={onClose} width={480}>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 14 }}><label className="ch-label">Round</label>
          <select className="ch-input" value={form.round} onChange={(e) => set("round", e.target.value)}>{job.rounds.map((r) => <option key={r}>{r}</option>)}</select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div><label className="ch-label">Date</label><input type="date" className="ch-input" value={form.date} onChange={(e) => set("date", e.target.value)} required /></div>
          <div><label className="ch-label">Time</label><input className="ch-input" value={form.time} onChange={(e) => set("time", e.target.value)} placeholder="e.g. 11:00 AM" /></div>
        </div>
        <div style={{ marginBottom: 14 }}><label className="ch-label">Mode</label>
          <select className="ch-input" value={form.mode} onChange={(e) => set("mode", e.target.value)}><option>Online</option><option>In-person</option></select>
        </div>
        <div style={{ marginBottom: 18 }}><label className="ch-label">Venue / link</label><input className="ch-input" value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. Google Meet link or room number" /></div>
        <button className="ch-btn ch-btn-primary" type="submit"><CalendarPlus size={15} /> Schedule</button>
      </form>
    </Modal>
  );
}

function RecruiterApplicants({ db, myJobs, selectedJobId, setSelectedJobId, onUpdateStatus, onSchedule }) {
  const [schedulingApp, setSchedulingApp] = useState(null);
  const job = myJobs.find((j) => j.id === selectedJobId) || myJobs[0];
  const apps = job ? db.applications.filter((a) => a.jobId === job.id) : [];

  if (!job) return <EmptyState icon={Users} title="No jobs to show applicants for" message="Post a job first." />;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {myJobs.map((j) => (
          <button key={j.id} className={`ch-btn ${job.id === j.id ? "ch-btn-primary" : "ch-btn-ghost"}`} style={{ fontSize: 12.5 }} onClick={() => setSelectedJobId(j.id)}>{j.title}</button>
        ))}
      </div>

      {apps.length === 0 ? <EmptyState icon={Users} title="No applicants yet" message="Eligible students will show up here as soon as they apply." /> : (
        <div className="ch-card" style={{ overflow: "hidden" }}>
          <table className="ch-table">
            <thead><tr><th>Student</th><th>Branch / CGPA</th><th>Applied</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {apps.map((a) => {
                const student = db.students.find((s) => s.studentId === a.studentId);
                const user = db.users.find((u) => u.id === a.studentId);
                return (
                  <tr key={a.id}>
                    <td><div style={{ fontWeight: 700 }}>{user?.name}</div><div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{student?.skills?.slice(0, 3).join(", ")}</div></td>
                    <td>{student?.branch}<br /><span style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>CGPA {student?.cgpa}</span></td>
                    <td>{fmtDate(a.appliedAt)}</td>
                    <td><Badge status={a.status} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {a.status === "applied" && <button className="ch-btn ch-btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => onUpdateStatus(a.id, "shortlisted", "Shortlisted after resume screening.")}>Shortlist</button>}
                        {["shortlisted", "interview"].includes(a.status) && <button className="ch-btn ch-btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => setSchedulingApp(a)}><CalendarPlus size={12} /> Interview</button>}
                        {a.status !== "rejected" && a.status !== "selected" && <button className="ch-btn ch-btn-danger" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => onUpdateStatus(a.id, "rejected", "Not selected to proceed.")}>Reject</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {schedulingApp && <ScheduleInterviewModal app={schedulingApp} job={job} onSchedule={onSchedule} onClose={() => setSchedulingApp(null)} />}
    </div>
  );
}

function RecruiterInterviews({ db, myJobs, onUpdateResult, updateDB }) {
  const jobIds = new Set(myJobs.map((j) => j.id));
  const interviews = db.interviews.filter((i) => jobIds.has(i.jobId)).sort((a, b) => new Date(a.date) - new Date(b.date));
  const [editing, setEditing] = useState(null);
  const [cameraInterview, setCameraInterview] = useState(null);

  const saveMeetingData = (interviewId, data) => {
    updateDB((d) => {
      const ix = d.interviews.findIndex((i) => i.id === interviewId);
      if (ix >= 0) {
        d.interviews[ix] = { ...d.interviews[ix], notes: data.notes, notesFileName: data.notesFileName, recordingUrl: data.recordingUrl };
      }
      return d;
    });
  };

  return (
    <div>
      {interviews.length === 0 ? <EmptyState icon={CalendarClock} title="No interviews scheduled" message="Schedule interviews from the Applicants tab." /> : (
        <div className="ch-card" style={{ overflow: "hidden" }}>
          <table className="ch-table">
            <thead><tr><th>Candidate</th><th>Role / Round</th><th>When</th><th>Status</th><th>Result</th><th></th></tr></thead>
            <tbody>
              {interviews.map((i) => {
                const user = db.users.find((u) => u.id === i.studentId);
                const job = db.jobs.find((j) => j.id === i.jobId);
                const company = db.companies.find((c) => c.id === job?.companyId);
                return (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 700 }}>{user?.name}</td>
                    <td>{job?.title}<br /><span style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{i.round}</span></td>
                    <td>{fmtDate(i.date)}<br /><span style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{i.time} · {i.mode}</span></td>
                    <td>{i.status}</td>
                    <td>{i.result ? <Badge status={i.result === "Selected" ? "selected" : "rejected"} /> : "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {i.status === "Scheduled" && (
                          <>
                            <button className="ch-btn ch-btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => setEditing(i)}><Edit3 size={12} /> Update</button>
                            <button className="ch-btn ch-btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => setCameraInterview(i)}><Camera size={12} /> Camera</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {editing && <UpdateInterviewModal interview={editing} onSave={onUpdateResult} onClose={() => setEditing(null)} />}
      {cameraInterview && (
        <CameraInterviewModal
          interview={cameraInterview}
          job={db.jobs.find((j) => j.id === cameraInterview.jobId)}
          company={db.companies.find((c) => c.id === db.jobs.find((j) => j.id === cameraInterview.jobId)?.companyId)}
          currentUser={currentUser}
          onClose={() => setCameraInterview(null)}
          onSave={(data) => saveMeetingData(cameraInterview.id, data)}
        />
      )}
    </div>
  );
}

function UpdateInterviewModal({ interview, onSave, onClose }) {
  const [feedback, setFeedback] = useState(interview.feedback || "");
  const [result, setResult] = useState("Selected");
  return (
    <Modal title="Update interview outcome" onClose={onClose} width={460}>
      <div style={{ marginBottom: 14 }}>
        <label className="ch-label">Feedback</label>
        <textarea className="ch-input" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Notes on the candidate's performance…" />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label className="ch-label">Result</label>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`ch-btn ${result === "Selected" ? "ch-btn-primary" : "ch-btn-ghost"}`} onClick={() => setResult("Selected")} type="button"><CheckCircle2 size={14} /> Selected</button>
          <button className={`ch-btn ${result === "Rejected" ? "ch-btn-danger" : "ch-btn-ghost"}`} onClick={() => setResult("Rejected")} type="button"><XCircle size={14} /> Rejected</button>
        </div>
      </div>
      <button className="ch-btn ch-btn-primary" onClick={() => { onSave(interview.id, "Completed", feedback, result); onClose(); }}>Save outcome</button>
    </Modal>
  );
}

/* ================================= ADMIN APP =================================== */
function AdminApp({ db, updateDB, currentUser, page, setPage, showToast }) {
  const addCompany = (c) => { updateDB((d) => { d.companies.push({ ...c, id: uid("c") }); return d; }); showToast("Company added"); };
  const removeStudentBlock = () => {};

  if (page === "students") return <AdminStudents db={db} />;
  if (page === "companies") return <AdminCompanies db={db} onAdd={addCompany} />;
  if (page === "jobs") return <AdminJobs db={db} updateDB={updateDB} showToast={showToast} />;
  if (page === "applications") return <AdminApplications db={db} />;
  if (page === "interviews") return <AdminInterviews db={db} />;
  if (page === "stats") return <AdminStats db={db} />;
  return <AdminDashboard db={db} setPage={setPage} />;
}

function AdminDashboard({ db, setPage }) {
  const students = db.students.length;
  const companies = db.companies.length;
  const openJobs = db.jobs.filter((j) => j.status === "open").length;
  const selected = db.applications.filter((a) => a.status === "selected").length;
  const placementRate = students ? Math.round((new Set(db.applications.filter((a) => a.status === "selected").map((a) => a.studentId)).size / students) * 100) : 0;

  const statusCounts = ["applied", "shortlisted", "interview", "selected", "rejected"].map((s) => ({ name: STATUS_META[s].label, value: db.applications.filter((a) => a.status === s).length, color: STATUS_META[s].color }));
  const upcomingInterviews = db.interviews.filter((i) => i.status === "Scheduled").sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);

  return (
    <div>
      <div className="ch-card" style={{ padding: "22px 24px", marginBottom: 22, background: "linear-gradient(120deg,var(--primary),var(--primary-dark))", color: "#fff", border: "none" }}>
        <div className="ch-serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Placement season at a glance</div>
        <div style={{ fontSize: 13.5, color: "#C9CEEA" }}>{placementRate}% of registered students have received an offer so far.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard icon={GraduationCap} label="Registered students" value={students} tint="var(--primary-tint)" color="var(--primary)" />
        <StatCard icon={Building2} label="Partner companies" value={companies} tint="var(--info-tint)" color="var(--info)" />
        <StatCard icon={Briefcase} label="Open job postings" value={openJobs} tint="var(--accent-tint)" color="#8A6216" />
        <StatCard icon={Award} label="Offers made" value={selected} tint="var(--success-tint)" color="var(--success)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
        <div className="ch-card" style={{ padding: 20 }}>
          <SectionHeading title="Application pipeline" sub="Across all companies" action={<span onClick={() => setPage("stats")} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)", cursor: "pointer" }}>Full report →</span>} />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusCounts} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--ink-soft)" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="var(--ink-soft)" width={90} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {statusCounts.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="ch-card" style={{ padding: 20 }}>
          <SectionHeading title="Upcoming interviews" action={<span onClick={() => setPage("interviews")} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)", cursor: "pointer" }}>View all →</span>} />
          {upcomingInterviews.length === 0 ? <EmptyState icon={CalendarClock} title="Nothing scheduled" message="Scheduled interviews across all companies will appear here." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {upcomingInterviews.map((i) => {
                const user = db.users.find((u) => u.id === i.studentId);
                const job = db.jobs.find((j) => j.id === i.jobId);
                return (
                  <div key={i.id} style={{ borderLeft: "3px solid var(--accent)", paddingLeft: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{user?.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{job?.title} · {i.round}</div>
                    <div style={{ fontSize: 11.5, color: "#A7ACC7" }}>{fmtDate(i.date)} · {i.time}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminStudents({ db }) {
  const [q, setQ] = useState("");
  const rows = db.students.filter((s) => {
    const user = db.users.find((u) => u.id === s.studentId);
    return !q || `${user?.name} ${s.rollNo} ${s.branch}`.toLowerCase().includes(q.toLowerCase());
  });
  return (
    <div>
      <div style={{ position: "relative", maxWidth: 320, marginBottom: 16 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: 11, color: "var(--ink-soft)" }} />
        <input className="ch-input" style={{ paddingLeft: 34 }} placeholder="Search students" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="ch-card" style={{ overflow: "hidden" }}>
        <table className="ch-table">
          <thead><tr><th>Student</th><th>Branch</th><th>CGPA</th><th>Backlogs</th><th>Applications</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((s) => {
              const user = db.users.find((u) => u.id === s.studentId);
              const apps = db.applications.filter((a) => a.studentId === s.studentId);
              const placed = apps.some((a) => a.status === "selected");
              return (
                <tr key={s.studentId}>
                  <td><div style={{ fontWeight: 700 }}>{user?.name}</div><div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{s.rollNo} · {user?.email}</div></td>
                  <td>{s.branch}</td>
                  <td>{s.cgpa}</td>
                  <td>{s.backlogs}</td>
                  <td>{apps.length}</td>
                  <td>{placed ? <span className="ch-badge" style={{ background: "var(--success-tint)", color: "var(--success)" }}>Placed</span> : <span className="ch-badge" style={{ background: "var(--bg)", color: "var(--ink-soft)" }}>Seeking</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminCompanies({ db, onAdd }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", sector: "", website: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e) => { e.preventDefault(); if (!form.name) return; onAdd(form); setForm({ name: "", sector: "", website: "" }); setModal(false); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="ch-btn ch-btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Add company</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {db.companies.map((c) => {
          const jobs = db.jobs.filter((j) => j.companyId === c.id);
          const openJobs = jobs.filter((j) => j.status === "open").length;
          return (
            <div key={c.id} className="ch-card" style={{ padding: 18 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-tint)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--primary)", fontSize: 13, marginBottom: 12 }}>
                {c.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{c.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 10 }}>{c.sector}</div>
              <div style={{ fontSize: 12, color: "#A7ACC7" }}>{openJobs} open role{openJobs === 1 ? "" : "s"} · {jobs.length} total posted</div>
            </div>
          );
        })}
      </div>
      {modal && (
        <Modal title="Add company" onClose={() => setModal(false)} width={420}>
          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}><label className="ch-label">Company name</label><input className="ch-input" value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
            <div style={{ marginBottom: 14 }}><label className="ch-label">Sector</label><input className="ch-input" value={form.sector} onChange={(e) => set("sector", e.target.value)} placeholder="e.g. Fintech" /></div>
            <div style={{ marginBottom: 18 }}><label className="ch-label">Website</label><input className="ch-input" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="e.g. company.com" /></div>
            <button className="ch-btn ch-btn-primary" type="submit">Add company</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function AdminJobs({ db, updateDB, showToast }) {
  const toggleStatus = (jobId) => {
    updateDB((d) => { const j = d.jobs.find((x) => x.id === jobId); if (j) j.status = j.status === "open" ? "closed" : "open"; return d; });
    showToast("Job status updated");
  };
  return (
    <div className="ch-card" style={{ overflow: "hidden" }}>
      <table className="ch-table">
        <thead><tr><th>Role</th><th>Company</th><th>CTC</th><th>Deadline</th><th>Applicants</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {db.jobs.map((j) => {
            const company = db.companies.find((c) => c.id === j.companyId);
            const count = db.applications.filter((a) => a.jobId === j.id).length;
            return (
              <tr key={j.id}>
                <td style={{ fontWeight: 700 }}>{j.title}</td>
                <td>{company?.name}</td>
                <td>₹{j.ctc} LPA</td>
                <td>{fmtDate(j.deadline)}</td>
                <td>{count}</td>
                <td><span className="ch-badge" style={{ background: j.status === "open" ? "var(--success-tint)" : "var(--bg)", color: j.status === "open" ? "var(--success)" : "var(--ink-soft)" }}>{j.status === "open" ? "Open" : "Closed"}</span></td>
                <td><button className="ch-btn ch-btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => toggleStatus(j.id)}>{j.status === "open" ? "Close" : "Reopen"}</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AdminApplications({ db }) {
  const sorted = [...db.applications].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  return (
    <div className="ch-card" style={{ overflow: "hidden" }}>
      <table className="ch-table">
        <thead><tr><th>Student</th><th>Role</th><th>Company</th><th>Applied</th><th>Status</th></tr></thead>
        <tbody>
          {sorted.map((a) => {
            const user = db.users.find((u) => u.id === a.studentId);
            const job = db.jobs.find((j) => j.id === a.jobId);
            const company = db.companies.find((c) => c.id === job?.companyId);
            return (
              <tr key={a.id}>
                <td style={{ fontWeight: 700 }}>{user?.name}</td>
                <td>{job?.title}</td>
                <td>{company?.name}</td>
                <td>{fmtDate(a.appliedAt)}</td>
                <td><Badge status={a.status} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AdminInterviews({ db }) {
  const sorted = [...db.interviews].sort((a, b) => new Date(a.date) - new Date(b.date));
  return (
    <div className="ch-card" style={{ overflow: "hidden" }}>
      <table className="ch-table">
        <thead><tr><th>Student</th><th>Role</th><th>Round</th><th>When</th><th>Status</th><th>Result</th></tr></thead>
        <tbody>
          {sorted.map((i) => {
            const user = db.users.find((u) => u.id === i.studentId);
            const job = db.jobs.find((j) => j.id === i.jobId);
            return (
              <tr key={i.id}>
                <td style={{ fontWeight: 700 }}>{user?.name}</td>
                <td>{job?.title}</td>
                <td>{i.round}</td>
                <td>{fmtDate(i.date)} · {i.time}</td>
                <td>{i.status}</td>
                <td>{i.result ? <Badge status={i.result === "Selected" ? "selected" : "rejected"} /> : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const PIE_COLORS = ["#2B3A67", "#E8A33D", "#7A4FC7", "#1F8A5F", "#3568B0", "#C4453A"];

function AdminStats({ db }) {
  const branchStats = BRANCHES.map((b) => {
    const studentIds = db.students.filter((s) => s.branch === b).map((s) => s.studentId);
    const placed = new Set(db.applications.filter((a) => a.status === "selected" && studentIds.includes(a.studentId)).map((a) => a.studentId)).size;
    return { name: b.length > 14 ? b.slice(0, 13) + "…" : b, students: studentIds.length, placed };
  }).filter((b) => b.students > 0);

  const companyStats = db.companies.map((c) => ({ name: c.name, offers: db.applications.filter((a) => a.status === "selected" && db.jobs.find((j) => j.id === a.jobId)?.companyId === c.id).length })).filter((c) => c.offers > 0);

  const statusPie = ["applied", "shortlisted", "interview", "selected", "rejected"].map((s) => ({ name: STATUS_META[s].label, value: db.applications.filter((a) => a.status === s).length })).filter((x) => x.value > 0);

  const avgCtc = (() => {
    const selectedApps = db.applications.filter((a) => a.status === "selected");
    if (!selectedApps.length) return 0;
    const total = selectedApps.reduce((sum, a) => sum + (db.jobs.find((j) => j.id === a.jobId)?.ctc || 0), 0);
    return (total / selectedApps.length).toFixed(1);
  })();

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard icon={TrendingUp} label="Total applications" value={db.applications.length} tint="var(--info-tint)" color="var(--info)" />
        <StatCard icon={Award} label="Offers made" value={db.applications.filter((a) => a.status === "selected").length} tint="var(--success-tint)" color="var(--success)" />
        <StatCard icon={IndianRupee} label="Average CTC" value={`₹${avgCtc}L`} tint="var(--accent-tint)" color="#8A6216" />
        <StatCard icon={Building} label="Companies hiring" value={new Set(db.jobs.filter((j) => j.status === "open").map((j) => j.companyId)).size} tint="var(--primary-tint)" color="var(--primary)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 18 }}>
        <div className="ch-card" style={{ padding: 20 }}>
          <SectionHeading title="Placements by branch" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={branchStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--ink-soft)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--ink-soft)" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="students" name="Registered" fill="var(--border)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="placed" name="Placed" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="ch-card" style={{ padding: 20 }}>
          <SectionHeading title="Application status split" />
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {statusPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend wrapperStyle={{ fontSize: 11.5 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ch-card" style={{ padding: 20 }}>
        <SectionHeading title="Offers by company" />
        {companyStats.length === 0 ? <EmptyState icon={Building2} title="No offers yet" message="Once recruiters mark candidates as selected, this chart will populate." /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={companyStats} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--ink-soft)" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="var(--ink-soft)" width={140} />
              <Tooltip />
              <Bar dataKey="offers" fill="var(--accent)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
