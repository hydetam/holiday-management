import { useState, useEffect, useCallback } from "react";
import {
  db,
  listenEmployees, listenLeaveRecords, listenOtRequests,
  saveEmployee, deleteEmployee, updateEmployeeDays,
  addLeaveRecord, deleteLeaveRecord, updateLeaveRecord,
  addOtRequest, updateOtStatus,
} from "./firebase.js";

const ADMIN_PASSWORD = "350350";

const SEED_EMPLOYEES = [
  { id: "emp_1", name: "陳小明",  annualDays: 14, compDays: 0 },
  { id: "emp_2", name: "林雅婷",  annualDays: 12, compDays: 0 },
  { id: "emp_3", name: "王大偉",  annualDays: 10, compDays: 0 },
  { id: "emp_4", name: "張美玲",  annualDays: 8,  compDays: 0 },
  { id: "emp_5", name: "劉建宏",  annualDays: 15, compDays: 0 },
];

const statusStyle = (s) => ({
  background: s === "pending" ? "#fef9c3" : s === "approved" ? "#f0fdf4" : "#fef2f2",
  color:      s === "pending" ? "#854d0e" : s === "approved" ? "#16a34a" : "#dc2626",
});

const S = {
  landing:      { minHeight:"100vh", background:"linear-gradient(135deg,#1e293b,#0f172a)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Noto Sans TC','PingFang TC',sans-serif" },
  landingCard:  { background:"#fff", borderRadius:20, padding:36, width:"100%", maxWidth:740, boxShadow:"0 25px 60px rgba(0,0,0,0.35)" },
  loginBox:     { border:"2px solid #e2e8f0", borderRadius:14, padding:22, display:"flex", flexDirection:"column", gap:10 },
  loginTitle:   { fontSize:16, fontWeight:700, color:"#1e293b", margin:0 },
  empBtn:       { display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:9, cursor:"pointer", color:"#334155", fontWeight:600, fontFamily:"inherit" },
  app:          { minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Noto Sans TC','PingFang TC',sans-serif" },
  nav:          { background:"#1e293b", color:"#fff", padding:"0 20px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", minHeight:54 },
  brand:        { fontWeight:900, fontSize:15, whiteSpace:"nowrap", marginRight:4 },
  adminBadge:   { background:"#f59e0b", color:"#1e293b", borderRadius:5, padding:"2px 7px", fontSize:10, fontWeight:800, marginLeft:6 },
  tabs:         { display:"flex", gap:2, flex:1, flexWrap:"wrap" },
  tab:          { background:"transparent", border:"none", color:"#94a3b8", padding:"15px 10px", cursor:"pointer", fontSize:12, fontWeight:500, borderBottom:"3px solid transparent", whiteSpace:"nowrap", fontFamily:"inherit" },
  tabActive:    { color:"#fff", borderBottom:"3px solid #3b82f6" },
  logoutBtn:    { background:"#374151", color:"#d1d5db", border:"none", borderRadius:7, padding:"6px 12px", cursor:"pointer", fontSize:12, fontFamily:"inherit" },
  main:         { maxWidth:920, margin:"0 auto", padding:24 },
  title:        { fontSize:21, fontWeight:900, color:"#1e293b", marginBottom:20 },
  card:         { background:"#fff", borderRadius:14, padding:22, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", marginBottom:20 },
  statCard:     { background:"#fff", borderRadius:14, padding:22, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", textAlign:"center" },
  formGrid:     { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 },
  fg:           { display:"flex", flexDirection:"column", gap:6 },
  label:        { fontSize:12, fontWeight:700, color:"#475569" },
  req:          { color:"#ef4444" },
  input:        { padding:"9px 11px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:13, color:"#1e293b", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit" },
  select:       { padding:"9px 11px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:13, color:"#1e293b", background:"#fff", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit" },
  textarea:     { padding:"9px 11px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:13, color:"#1e293b", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit", resize:"vertical", minHeight:70 },
  toggle:       { display:"flex", gap:6 },
  toggleBtn:    { flex:1, padding:"9px 10px", border:"1.5px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontSize:12, background:"#f8fafc", color:"#64748b", fontWeight:600, fontFamily:"inherit" },
  toggleActive: { background:"#eff6ff", color:"#2563eb", borderColor:"#93c5fd" },
  btnPrimary:   { background:"#2563eb", color:"#fff", border:"none", borderRadius:9, padding:"10px 22px", cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"inherit" },
  btnSm:        { background:"#f0fdf4", color:"#16a34a", border:"none", borderRadius:7, padding:"5px 10px", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit" },
  tableWrap:    { background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.07)", overflowX:"auto", marginBottom:20 },
  table:        { width:"100%", borderCollapse:"collapse" },
  th:           { padding:"11px 14px", background:"#f8fafc", fontWeight:700, fontSize:12, color:"#475569", textAlign:"left", borderBottom:"1px solid #e2e8f0" },
  tr:           { borderBottom:"1px solid #f1f5f9" },
  td:           { padding:"12px 14px", fontSize:13, color:"#334155" },
  badge:        { display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 },
  tagAnnual:    { background:"#dcfce7", color:"#16a34a", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 },
  tagComp:      { background:"#dbeafe", color:"#1d4ed8", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 },
  avatar:       { width:30, height:30, background:"#3b82f6", color:"#fff", borderRadius:"50%", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 },
  infoBox:      { background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:8, padding:"9px 13px", fontSize:13, color:"#0369a1", marginBottom:14 },
  previewBox:   { background:"#faf5ff", border:"1px solid #d8b4fe", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#6d28d9", marginBottom:16 },
  alertBox:     { background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:10, padding:"11px 14px", fontSize:13, color:"#92400e", marginBottom:18, display:"flex", alignItems:"center", gap:10 },
  alertBtn:     { background:"#f59e0b", color:"#fff", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit" },
  empty:        { background:"#fff", borderRadius:14, padding:36, textAlign:"center", color:"#94a3b8", fontSize:13 },
  toast:        { position:"fixed", top:20, right:20, color:"#fff", padding:"11px 18px", borderRadius:10, fontSize:13, fontWeight:700, zIndex:9999, boxShadow:"0 4px 12px rgba(0,0,0,0.2)", fontFamily:"inherit" },
  loading:      { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#64748b", fontFamily:"'Noto Sans TC','PingFang TC',sans-serif" },
};

export default function App() {
  // ── Firebase state ───────────────────────────────────────────────────────
  const [employees, setEmployees]       = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [otRequests, setOtRequests]     = useState([]);
  const [loading, setLoading]           = useState(true);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [role, setRole]               = useState(null); // null | 'admin' | 'employee'
  const [currentUser, setCurrentUser] = useState(null);
  const [adminPw, setAdminPw]         = useState("");
  const [pwError, setPwError]         = useState(false);
  const [view, setView]               = useState("dashboard");
  const [notification, setNotification] = useState(null);
  const [successModal, setSuccessModal] = useState(null); // { title, body }

  // Admin – adjust individual
  const [adjTarget, setAdjTarget] = useState("");
  const [adjField, setAdjField]   = useState("annualDays");
  const [adjDir, setAdjDir]       = useState("+");
  const [adjAmt, setAdjAmt]   = useState("");
  const [adjNote, setAdjNote]     = useState("");

  // Admin – bulk
  const [bulkField, setBulkField] = useState("annualDays");
  const [bulkAmt, setBulkAmt]   = useState("");
  const [bulkNote, setBulkNote]   = useState("");

  // Admin – register leave
  const [regEmp, setRegEmp]         = useState("");
  const [regDur, setRegDur]         = useState("1");       // "0.5" | "1" | "custom"
  const [regCustomDays, setRegCustomDays] = useState("");  // used when regDur === "custom"
  const [regDateStart, setRegDateStart] = useState("");
  const [regDateEnd, setRegDateEnd]     = useState("");
  const [regNote, setRegNote]       = useState("");

  // Employee – apply leave
  const [empDur, setEmpDur]         = useState("1");       // "0.5" | "1" | "custom"
  const [empCustomDays, setEmpCustomDays] = useState("");
  const [empDateStart, setEmpDateStart] = useState("");
  const [empDateEnd, setEmpDateEnd]     = useState("");
  const [empNote, setEmpNote]       = useState("");

  // Employee – OT
  const [otDur, setOtDur]           = useState("0.5");     // "0.5" | "1" | "custom"
  const [otCustomDays, setOtCustomDays] = useState("");
  const [otDateStart, setOtDateStart] = useState("");
  const [otDateEnd, setOtDateEnd]     = useState("");

  // Employee management
  const [newName, setNewName]     = useState("");
  const [newAnnual, setNewAnnual] = useState(10);

  // Record edit modal
  const [editRec, setEditRec]     = useState(null); // null | record object
  const [editNote, setEditNote]   = useState("");
  const [editDate, setEditDate]   = useState("");
  const [editDuration, setEditDuration] = useState("");

  // ── Firestore listeners ──────────────────────────────────────────────────
  useEffect(() => {
    let loaded = 0;
    const done = () => { loaded++; if (loaded >= 3) setLoading(false); };

    const unsubEmp = listenEmployees(data => {
      if (data.length === 0) {
        // Seed initial employees if Firestore is empty
        SEED_EMPLOYEES.forEach(e => saveEmployee(e));
      } else {
        setEmployees(data);
      }
      done();
    });
    const unsubRec = listenLeaveRecords(data => { setLeaveRecords(data); done(); });
    const unsubOt  = listenOtRequests(data  => { setOtRequests(data);   done(); });

    return () => { unsubEmp(); unsubRec(); unsubOt(); };
  }, []);

  // keep currentUser in sync with Firestore data
  useEffect(() => {
    if (currentUser) {
      const updated = employees.find(e => e.id === currentUser.id);
      if (updated) setCurrentUser(updated);
    }
  }, [employees]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loginAdmin = () => {
    if (adminPw === ADMIN_PASSWORD) { setRole("admin"); setView("dashboard"); setPwError(false); }
    else setPwError(true);
  };
  const loginEmp = (emp) => { setCurrentUser(emp); setRole("employee"); setView("my-leave"); };
  const logout   = () => { setRole(null); setCurrentUser(null); setView("dashboard"); setAdminPw(""); };

  const today = () => new Date().toISOString().split("T")[0];

  // Deduct: annualDays first, then compDays. Returns { ok, newAnnual, newComp }
  const calcDeduct = (emp, dur) => {
    const total = +(emp.annualDays + emp.compDays).toFixed(1);
    if (total < dur) return { ok: false };
    let remain = dur;
    let newAnnual = emp.annualDays;
    let newComp   = emp.compDays;
    if (newAnnual >= remain) {
      newAnnual = +(newAnnual - remain).toFixed(1);
      remain = 0;
    } else {
      remain = +(remain - newAnnual).toFixed(1);
      newAnnual = 0;
      newComp = +(newComp - remain).toFixed(1);
    }
    return { ok: true, newAnnual, newComp };
  };

  // ── Admin: adjust single ────────────────────────────────────────────────
  const doAdjust = async () => {
    if (!adjTarget) { notify("請選擇同工", "error"); return; }
    if (!adjNote.trim()) { notify("請填寫說明", "error"); return; }
    const emp = employees.find(e => e.id === adjTarget);
    const delta = adjDir === "+" ? +adjAmt : -adjAmt;
    const newVal = Math.max(0, +(emp[adjField] + delta).toFixed(1));
    const newAnnual = adjField === "annualDays" ? newVal : emp.annualDays;
    const newComp   = adjField === "compDays"   ? newVal : emp.compDays;
    await updateEmployeeDays(emp.id, newAnnual, newComp);
    await addLeaveRecord({
      empId: emp.id, empName: emp.name,
      type: adjField === "annualDays" ? "匠假期日（調整）" : "補休（調整）",
      date: today(), duration: `${adjDir}${adjAmt}天`, note: adjNote, by: "管理員",
    });
    notify(`已${adjDir === "+" ? "增加" : "扣除"} ${emp.name} ${adjAmt} 天`);
    setAdjNote("");
  };

  // ── Admin: bulk add ────────────────────────────────────────────────────
  const doBulk = async () => {
    if (!bulkNote.trim()) { notify("請填寫說明", "error"); return; }
    const delta = +bulkAmt;
    for (const emp of employees) {
      const newAnnual = bulkField === "annualDays" ? +(emp.annualDays + delta).toFixed(1) : emp.annualDays;
      const newComp   = bulkField === "compDays"   ? +(emp.compDays   + delta).toFixed(1) : emp.compDays;
      await updateEmployeeDays(emp.id, newAnnual, newComp);
      await addLeaveRecord({
        empId: emp.id, empName: emp.name,
        type: bulkField === "annualDays" ? "匠假期日（全員）" : "補休（全員）",
        date: today(), duration: `+${delta}天`, note: bulkNote, by: "管理員",
      });
    }
    notify(`✅ 已為全部 ${employees.length} 人各增加 ${delta} 天`);
    setBulkNote("");
  };

  // ── Admin: register leave ───────────────────────────────────────────────
  const doRegLeave = async () => {
    const emp = employees.find(e => e.id === regEmp);
    if (!emp) { notify("請選擇同工", "error"); return; }
    if (!regDateStart) { notify("請選擇日期", "error"); return; }
    const dur = regDur === "custom" ? +regCustomDays : +regDur;
    if (!dur || dur <= 0) { notify("請輸入有效天數", "error"); return; }
    const result = calcDeduct(emp, dur);
    if (!result.ok) { notify(`${emp.name} 假期不足！`, "error"); return; }
    await updateEmployeeDays(emp.id, result.newAnnual, result.newComp);
    const dateLabel = regDur === "0.5" ? regDateStart
      : regDur === "1"      ? regDateStart
      : `${regDateStart} 起 ${dur} 天`;
    const durLabel = regDur === "0.5" ? "半天" : regDur === "1" ? "全天" : `${dur} 天`;
    await addLeaveRecord({
      empId: emp.id, empName: emp.name,
      type: "請假（扣除）",
      date: dateLabel,
      duration: durLabel,
      note: regNote || "請假", by: "管理員",
    });
    notify(`${emp.name} 請假 ${durLabel} 已登記`);
    setRegNote(""); setRegDateStart("");
  };

  // ── Employee: apply leave (no approval needed) ──────────────────────────
  const doEmpLeave = async () => {
    const emp = employees.find(e => e.id === currentUser.id);
    if (!empDateStart) { notify("請選擇日期", "error"); return; }
    const dur = empDur === "custom" ? +empCustomDays : +empDur;
    if (!dur || dur <= 0) { notify("請輸入有效天數", "error"); return; }
    const result = calcDeduct(emp, dur);
    if (!result.ok) { notify("假期不足！", "error"); return; }
    await updateEmployeeDays(emp.id, result.newAnnual, result.newComp);
    const dateLabel = empDur === "0.5" ? empDateStart
      : empDur === "1"      ? empDateStart
      : `${empDateStart} 起 ${dur} 天`;
    const durLabel = empDur === "0.5" ? "半天" : empDur === "1" ? "全天" : `${dur} 天`;
    await addLeaveRecord({
      empId: emp.id, empName: emp.name,
      type: "請假",
      date: dateLabel,
      duration: durLabel,
      note: empNote || "請假", by: emp.name,
    });
    notify("請假成功！");
    setSuccessModal({ title: "✅ 請假登記成功", body: `已登記 ${durLabel} 請假（${empDateStart}），假期已自動扣除。` });
    setEmpNote(""); setEmpDateStart("");
  };

  // ── Employee: submit OT → directly add comp days, no approval ─────────
  const doOT = async () => {
    if (!otDateStart) { notify("請選擇日期", "error"); return; }
    const dur = otDur === "custom" ? +otCustomDays : +otDur;
    if (!dur || dur <= 0) { notify("請輸入有效天數", "error"); return; }
    const emp = employees.find(e => e.id === currentUser.id);
    await updateEmployeeDays(emp.id, emp.annualDays, +(emp.compDays + dur).toFixed(1));
    const durLabel = otDur === "0.5" ? "半天" : otDur === "1" ? "全天" : `${dur} 天`;
    const dateLabel = otDur === "custom" ? `${otDateStart}（共 ${dur} 天）` : otDateStart;
    await addLeaveRecord({
      empId: emp.id, empName: emp.name,
      type: "補休（加班）", date: dateLabel,
      duration: `+${durLabel}`, note: "同工自行登記加班", by: emp.name,
    });
    notify(`✅ 已新增補休 ${durLabel}`);
    setSuccessModal({ title: "✅ 加班補休登記成功", body: `已新增 ${durLabel} 補休（${otDateStart}），補休天數已即時更新。` });
    setOtDateStart(""); setOtCustomDays("2");
  };

  // ── Admin: approve OT ───────────────────────────────────────────────────
  const approveOT = async (req) => {
    const emp = employees.find(e => e.id === req.empId);
    if (!emp) return;
    await updateEmployeeDays(emp.id, emp.annualDays, +(emp.compDays + req.dur).toFixed(1));
    await updateOtStatus(req.id, "approved");
    await addLeaveRecord({
      empId: emp.id, empName: emp.name,
      type: "補休（加班核准）", date: req.date,
      duration: `+${req.dur}天`, note: "加班登記核准", by: "管理員",
    });
    notify(`已核准 ${req.empName} 的登記，+${req.dur} 天補休`);
  };

  const rejectOT = async (id) => {
    await updateOtStatus(id, "rejected");
    notify("已拒絕登記", "error");
  };

  // ── Employee management ─────────────────────────────────────────────────
  const addEmployee = async () => {
    if (!newName.trim()) return;
    const id = `emp_${Date.now()}`;
    const emp = { id, name: newName.trim(), annualDays: +newAnnual, compDays: 0 };
    await saveEmployee(emp);
    notify(`已新增同工「${emp.name}」`);
    setNewName(""); setNewAnnual(10);
  };

  const removeEmployee = async (id) => {
    await deleteEmployee(id);
    notify("已刪除同工", "error");
  };

  // ── Admin: delete record ────────────────────────────────────────────────
  const deleteRecord = async (rec) => {
    if (!window.confirm(`確定要刪除「${rec.empName} ${rec.type} ${rec.duration}」這筆紀錄嗎？`)) return;
    await deleteLeaveRecord(rec.id);
    notify("已刪除紀錄", "error");
  };

  // ── Admin: edit record ──────────────────────────────────────────────────
  const openEditRec = (rec) => {
    setEditRec(rec);
    setEditNote(rec.note || "");
    setEditDate(rec.date || "");
    setEditDuration(rec.duration || "");
  };

  const saveEditRec = async () => {
    if (!editRec) return;
    await updateLeaveRecord(editRec.id, {
      note: editNote,
      date: editDate,
      duration: editDuration,
    });
    notify("紀錄已更新");
    setEditRec(null);
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const me        = currentUser ? employees.find(e => e.id === currentUser.id) : null;
  const myRecs    = me ? leaveRecords.filter(r => r.empId === me.id) : [];
  const myOtReqs  = me ? otRequests.filter(r => r.empId === me.id) : [];
  const pendingOt = otRequests.filter(r => r.status === "pending");

  // ── Sub-components ───────────────────────────────────────────────────────
  const Tog = ({ val, opts, onChange }) => (
    <div style={S.toggle}>
      {opts.map(([v, label]) => (
        <button key={v} onClick={() => onChange(v)}
          style={{ ...S.toggleBtn, ...(val === v ? S.toggleActive : {}) }}>{label}</button>
      ))}
    </div>
  );

  // Duration picker: 半天 / 全天 / 多天
  const DurPicker = ({ dur, setDur, customDays, setCustomDays, dateStart, setDateStart, showHalf = true }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={S.toggle}>
        {showHalf && <button onClick={() => setDur("0.5")} style={{ ...S.toggleBtn, ...(dur === "0.5" ? S.toggleActive : {}) }}>半天</button>}
        <button onClick={() => setDur("1")} style={{ ...S.toggleBtn, ...(dur === "1" ? S.toggleActive : {}) }}>全天</button>
        <button onClick={() => setDur("custom")} style={{ ...S.toggleBtn, ...(dur === "custom" ? S.toggleActive : {}) }}>多天</button>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)}
          style={{ ...S.input, flex:1, minWidth:130 }} placeholder="開始日期" />
        {dur === "custom" && <>
          <span style={{ color:"#64748b", fontSize:13, whiteSpace:"nowrap" }}>共</span>
          <input type="number" min="0.5" step="0.5" value={customDays}
            onChange={e => setCustomDays(e.target.value)}
            style={{ ...S.input, width:70 }} />
          <span style={{ color:"#64748b", fontSize:13, whiteSpace:"nowrap" }}>天</span>
        </>}
      </div>
    </div>
  );

  // ── Success Modal ────────────────────────────────────────────────────────
  const SuccessModal = () => !successModal ? null : (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:24 }}>
      <div style={{ background:"#fff", borderRadius:20, padding:36, width:"100%", maxWidth:380, boxShadow:"0 25px 60px rgba(0,0,0,0.3)", textAlign:"center", fontFamily:"inherit" }}>
        <div style={{ fontSize:52, marginBottom:12 }}>🎉</div>
        <h2 style={{ fontSize:18, fontWeight:900, color:"#1e293b", marginBottom:10 }}>{successModal.title}</h2>
        <p style={{ fontSize:14, color:"#64748b", marginBottom:24, lineHeight:1.6 }}>{successModal.body}</p>
        <button
          onClick={() => setSuccessModal(null)}
          style={{ background:"#2563eb", color:"#fff", border:"none", borderRadius:10, padding:"11px 32px", cursor:"pointer", fontSize:14, fontWeight:700, fontFamily:"inherit" }}>
          確定
        </button>
      </div>
    </div>
  );

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={S.loading}>⏳ 載入中...</div>
  );

  // ────────────────────────────────────────────────────────────────────────
  //  LANDING
  // ────────────────────────────────────────────────────────────────────────
  if (!role) return (
    <div style={S.landing}>
      <SuccessModal />
      <div style={S.landingCard}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:46 }}>🌿</div>
          <h1 style={{ fontSize:22, fontWeight:900, color:"#1e293b", margin:"8px 0 4px" }}>假期管理系統</h1>
          <p style={{ color:"#94a3b8", fontSize:13, margin:0 }}>Leave Management System</p>
        </div>

        {/* Summary table */}
        <div style={{ ...S.tableWrap, marginBottom:22 }}>
          <table style={S.table}>
            <thead>
              <tr>{["同工","匠假期日","補休","合計"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id} style={S.tr}>
                  <td style={S.td}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={S.avatar}>{e.name[0]}</span>{e.name}
                    </div>
                  </td>
                  <td style={S.td}><span style={{ ...S.badge, background:"#dcfce7", color:"#16a34a" }}>{e.annualDays} 天</span></td>
                  <td style={S.td}><span style={{ ...S.badge, background:"#dbeafe", color:"#1d4ed8" }}>{e.compDays} 天</span></td>
                  <td style={S.td}><strong>{+(e.annualDays + e.compDays).toFixed(1)} 天</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
          {/* Employee login */}
          <div style={S.loginBox}>
            <div style={{ fontSize:20 }}>👤</div>
            <h2 style={S.loginTitle}>同工登入</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:200, overflowY:"auto" }}>
              {employees.map(emp => (
                <button key={emp.id} onClick={() => loginEmp(emp)} style={S.empBtn}>
                  <span style={S.avatar}>{emp.name[0]}</span>
                  <span style={{ fontSize:13 }}>{emp.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Admin login */}
          <div style={S.loginBox}>
            <div style={{ fontSize:20 }}>🔐</div>
            <h2 style={S.loginTitle}>管理員</h2>
            <input type="password" placeholder="輸入密碼" value={adminPw}
              onChange={e => { setAdminPw(e.target.value); setPwError(false); }}
              onKeyDown={e => e.key === "Enter" && loginAdmin()}
              style={{ ...S.input, borderColor: pwError ? "#ef4444" : "#e2e8f0" }} />
            {pwError && <p style={{ color:"#ef4444", fontSize:12, margin:0 }}>密碼錯誤</p>}
            <button onClick={loginAdmin} style={{ ...S.btnPrimary, width:"100%" }}>登入</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ────────────────────────────────────────────────────────────────────────
  //  ADMIN
  // ────────────────────────────────────────────────────────────────────────
  if (role === "admin") return (
    <div style={S.app}>
      <SuccessModal />
      {notification && <div style={{ ...S.toast, background: notification.type === "error" ? "#ef4444" : "#10b981" }}>{notification.msg}</div>}
      <nav style={S.nav}>
        <div style={S.brand}>🌿 假期管理 <span style={S.adminBadge}>管理員</span></div>
        <div style={S.tabs}>
          {[
            ["dashboard","📊 總覽"],
            ["bulk","➕ 全員加假"],
            ["adjust","✏️ 個人調整"],
            ["leave","📝 登記請假"],
            ["records","📋 紀錄"],
            ["employees","👥 同工管理"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setView(id)}
              style={{ ...S.tab, ...(view === id ? S.tabActive : {}) }}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={logout} style={S.logoutBtn}>登出</button>
      </nav>
      <main style={S.main}>

        {/* ── 總覽 ── */}
        {view === "dashboard" && <>
          <h2 style={S.title}>同工假期總覽</h2>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>{["同工","匠假期日","補休","合計可用"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {employees.map(e => (
                  <tr key={e.id} style={S.tr}>
                    <td style={S.td}><div style={{ display:"flex", alignItems:"center", gap:10 }}><span style={S.avatar}>{e.name[0]}</span>{e.name}</div></td>
                    <td style={S.td}><span style={{ ...S.badge, background: e.annualDays < 3 ? "#fef2f2" : "#dcfce7", color: e.annualDays < 3 ? "#dc2626" : "#16a34a" }}>{e.annualDays} 天</span></td>
                    <td style={S.td}><span style={{ ...S.badge, background:"#dbeafe", color:"#1d4ed8" }}>{e.compDays} 天</span></td>
                    <td style={S.td}><strong>{+(e.annualDays + e.compDays).toFixed(1)} 天</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

        {/* ── 全員加假 ── */}
        {view === "bulk" && <>
          <h2 style={S.title}>全員增加假期</h2>
          <div style={S.card}>
            <p style={{ color:"#64748b", fontSize:14, marginBottom:18 }}>一次為所有同工增加天數。</p>
            <div style={S.formGrid}>
              <div style={S.fg}>
                <label style={S.label}>假期類型</label>
                <Tog val={bulkField} onChange={setBulkField} opts={[["annualDays","匠假期日"],["compDays","補休"]]} />
              </div>
              <div style={S.fg}>
                <label style={S.label}>增加天數</label>
                <input type="number" min="0.5" step="0.5" placeholder="例如 1、2.5…"
                  value={bulkAmt} onChange={e => setBulkAmt(e.target.value)} style={S.input} />
              </div>
              <div style={{ ...S.fg, gridColumn:"1 / -1" }}>
                <label style={S.label}>說明 <span style={S.req}>*</span></label>
                <input placeholder="例如：年度假期發放、連假補假..." value={bulkNote}
                  onChange={e => setBulkNote(e.target.value)} style={S.input} />
              </div>
            </div>
            <div style={S.previewBox}>
              將為 <strong>{employees.length}</strong> 位同工各增加 <strong>{bulkAmt} 天</strong>
              （{bulkField === "annualDays" ? "匠假期日" : "補休"}）：{employees.map(e => e.name).join("、")}
            </div>
            <button onClick={doBulk} style={{ ...S.btnPrimary, background:"#7c3aed" }}>✓ 確認全員加假</button>
          </div>
        </>}

        {/* ── 個人調整 ── */}
        {view === "adjust" && <>
          <h2 style={S.title}>個人天數調整</h2>
          <div style={S.card}>
            <div style={S.formGrid}>
              <div style={S.fg}>
                <label style={S.label}>選擇同工</label>
                <select value={adjTarget} onChange={e => setAdjTarget(e.target.value)} style={S.select}>
                  <option value="">-- 選擇同工 --</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div style={S.fg}>
                <label style={S.label}>假期類型</label>
                <Tog val={adjField} onChange={setAdjField} opts={[["annualDays","匠假期日"],["compDays","補休"]]} />
              </div>
              <div style={S.fg}>
                <label style={S.label}>操作</label>
                <div style={S.toggle}>
                  <button onClick={() => setAdjDir("+")} style={{ ...S.toggleBtn, ...(adjDir === "+" ? S.toggleActive : {}) }}>＋ 增加</button>
                  <button onClick={() => setAdjDir("-")} style={{ ...S.toggleBtn, ...(adjDir === "-" ? { ...S.toggleActive, background:"#fef2f2", color:"#dc2626", borderColor:"#fca5a5" } : {}) }}>－ 扣除</button>
                </div>
              </div>
              <div style={S.fg}>
                <label style={S.label}>天數</label>
                <input type="number" min="0.5" step="0.5" placeholder="例如 0.5、1、3…"
                  value={adjAmt} onChange={e => setAdjAmt(e.target.value)} style={S.input} />
              </div>
              <div style={{ ...S.fg, gridColumn:"1 / -1" }}>
                <label style={S.label}>說明 <span style={S.req}>*</span></label>
                <input placeholder="例如：年度調整、特殊假期..." value={adjNote}
                  onChange={e => setAdjNote(e.target.value)} style={S.input} />
              </div>
            </div>
            {adjTarget && (() => {
              const e = employees.find(x => x.id === adjTarget);
              return e ? <div style={S.infoBox}>{e.name}｜匠假期日 {e.annualDays} 天｜補休 {e.compDays} 天</div> : null;
            })()}
            <button onClick={doAdjust} style={S.btnPrimary}>確認調整</button>
          </div>
        </>}

        {/* ── 登記請假 ── */}
        {view === "leave" && <>
          <h2 style={S.title}>登記同工請假</h2>
          <div style={S.card}>
            <div style={S.infoBox}>系統自動扣除：先扣匠假期日，不足再扣補休。</div>
            <div style={S.formGrid}>
              <div style={S.fg}>
                <label style={S.label}>同工</label>
                <select value={regEmp} onChange={e => setRegEmp(e.target.value)} style={S.select}>
                  <option value="">-- 選擇同工 --</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div style={S.fg}>
                <label style={S.label}>請假天數 / 日期</label>
                <DurPicker
                  dur={regDur} setDur={setRegDur}
                  customDays={regCustomDays} setCustomDays={setRegCustomDays}
                  dateStart={regDateStart} setDateStart={setRegDateStart}
                />
              </div>
              <div style={{ ...S.fg, gridColumn:"1 / -1" }}>
                <label style={S.label}>詳細內容</label>
                <textarea placeholder="請假原因、備註..." value={regNote}
                  onChange={e => setRegNote(e.target.value)} style={S.textarea} />
              </div>
            </div>
            {regEmp && (() => {
              const e = employees.find(x => x.id === regEmp);
              return e ? <div style={S.infoBox}>{e.name}｜匠假期日 {e.annualDays} 天｜補休 {e.compDays} 天｜合計 {+(e.annualDays+e.compDays).toFixed(1)} 天</div> : null;
            })()}
            <button onClick={doRegLeave} style={S.btnPrimary}>確認登記</button>
          </div>
        </>}

        {/* ── 加班審核 ── */}
        {/* ── 所有紀錄 ── */}
        {view === "records" && <>
          <h2 style={S.title}>所有紀錄</h2>

          {/* Edit modal */}
          {editRec && (
            <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
              <div style={{ background:"#fff", borderRadius:16, padding:28, width:"100%", maxWidth:420, boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:"#1e293b", marginBottom:16 }}>編輯紀錄</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={S.fg}>
                    <label style={S.label}>同工</label>
                    <div style={{ fontSize:13, color:"#334155", padding:"9px 11px", background:"#f8fafc", borderRadius:8 }}>{editRec.empName}</div>
                  </div>
                  <div style={S.fg}>
                    <label style={S.label}>類型</label>
                    <div style={{ fontSize:13, color:"#334155", padding:"9px 11px", background:"#f8fafc", borderRadius:8 }}>{editRec.type}</div>
                  </div>
                  <div style={S.fg}>
                    <label style={S.label}>日期</label>
                    <input value={editDate} onChange={e => setEditDate(e.target.value)} style={S.input} placeholder="例如 2025-04-10" />
                  </div>
                  <div style={S.fg}>
                    <label style={S.label}>天數</label>
                    <input value={editDuration} onChange={e => setEditDuration(e.target.value)} style={S.input} placeholder="例如 半天、全天、3 天" />
                  </div>
                  <div style={S.fg}>
                    <label style={S.label}>詳細內容</label>
                    <textarea value={editNote} onChange={e => setEditNote(e.target.value)} style={S.textarea} />
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, marginTop:18 }}>
                  <button onClick={saveEditRec} style={S.btnPrimary}>儲存</button>
                  <button onClick={() => setEditRec(null)} style={{ ...S.btnPrimary, background:"#64748b" }}>取消</button>
                </div>
              </div>
            </div>
          )}

          {leaveRecords.length === 0
            ? <div style={S.empty}>目前沒有紀錄</div>
            : (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead><tr>{["同工","類型","日期","天數","詳細內容","操作者","操作"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {leaveRecords.map(r => (
                    <tr key={r.id} style={S.tr}>
                      <td style={S.td}>{r.empName}</td>
                      <td style={S.td}><span style={r.type.includes("補休") ? S.tagComp : S.tagAnnual}>{r.type}</span></td>
                      <td style={S.td}>{r.date || "—"}</td>
                      <td style={S.td}>{r.duration}</td>
                      <td style={S.td}>{r.note}</td>
                      <td style={S.td}>{r.by}</td>
                      <td style={S.td}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={() => openEditRec(r)} style={{ ...S.btnSm, background:"#eff6ff", color:"#2563eb" }}>✏️ 編輯</button>
                          <button onClick={() => deleteRecord(r)} style={{ ...S.btnSm, background:"#fef2f2", color:"#dc2626" }}>✕ 刪除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>}

        {/* ── 同工管理 ── */}
        {view === "employees" && <>
          <h2 style={S.title}>同工管理</h2>
          <div style={S.card}>
            <h3 style={{ ...S.label, fontSize:14, marginBottom:12 }}>新增同工</h3>
            <div style={S.formGrid}>
              <div style={S.fg}>
                <label style={S.label}>姓名</label>
                <input placeholder="同工姓名" value={newName} onChange={e => setNewName(e.target.value)} style={S.input} />
              </div>
              <div style={S.fg}>
                <label style={S.label}>初始匠假期日天數</label>
                <input type="number" min="0" value={newAnnual} onChange={e => setNewAnnual(e.target.value)} style={S.input} />
              </div>
            </div>
            <button onClick={addEmployee} style={S.btnPrimary}>新增同工</button>
          </div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>{["姓名","匠假期日","補休","操作"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {employees.map(e => (
                  <tr key={e.id} style={S.tr}>
                    <td style={S.td}><div style={{ display:"flex", alignItems:"center", gap:10 }}><span style={S.avatar}>{e.name[0]}</span>{e.name}</div></td>
                    <td style={S.td}>{e.annualDays} 天</td>
                    <td style={S.td}>{e.compDays} 天</td>
                    <td style={S.td}>
                      <button onClick={() => removeEmployee(e.id)}
                        style={{ ...S.btnSm, background:"#fef2f2", color:"#dc2626" }}>刪除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

      </main>
    </div>
  );

  // ────────────────────────────────────────────────────────────────────────
  //  EMPLOYEE
  // ────────────────────────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      <SuccessModal />
      {notification && <div style={{ ...S.toast, background: notification.type === "error" ? "#ef4444" : "#10b981" }}>{notification.msg}</div>}
      <nav style={S.nav}>
        <div style={S.brand}>🌿 假期管理</div>
        <div style={S.tabs}>
          {[
            ["my-leave","📅 我的假期"],
            ["apply-leave","📝 登記請假"],
            ["apply-ot","⏰ 登記加班補休"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setView(id)}
              style={{ ...S.tab, ...(view === id ? S.tabActive : {}) }}>{label}</button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ color:"#cbd5e1", fontSize:13 }}>👤 {me?.name}</span>
          <button onClick={logout} style={S.logoutBtn}>登出</button>
        </div>
      </nav>
      <main style={S.main}>

        {/* ── 我的假期 ── */}
        {view === "my-leave" && <>
          <h2 style={S.title}>我的假期</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
            {[
              { label:"匠假期日",  val: me?.annualDays, color:"#10b981" },
              { label:"補休",      val: me?.compDays,   color:"#3b82f6" },
              { label:"合計可用",  val: +((me?.annualDays||0)+(me?.compDays||0)).toFixed(1), color:"#8b5cf6" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ ...S.statCard, borderTop:`4px solid ${color}` }}>
                <div style={{ fontSize:34, fontWeight:900, color:"#1e293b" }}>{val}</div>
                <div style={{ color:"#64748b", fontSize:12, marginTop:4 }}>{label}（天）</div>
              </div>
            ))}
          </div>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#374151", marginBottom:10 }}>假期紀錄</h3>
          {myRecs.length === 0
            ? <div style={S.empty}>目前沒有紀錄</div>
            : (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead><tr>{["類型","日期","天數","詳細內容"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {myRecs.map(r => (
                    <tr key={r.id} style={S.tr}>
                      <td style={S.td}><span style={r.type.includes("補休") ? S.tagComp : S.tagAnnual}>{r.type}</span></td>
                      <td style={S.td}>{r.date || "—"}</td>
                      <td style={S.td}>{r.duration}</td>
                      <td style={S.td}>{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>}

        {/* ── 登記請假 ── */}
        {view === "apply-leave" && <>
          <h2 style={S.title}>登記請假</h2>
          <div style={S.card}>
            <div style={S.infoBox}>
              匠假期日：<strong>{me?.annualDays} 天</strong>｜補休：<strong>{me?.compDays} 天</strong>
              <br /><span style={{ fontSize:12 }}>系統自動扣除，先扣匠假期日，不足再扣補休。</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:16 }}>
              <div style={S.fg}>
                <label style={S.label}>請假天數 / 日期</label>
                <DurPicker
                  dur={empDur} setDur={setEmpDur}
                  customDays={empCustomDays} setCustomDays={setEmpCustomDays}
                  dateStart={empDateStart} setDateStart={setEmpDateStart}
                />
              </div>
              <div style={S.fg}>
                <label style={S.label}>詳細內容</label>
                <textarea placeholder="請假原因、備註..." value={empNote}
                  onChange={e => setEmpNote(e.target.value)} style={S.textarea} />
              </div>
            </div>
            <button onClick={doEmpLeave} style={S.btnPrimary}>確認登記請假</button>
          </div>
        </>}

        {/* ── 登記加班補休 ── */}
        {view === "apply-ot" && <>
          <h2 style={S.title}>登記加班補休</h2>
          <div style={S.card}>
            <div style={S.infoBox}>填入加班日期與天數，系統即時新增補休，不需審核。</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
              <label style={S.label}>加班天數 / 日期</label>
              <DurPicker
                dur={otDur} setDur={setOtDur}
                customDays={otCustomDays} setCustomDays={setOtCustomDays}
                dateStart={otDateStart} setDateStart={setOtDateStart}
                showHalf={true}
              />
            </div>
            <button onClick={doOT} style={S.btnPrimary}>確認新增補休</button>
          </div>
        </>}

      </main>
    </div>
  );
}
