import { useState, useEffect } from "react";
import {
  listenEmployees, listenLeaveRecords, listenOtRequests,
  saveEmployee, deleteEmployee, updateEmployeeDays,
  addLeaveRecord, deleteLeaveRecord, updateLeaveRecord,
  addOtRequest, updateOtStatus,
  callAddLeaveToCalendar,
} from "./firebase.js";

const ADMIN_PASSWORD = "350350";

const statusStyle = (s) => ({
  background: s === "pending" ? "#fef9c3" : s === "approved" ? "#f0fdf4" : "#fef2f2",
  color:      s === "pending" ? "#854d0e" : s === "approved" ? "#16a34a" : "#dc2626",
});

const F = "'Noto Sans TC','PingFang TC',sans-serif";

const S = {
  app:          { minHeight:"100vh", background:"#f1f5f9", fontFamily:F },
  nav:          { background:"#1e293b", color:"#fff", padding:"0 20px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", minHeight:54 },
  brand:        { fontWeight:900, fontSize:15, whiteSpace:"nowrap", marginRight:4 },
  adminBadge:   { background:"#f59e0b", color:"#1e293b", borderRadius:5, padding:"2px 7px", fontSize:10, fontWeight:800, marginLeft:6 },
  tabs:         { display:"flex", gap:2, flex:1, flexWrap:"wrap" },
  tab:          { background:"transparent", border:"none", color:"#94a3b8", padding:"15px 10px", cursor:"pointer", fontSize:12, fontWeight:500, borderBottom:"3px solid transparent", whiteSpace:"nowrap", fontFamily:F },
  tabActive:    { color:"#fff", borderBottom:"3px solid #3b82f6" },
  logoutBtn:    { background:"#374151", color:"#d1d5db", border:"none", borderRadius:7, padding:"6px 12px", cursor:"pointer", fontSize:12, fontFamily:F },
  main:         { maxWidth:920, margin:"0 auto", padding:24 },
  title:        { fontSize:21, fontWeight:900, color:"#1e293b", marginBottom:20 },
  card:         { background:"#fff", borderRadius:14, padding:22, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", marginBottom:20 },
  formGrid:     { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 },
  fg:           { display:"flex", flexDirection:"column", gap:6 },
  label:        { fontSize:12, fontWeight:700, color:"#475569" },
  req:          { color:"#ef4444" },
  input:        { padding:"9px 11px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:13, color:"#1e293b", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:F },
  select:       { padding:"9px 11px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:13, color:"#1e293b", background:"#fff", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:F },
  textarea:     { padding:"9px 11px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:13, color:"#1e293b", outline:"none", width:"100%", boxSizing:"border-box", fontFamily:F, resize:"vertical", minHeight:70 },
  toggle:       { display:"flex", gap:6 },
  toggleBtn:    { flex:1, padding:"9px 10px", border:"1.5px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontSize:12, background:"#f8fafc", color:"#64748b", fontWeight:600, fontFamily:F },
  toggleActive: { background:"#eff6ff", color:"#2563eb", borderColor:"#93c5fd" },
  btnPrimary:   { background:"#2563eb", color:"#fff", border:"none", borderRadius:9, padding:"10px 22px", cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:F },
  btnSm:        { background:"#f0fdf4", color:"#16a34a", border:"none", borderRadius:7, padding:"5px 10px", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:F },
  tableWrap:    { background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.07)", overflowX:"auto", marginBottom:20 },
  table:        { width:"100%", borderCollapse:"collapse" },
  th:           { padding:"11px 14px", background:"#f8fafc", fontWeight:700, fontSize:12, color:"#475569", textAlign:"left", borderBottom:"1px solid #e2e8f0" },
  tr:           { borderBottom:"1px solid #f1f5f9" },
  td:           { padding:"12px 14px", fontSize:13, color:"#334155" },
  badge:        { display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 },
  tagAnnual:    { background:"#dcfce7", color:"#16a34a", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 },
  tagComp:      { background:"#dbeafe", color:"#1d4ed8", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 },
  infoBox:      { background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:8, padding:"9px 13px", fontSize:13, color:"#0369a1", marginBottom:14 },
  previewBox:   { background:"#faf5ff", border:"1px solid #d8b4fe", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#6d28d9", marginBottom:16 },
  alertBox:     { background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:10, padding:"11px 14px", fontSize:13, color:"#92400e", marginBottom:18, display:"flex", alignItems:"center", gap:10 },
  alertBtn:     { background:"#f59e0b", color:"#fff", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:F },
  empty:        { background:"#fff", borderRadius:14, padding:36, textAlign:"center", color:"#94a3b8", fontSize:13 },
  toast:        { position:"fixed", top:20, right:20, color:"#fff", padding:"11px 18px", borderRadius:10, fontSize:13, fontWeight:700, zIndex:9999, boxShadow:"0 4px 12px rgba(0,0,0,0.2)", fontFamily:F },
  loading:      { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#64748b", fontFamily:F },
  landing:      { minHeight:"100vh", background:"linear-gradient(135deg,#1e293b,#0f172a)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:F, position:"relative" },
  landingCard:  { background:"#fff", borderRadius:20, padding:36, width:"100%", maxWidth:680, boxShadow:"0 25px 60px rgba(0,0,0,0.35)" },
  backBtn:      { background:"transparent", border:"none", color:"#2563eb", cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:F, marginBottom:16, padding:0 },
};

export default function App() {
  const [employees, setEmployees]       = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [otRequests, setOtRequests]     = useState([]);
  const [loading, setLoading]           = useState(true);

  const [role, setRole]                 = useState(null);
  const [currentUser, setCurrentUser]   = useState(null);
  const [adminPw, setAdminPw]           = useState("");
  const [pwError, setPwError]           = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [view, setView]                 = useState("dashboard");
  const [notification, setNotification] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [detailView, setDetailView]     = useState("records");

  // Admin form states
  const [adjTarget, setAdjTarget] = useState("");
  const [adjField, setAdjField]   = useState("annualDays");
  const [adjDir, setAdjDir]       = useState("+");
  const [adjAmt, setAdjAmt]       = useState("");
  const [adjNote, setAdjNote]     = useState("");
  const [bulkField, setBulkField] = useState("annualDays");
  const [bulkAmt, setBulkAmt]     = useState("");
  const [bulkNote, setBulkNote]   = useState("");
  const [regEmp, setRegEmp]             = useState("");
  const [regDur, setRegDur]             = useState("1");
  const [regCustomDays, setRegCustomDays] = useState("");
  const [regDateStart, setRegDateStart] = useState("");
  const [regNote, setRegNote]           = useState("");
  const [otViewFilter, setOtViewFilter] = useState("pending");
  const [newName, setNewName]     = useState("");
  const [newAnnual, setNewAnnual] = useState(10);
  const [editRec, setEditRec]         = useState(null);
  const [editNote, setEditNote]       = useState("");
  const [editDate, setEditDate]       = useState("");
  const [editDuration, setEditDuration] = useState("");

  // Employee form states
  const [empDur, setEmpDur]             = useState("1");
  const [empCustomDays, setEmpCustomDays] = useState("");
  const [empDateStart, setEmpDateStart] = useState("");
  const [otDur, setOtDur]               = useState("1");
  const [otCustomDays, setOtCustomDays] = useState("");
  const [otDateStart, setOtDateStart]   = useState("");
  const [otNote, setOtNote]             = useState("");

  // ── Firestore ────────────────────────────────────────────────────────────
  useEffect(() => {
    let n = 0;
    const done = () => { n++; if (n >= 3) setLoading(false); };
    const u1 = listenEmployees(data => {
      setEmployees(data);
      done();
    });
    const u2 = listenLeaveRecords(data => { setLeaveRecords(data); done(); });
    const u3 = listenOtRequests(data  => { setOtRequests(data);   done(); });
    return () => { u1(); u2(); u3(); };
  }, []);

  useEffect(() => {
    if (currentUser) {
      const u = employees.find(e => e.id === currentUser.id);
      if (u) setCurrentUser(u);
    }
  }, [employees]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const notify = (msg, type = "success") => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 3000); };
  const showSuccess = (title, body) => setSuccessModal({ title, body });
  const today = () => new Date().toISOString().split("T")[0];

  const loginAdmin = () => {
    if (adminPw === ADMIN_PASSWORD) { setRole("admin"); setView("dashboard"); setPwError(false); setShowAdminLogin(false); }
    else setPwError(true);
  };
  const loginEmp = (emp) => { setCurrentUser(emp); setRole("employee"); setDetailView("records"); };
  const logout = () => { setRole(null); setCurrentUser(null); setAdminPw(""); setShowAdminLogin(false); };

  const calcDeduct = (emp, dur) => {
    const total = +(emp.annualDays + emp.compDays).toFixed(1);
    if (total < dur) return { ok: false };
    let remain = dur, na = emp.annualDays, nc = emp.compDays;
    if (na >= remain) { na = +(na - remain).toFixed(1); remain = 0; }
    else { remain = +(remain - na).toFixed(1); na = 0; nc = +(nc - remain).toFixed(1); }
    return { ok: true, newAnnual: na, newComp: nc };
  };

  const getDurVal   = (dur) => +dur;
  const getDurLabel = (dur) => dur === "0.5" ? "半天" : dur === "1" ? "全天" : `${dur} 天`;

  // ── Admin actions ────────────────────────────────────────────────────────
  const doAdjust = async () => {
    if (!adjTarget) { notify("請選擇同工", "error"); return; }
    if (!adjNote.trim()) { notify("請填寫說明", "error"); return; }
    if (!adjAmt || +adjAmt <= 0) { notify("請輸入有效天數", "error"); return; }
    const emp = employees.find(e => e.id === adjTarget);
    const delta = adjDir === "+" ? +adjAmt : -adjAmt;
    const newVal = Math.max(0, +(emp[adjField] + delta).toFixed(1));
    const na = adjField === "annualDays" ? newVal : emp.annualDays;
    const nc = adjField === "compDays"   ? newVal : emp.compDays;
    await updateEmployeeDays(emp.id, na, nc);
    await addLeaveRecord({ empId: emp.id, empName: emp.name,
      type: adjField === "annualDays" ? "匠愛假期（調整）" : "補休（調整）",
      date: today(), duration: `${adjDir}${adjAmt}天`, note: adjNote, by: "後台管理" });
    showSuccess("✅ 調整完成", `已${adjDir === "+" ? "增加" : "扣除"} ${emp.name} ${adjAmt} 天（${adjField === "annualDays" ? "匠愛假期" : "補休"}）`);
    setAdjNote(""); setAdjAmt("");
  };

  const doBulk = async () => {
    if (!bulkNote.trim()) { notify("請填寫說明", "error"); return; }
    if (!bulkAmt || +bulkAmt <= 0) { notify("請輸入天數", "error"); return; }
    const delta = +bulkAmt;
    for (const emp of employees) {
      const na = bulkField === "annualDays" ? +(emp.annualDays + delta).toFixed(1) : emp.annualDays;
      const nc = bulkField === "compDays"   ? +(emp.compDays   + delta).toFixed(1) : emp.compDays;
      await updateEmployeeDays(emp.id, na, nc);
      await addLeaveRecord({ empId: emp.id, empName: emp.name,
        type: bulkField === "annualDays" ? "匠愛假期（全員）" : "補休（全員）",
        date: today(), duration: `+${delta}天`, note: bulkNote, by: "後台管理" });
    }
    showSuccess("✅ 全員加假完成", `已為全部 ${employees.length} 位同工各增加 ${delta} 天（${bulkField === "annualDays" ? "匠愛假期" : "補休"}）`);
    setBulkNote(""); setBulkAmt("");
  };

  const doRegLeave = async () => {
    const emp = employees.find(e => e.id === regEmp);
    if (!emp) { notify("請選擇同工", "error"); return; }
    if (!regDateStart) { notify("請選擇請假日期", "error"); return; }
    const dur = getDurVal(regDur);
    if (!dur || dur <= 0) { notify("請輸入有效天數", "error"); return; }
    const result = calcDeduct(emp, dur);
    if (!result.ok) { notify(`${emp.name} 假期不足！`, "error"); return; }
    await updateEmployeeDays(emp.id, result.newAnnual, result.newComp);
    const dl = +regDur > 1 ? `${regDateStart} 起 ${dur} 天` : regDateStart;
    const label = getDurLabel(regDur);
    await addLeaveRecord({ empId: emp.id, empName: emp.name,
      type: "請假（扣除）", date: dl, duration: label,
      note: regNote || "請假", by: "後台管理" });
    // 寫入 Google 日曆
    try {
      await callAddLeaveToCalendar({ empName: emp.name, dateStart: regDateStart, days: dur, note: regNote || "請假" });
    } catch (e) { console.warn("日曆寫入失敗", e); }
    showSuccess("✅ 請假登記完成", `${emp.name} 請假 ${label}（${regDateStart}）已登記，並已加入共用行事曆。`);
    setRegNote(""); setRegDateStart("");
  };

  const approveOT = async (req) => {
    const emp = employees.find(e => e.id === req.empId);
    if (!emp) return;
    await updateEmployeeDays(emp.id, emp.annualDays, +(emp.compDays + req.dur).toFixed(1));
    await updateOtStatus(req.id, "approved");
    await addLeaveRecord({ empId: emp.id, empName: emp.name,
      type: "補休（加班核准）", date: req.date,
      duration: `+${req.dur}天`, note: req.note || "加班核准", by: "後台管理" });
    notify(`已核准 ${req.empName}，+${req.dur} 天補休`);
  };
  const rejectOT = async (id) => { await updateOtStatus(id, "rejected"); notify("已拒絕", "error"); };

  const addEmployee = async () => {
    if (!newName.trim()) return;
    const id = `emp_${Date.now()}`;
    await saveEmployee({ id, name: newName.trim(), annualDays: +newAnnual, compDays: 0 });
    showSuccess("✅ 新增同工完成", `「${newName.trim()}」已加入，初始匠愛假期 ${newAnnual} 天。`);
    setNewName(""); setNewAnnual(10);
  };
  const removeEmployee = async (id) => { await deleteEmployee(id); notify("已刪除同工", "error"); };

  const openEditRec = (rec) => { setEditRec(rec); setEditNote(rec.note||""); setEditDate(rec.date||""); setEditDuration(rec.duration||""); };
  const saveEditRec = async () => {
    await updateLeaveRecord(editRec.id, { note: editNote, date: editDate, duration: editDuration });
    notify("紀錄已更新"); setEditRec(null);
  };
  const deleteRecord = async (rec) => {
    if (!window.confirm(`確定要刪除「${rec.empName} ${rec.type} ${rec.duration}」？`)) return;
    await deleteLeaveRecord(rec.id); notify("已刪除紀錄", "error");
  };

  // ── Employee actions ─────────────────────────────────────────────────────
  const doEmpLeave = async () => {
    const emp = employees.find(e => e.id === currentUser.id);
    if (!empDateStart) { notify("請選擇請假日期", "error"); return; }
    const dur = getDurVal(empDur);
    if (!dur || dur <= 0) { notify("請輸入有效天數", "error"); return; }
    const result = calcDeduct(emp, dur);
    if (!result.ok) { notify("假期不足！", "error"); return; }
    await updateEmployeeDays(emp.id, result.newAnnual, result.newComp);
    const dl = +empDur > 1 ? `${empDateStart} 起 ${dur} 天` : empDateStart;
    await addLeaveRecord({ empId: emp.id, empName: emp.name,
      type: "請假", date: dl, duration: getDurLabel(empDur), note: "請假", by: emp.name });
    // 寫入 Google 日曆
    try {
      await callAddLeaveToCalendar({ empName: emp.name, dateStart: empDateStart, days: dur, note: "請假" });
    } catch (e) { console.warn("日曆寫入失敗", e); }
    showSuccess("✅ 請假登記成功", `已登記 ${getDurLabel(empDur)} 請假（${empDateStart}），假期已自動扣除，並已加入共用行事曆。`);
    setEmpDateStart(""); setEmpDur("1");
  };

  const doOT = async () => {
    if (!otDateStart) { notify("請選擇加班日期", "error"); return; }
    const dur = getDurVal(otDur);
    if (!dur || dur <= 0) { notify("請輸入有效天數", "error"); return; }
    await addOtRequest({ empId: currentUser.id, empName: currentUser.name,
      dur, date: otDateStart, note: otNote || "加班", status: "pending" });
    showSuccess("✅ 加班補休登記成功", `加班補休申請已送出，待後台審核後計入補休天數。`);
    setOtDateStart(""); setOtNote(""); setOtDur("1");
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const me       = currentUser ? employees.find(e => e.id === currentUser.id) : null;
  const myRecs   = me ? leaveRecords.filter(r => r.empId === me.id) : [];
  const myOtReqs = me ? otRequests.filter(r => r.empId === me.id) : [];
  const pendingOt = otRequests.filter(r => r.status === "pending");

  // ── Shared UI ────────────────────────────────────────────────────────────
  const Tog = ({ val, opts, onChange }) => (
    <div style={S.toggle}>
      {opts.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)}
          style={{ ...S.toggleBtn, ...(val === v ? S.toggleActive : {}) }}>{l}</button>
      ))}
    </div>
  );

  // Date on top, then duration toggle below
  const DateDurPicker = ({ dateLabel, dur, setDur, dateStart, setDateStart, minCustom = "0.5" }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={S.fg}>
        <label style={S.label}>{dateLabel}</label>
        <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} style={S.input} />
      </div>
      <div style={S.fg}>
        <label style={S.label}>天數</label>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <input type="number" min={minCustom} step="0.5" value={dur}
            onChange={e => setDur(e.target.value)}
            style={{ ...S.input, width:90 }} placeholder="例如 0.5、1、3" />
          <span style={{ color:"#64748b", fontSize:13 }}>天</span>
        </div>
      </div>
    </div>
  );

  const SuccessModal = () => !successModal ? null : (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:24 }}>
      <div style={{ background:"#fff", borderRadius:20, padding:36, width:"100%", maxWidth:380, boxShadow:"0 25px 60px rgba(0,0,0,0.3)", textAlign:"center", fontFamily:F }}>
        <div style={{ fontSize:52, marginBottom:12 }}>🎉</div>
        <h2 style={{ fontSize:18, fontWeight:900, color:"#1e293b", marginBottom:10 }}>{successModal.title}</h2>
        <p style={{ fontSize:14, color:"#64748b", marginBottom:24, lineHeight:1.6 }}>{successModal.body}</p>
        <button onClick={() => setSuccessModal(null)}
          style={{ background:"#2563eb", color:"#fff", border:"none", borderRadius:10, padding:"11px 32px", cursor:"pointer", fontSize:14, fontWeight:700, fontFamily:F }}>
          確定
        </button>
      </div>
    </div>
  );

  const Toast = () => notification
    ? <div style={{ ...S.toast, background: notification.type === "error" ? "#ef4444" : "#10b981" }}>{notification.msg}</div>
    : null;

  if (loading) return <div style={S.loading}>⏳ 載入中...</div>;

  // ══════════════════════════════════════════════════════════════════════════
  //  LANDING — clean table only, click name to enter
  // ══════════════════════════════════════════════════════════════════════════
  if (!role) return (
    <div style={S.landing}>
      <SuccessModal /><Toast />

      <div style={S.landingCard}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:44 }}>🌿</div>
          <h1 style={{ fontSize:22, fontWeight:900, color:"#1e293b", margin:"8px 0 6px" }}>假期管理系統</h1>
          <p style={{ color:"#e67e22", fontSize:13, margin:0, fontWeight:600 }}>⚠️ 假期須於一年內清假，否則歸零</p>
        </div>

        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>{["同工","匠愛假期","補休","合計"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id}
                  style={{ ...S.tr, cursor:"pointer" }}
                  onMouseEnter={ev => ev.currentTarget.style.background = "#f0f9ff"}
                  onMouseLeave={ev => ev.currentTarget.style.background = ""}
                  onClick={() => loginEmp(e)}>
                  <td style={S.td}>
                    <span style={{ fontWeight:700, color:"#2563eb" }}>{e.name}</span>
                    <span style={{ fontSize:11, color:"#94a3b8", marginLeft:6 }}>→</span>
                  </td>
                  <td style={S.td}><span style={{ ...S.badge, background:"#dcfce7", color:"#16a34a" }}>{e.annualDays} 天</span></td>
                  <td style={S.td}><span style={{ ...S.badge, background:"#dbeafe", color:"#1d4ed8" }}>{e.compDays} 天</span></td>
                  <td style={S.td}><strong>{+(e.annualDays + e.compDays).toFixed(1)} 天</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 後台管理 — bottom-right floating button */}
      <div style={{ position:"fixed", bottom:24, right:24, zIndex:100 }}>
        {!showAdminLogin ? (
          <button onClick={() => setShowAdminLogin(true)}
            title="後台管理"
            style={{ background:"#1e293b", color:"#fff", border:"none", borderRadius:50, width:52, height:52, cursor:"pointer", fontSize:20, boxShadow:"0 4px 14px rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            🔐
          </button>
        ) : (
          <div style={{ background:"#fff", borderRadius:16, padding:20, width:230, boxShadow:"0 8px 30px rgba(0,0,0,0.2)" }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#1e293b", margin:"0 0 10px" }}>後台管理登入</p>
            <input type="password" placeholder="輸入密碼" value={adminPw}
              onChange={e => { setAdminPw(e.target.value); setPwError(false); }}
              onKeyDown={e => e.key === "Enter" && loginAdmin()}
              style={{ ...S.input, marginBottom:8, borderColor: pwError ? "#ef4444" : "#e2e8f0" }} />
            {pwError && <p style={{ color:"#ef4444", fontSize:12, margin:"0 0 6px" }}>密碼錯誤</p>}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={loginAdmin} style={{ ...S.btnPrimary, flex:1, padding:"8px 0" }}>登入</button>
              <button onClick={() => { setShowAdminLogin(false); setPwError(false); setAdminPw(""); }}
                style={{ ...S.btnPrimary, background:"#64748b", padding:"8px 12px" }}>✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  EMPLOYEE — personal page after clicking name
  // ══════════════════════════════════════════════════════════════════════════
  if (role === "employee") {
    const emp = me || currentUser;
    return (
      <div style={{ ...S.landing, justifyContent:"flex-start", paddingTop:40 }}>
        <SuccessModal /><Toast />
        <div style={{ ...S.landingCard, maxWidth:660 }}>
          <button onClick={logout} style={S.backBtn}>← 返回總表</button>

          <h2 style={{ fontSize:20, fontWeight:900, color:"#1e293b", margin:"0 0 14px" }}>👋 {emp?.name} 的假期</h2>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
            {[
              { label:"匠愛假期", val: emp?.annualDays, color:"#10b981" },
              { label:"補休",     val: emp?.compDays,   color:"#3b82f6" },
              { label:"合計可用", val: +((emp?.annualDays||0)+(emp?.compDays||0)).toFixed(1), color:"#8b5cf6" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background:"#f8fafc", borderRadius:12, padding:"14px 10px", textAlign:"center", borderTop:`3px solid ${color}` }}>
                <div style={{ fontSize:28, fontWeight:900, color:"#1e293b" }}>{val}</div>
                <div style={{ color:"#64748b", fontSize:11, marginTop:2 }}>{label}（天）</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:4, marginBottom:18, borderBottom:"2px solid #e2e8f0" }}>
            {[["records","📋 假期紀錄"],["leave","📝 登記請假"],["ot","⏰ 加班補休"]].map(([id, label]) => (
              <button key={id} onClick={() => setDetailView(id)}
                style={{ ...S.tab, fontSize:13, padding:"10px 14px",
                  ...(detailView === id ? { color:"#2563eb", borderBottom:"3px solid #2563eb" } : {}) }}>
                {label}
              </button>
            ))}
          </div>

          {/* Records */}
          {detailView === "records" && (
            myRecs.length === 0 ? <div style={S.empty}>目前沒有紀錄</div> : (
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead><tr>{["類型","日期","天數"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {myRecs.map(r => (
                      <tr key={r.id} style={S.tr}>
                        <td style={S.td}><span style={r.type.includes("補休") ? S.tagComp : S.tagAnnual}>{r.type}</span></td>
                        <td style={S.td}>{r.date || "—"}</td>
                        <td style={S.td}>{r.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Leave form */}
          {detailView === "leave" && (
            <div style={S.card}>
              <div style={S.infoBox}>
                系統自動扣除，先扣匠愛假期，不足再扣補休。
              </div>
              <DateDurPicker
                dateLabel="請假日期 / 天數"
                dur={empDur} setDur={setEmpDur}
                dateStart={empDateStart} setDateStart={setEmpDateStart}
                minCustom="0.5"
              />
              <div style={{ marginTop:16 }}>
                <button onClick={doEmpLeave} style={S.btnPrimary}>確認登記請假</button>
              </div>
            </div>
          )}

          {/* OT form */}
          {detailView === "ot" && (
            <div>
              <div style={S.card}>
                <div style={S.infoBox}>加班補休須後台審核後才計入天數。</div>
                <DateDurPicker
                  dateLabel="加班日期 / 天數"
                  dur={otDur} setDur={setOtDur}
                  dateStart={otDateStart} setDateStart={setOtDateStart}
                />
                <div style={{ ...S.fg, marginTop:12 }}>
                  <label style={S.label}>事由</label>
                  <input placeholder="加班原因..." value={otNote} onChange={e => setOtNote(e.target.value)} style={S.input} />
                </div>
                <div style={{ marginTop:14 }}>
                  <button onClick={doOT} style={S.btnPrimary}>送出加班補休登記</button>
                </div>
              </div>

              {myOtReqs.length > 0 && (
                <>
                  <h3 style={{ fontSize:14, fontWeight:700, color:"#374151", margin:"4px 0 10px" }}>我的加班登記紀錄</h3>
                  <div style={S.tableWrap}>
                    <table style={S.table}>
                      <thead><tr>{["加班日期","天數","事由","狀態"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {myOtReqs.map(r => (
                          <tr key={r.id} style={S.tr}>
                            <td style={S.td}>{r.date}</td>
                            <td style={S.td}>{r.dur} 天</td>
                            <td style={S.td}>{r.note || "—"}</td>
                            <td style={S.td}><span style={{ ...S.badge, ...statusStyle(r.status) }}>
                              {r.status === "pending" ? "待審核" : r.status === "approved" ? "已核准" : "已拒絕"}
                            </span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  ADMIN
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={S.app}>
      <SuccessModal /><Toast />
      <nav style={S.nav}>
        <div style={S.brand}>🌿 假期管理 <span style={S.adminBadge}>後台管理</span></div>
        <div style={S.tabs}>
          {[
            ["dashboard","📊 總覽"],
            ["bulk","➕ 全員加假"],
            ["adjust","✏️ 個人調整"],
            ["leave","📝 登記請假"],
            ["overtime","⏰ 加班審核" + (pendingOt.length > 0 ? ` (${pendingOt.length})` : "")],
            ["records","📋 紀錄"],
            ["employees","👥 同工管理"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setView(id)}
              style={{ ...S.tab, ...(view === id ? S.tabActive : {}) }}>{label}</button>
          ))}
        </div>
        <button onClick={logout} style={S.logoutBtn}>登出</button>
      </nav>
      <main style={S.main}>

        {view === "dashboard" && <>
          <h2 style={S.title}>同工假期總覽</h2>
          {pendingOt.length > 0 && (
            <div style={S.alertBox}>
              ⚠️ 有 <strong>{pendingOt.length}</strong> 筆加班補休待審核
              <button onClick={() => setView("overtime")} style={S.alertBtn}>前往審核</button>
            </div>
          )}
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>{["同工","匠愛假期","補休","合計可用"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {employees.map(e => (
                  <tr key={e.id} style={S.tr}>
                    <td style={S.td}>{e.name}</td>
                    <td style={S.td}><span style={{ ...S.badge, background: e.annualDays < 3 ? "#fef2f2" : "#dcfce7", color: e.annualDays < 3 ? "#dc2626" : "#16a34a" }}>{e.annualDays} 天</span></td>
                    <td style={S.td}><span style={{ ...S.badge, background:"#dbeafe", color:"#1d4ed8" }}>{e.compDays} 天</span></td>
                    <td style={S.td}><strong>{+(e.annualDays + e.compDays).toFixed(1)} 天</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

        {view === "bulk" && <>
          <h2 style={S.title}>全員增加假期</h2>
          <div style={S.card}>
            <div style={S.formGrid}>
              <div style={S.fg}>
                <label style={S.label}>假期類型</label>
                <Tog val={bulkField} onChange={setBulkField} opts={[["annualDays","匠愛假期"],["compDays","補休"]]} />
              </div>
              <div style={S.fg}>
                <label style={S.label}>增加天數</label>
                <input type="number" min="0.5" step="0.5" placeholder="例如 1、2.5…"
                  value={bulkAmt} onChange={e => setBulkAmt(e.target.value)} style={S.input} />
              </div>
              <div style={{ ...S.fg, gridColumn:"1 / -1" }}>
                <label style={S.label}>說明 <span style={S.req}>*</span></label>
                <input placeholder="例如：年度假期發放..." value={bulkNote}
                  onChange={e => setBulkNote(e.target.value)} style={S.input} />
              </div>
            </div>
            <div style={S.previewBox}>
              將為 <strong>{employees.length}</strong> 位同工各增加 <strong>{bulkAmt} 天</strong>
              （{bulkField === "annualDays" ? "匠愛假期" : "補休"}）：{employees.map(e => e.name).join("、")}
            </div>
            <button onClick={doBulk} style={{ ...S.btnPrimary, background:"#7c3aed" }}>✓ 確認全員加假</button>
          </div>
        </>}

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
                <Tog val={adjField} onChange={setAdjField} opts={[["annualDays","匠愛假期"],["compDays","補休"]]} />
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
              return e ? <div style={S.infoBox}>{e.name}｜匠愛假期 {e.annualDays} 天｜補休 {e.compDays} 天</div> : null;
            })()}
            <button onClick={doAdjust} style={S.btnPrimary}>確認調整</button>
          </div>
        </>}

        {view === "leave" && <>
          <h2 style={S.title}>登記同工請假</h2>
          <div style={S.card}>
            <div style={S.infoBox}>先扣匠愛假期，不足再扣補休。</div>
            <div style={{ marginBottom:14 }}>
              <label style={S.label}>選擇同工</label>
              <select value={regEmp} onChange={e => setRegEmp(e.target.value)} style={{ ...S.select, marginTop:6 }}>
                <option value="">-- 選擇同工 --</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <DateDurPicker
              dateLabel="請假日期 / 天數"
              dur={regDur} setDur={setRegDur}
              dateStart={regDateStart} setDateStart={setRegDateStart}
            />
            <div style={{ ...S.fg, marginTop:14 }}>
              <label style={S.label}>備註（選填）</label>
              <input placeholder="請假原因..." value={regNote}
                onChange={e => setRegNote(e.target.value)} style={S.input} />
            </div>
            {regEmp && (() => {
              const e = employees.find(x => x.id === regEmp);
              return e ? <div style={{ ...S.infoBox, marginTop:14 }}>{e.name}｜匠愛假期 {e.annualDays} 天｜補休 {e.compDays} 天｜合計 {+(e.annualDays+e.compDays).toFixed(1)} 天</div> : null;
            })()}
            <div style={{ marginTop:14 }}>
              <button onClick={doRegLeave} style={S.btnPrimary}>確認登記</button>
            </div>
          </div>
        </>}

        {view === "overtime" && <>
          <h2 style={S.title}>加班補休審核</h2>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {[["pending","待審核"],["approved","已核准"],["rejected","已拒絕"]].map(([v, label]) => (
              <button key={v} onClick={() => setOtViewFilter(v)}
                style={{ ...S.toggleBtn, ...(otViewFilter === v ? S.toggleActive : {}), flex:"none", padding:"7px 16px" }}>
                {label} ({otRequests.filter(r => r.status === v).length})
              </button>
            ))}
          </div>
          {otRequests.filter(r => r.status === otViewFilter).length === 0
            ? <div style={S.empty}>沒有紀錄</div>
            : (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead><tr>{["同工","加班日期","天數","事由","狀態","操作"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {otRequests.filter(r => r.status === otViewFilter).map(r => (
                    <tr key={r.id} style={S.tr}>
                      <td style={S.td}>{r.empName}</td>
                      <td style={S.td}>{r.date}</td>
                      <td style={S.td}>{r.dur} 天</td>
                      <td style={S.td}>{r.note || "—"}</td>
                      <td style={S.td}><span style={{ ...S.badge, ...statusStyle(r.status) }}>
                        {r.status === "pending" ? "待審核" : r.status === "approved" ? "已核准" : "已拒絕"}
                      </span></td>
                      <td style={S.td}>{r.status === "pending" && (
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={() => approveOT(r)} style={S.btnSm}>✓ 核准</button>
                          <button onClick={() => rejectOT(r.id)} style={{ ...S.btnSm, background:"#fef2f2", color:"#dc2626" }}>✗ 拒絕</button>
                        </div>
                      )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>}

        {view === "records" && <>
          <h2 style={S.title}>所有紀錄</h2>
          {editRec && (
            <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
              <div style={{ background:"#fff", borderRadius:16, padding:28, width:"100%", maxWidth:420, boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:"#1e293b", marginBottom:16 }}>編輯紀錄</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={S.fg}>
                    <label style={S.label}>同工</label>
                    <div style={{ fontSize:13, padding:"9px 11px", background:"#f8fafc", borderRadius:8 }}>{editRec.empName}</div>
                  </div>
                  <div style={S.fg}>
                    <label style={S.label}>日期</label>
                    <input value={editDate} onChange={e => setEditDate(e.target.value)} style={S.input} />
                  </div>
                  <div style={S.fg}>
                    <label style={S.label}>天數</label>
                    <input value={editDuration} onChange={e => setEditDuration(e.target.value)} style={S.input} />
                  </div>
                  <div style={S.fg}>
                    <label style={S.label}>備註</label>
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
          {leaveRecords.length === 0 ? <div style={S.empty}>目前沒有紀錄</div> : (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead><tr>{["同工","類型","日期","天數","備註","操作者","操作"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
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
                          <button onClick={() => openEditRec(r)} style={{ ...S.btnSm, background:"#eff6ff", color:"#2563eb" }}>✏️</button>
                          <button onClick={() => deleteRecord(r)} style={{ ...S.btnSm, background:"#fef2f2", color:"#dc2626" }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>}

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
                <label style={S.label}>初始匠愛假期天數</label>
                <input type="number" min="0" value={newAnnual} onChange={e => setNewAnnual(e.target.value)} style={S.input} />
              </div>
            </div>
            <button onClick={addEmployee} style={S.btnPrimary}>新增同工</button>
          </div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>{["姓名","匠愛假期","補休","操作"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {employees.map(e => (
                  <tr key={e.id} style={S.tr}>
                    <td style={S.td}>{e.name}</td>
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
}
