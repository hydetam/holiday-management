import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrV2_syU6U9VQEgBnAmCIwK7BtK0mlTh0",
  authDomain: "holiday-management-1a582.firebaseapp.com",
  projectId: "holiday-management-1a582",
  storageBucket: "holiday-management-1a582.firebasestorage.app",
  messagingSenderId: "260807430430",
  appId: "1:260807430430:web:3db257fcb14b9a381c390f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ── Collections ──────────────────────────────────────────────────────────────
export const employeesCol    = collection(db, "employees");
export const leaveRecordsCol = collection(db, "leaveRecords");
export const otRequestsCol   = collection(db, "otRequests");

// ── Employees ────────────────────────────────────────────────────────────────
export async function fetchEmployees() {
  const snap = await getDocs(employeesCol);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveEmployee(emp) {
  // emp.id is either a Firestore doc id string, or we generate one
  const ref = doc(db, "employees", String(emp.id));
  await setDoc(ref, {
    name: emp.name,
    annualDays: emp.annualDays,
    compDays: emp.compDays,
  });
}

export async function deleteEmployee(id) {
  await deleteDoc(doc(db, "employees", String(id)));
}

export async function updateEmployeeDays(id, annualDays, compDays) {
  await updateDoc(doc(db, "employees", String(id)), { annualDays, compDays });
}

// ── Leave Records ────────────────────────────────────────────────────────────
export async function addLeaveRecord(rec) {
  await addDoc(leaveRecordsCol, { ...rec, createdAt: serverTimestamp() });
}

// ── OT Requests ──────────────────────────────────────────────────────────────
export async function addOtRequest(req) {
  await addDoc(otRequestsCol, { ...req, createdAt: serverTimestamp() });
}

export async function updateOtStatus(id, status) {
  await updateDoc(doc(db, "otRequests", id), { status });
}

// ── Realtime listeners ───────────────────────────────────────────────────────
export function listenEmployees(cb) {
  return onSnapshot(employeesCol, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export function listenLeaveRecords(cb) {
  const q = query(leaveRecordsCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export function listenOtRequests(cb) {
  const q = query(otRequestsCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}
