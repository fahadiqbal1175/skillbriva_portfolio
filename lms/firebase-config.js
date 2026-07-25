// ═══════════════════════════════════════════════════════════════
// Firebase Configuration — Realtime Database Version
// ═══════════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  push,
  child,
  onValue,
  query as dbQuery,
  orderByChild,
  equalTo,
  limitToFirst,
  off
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

// ─── Firebase Config (loaded from gitignored file) ─────────
import { firebaseConfig } from "./firebase-env.js";

// ─── Initialize Firebase ───────────────────────────────────
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// ─── RTDB Helper: Convert snapshot object to array ─────────
function snapshotToArray(snapshot) {
  const data = snapshot.val();
  if (!data) return [];
  return Object.entries(data).map(([id, val]) => ({ id, ...val }));
}

// ─── RTDB Helper: Get all items from a path ────────────────
async function getAll(path) {
  const snapshot = await get(ref(db, path));
  return snapshotToArray(snapshot);
}

// ─── RTDB Helper: Get single item by path ──────────────────
async function getOne(path) {
  const snapshot = await get(ref(db, path));
  if (snapshot.exists()) {
    return { id: path.split("/").pop(), ...snapshot.val() };
  }
  return null;
}

// ─── RTDB Helper: Get items filtered by a field ────────────
async function getWhere(path, field, value) {
  const q = dbQuery(ref(db, path), orderByChild(field), equalTo(value));
  const snapshot = await get(q);
  return snapshotToArray(snapshot);
}

// ─── RTDB Helper: Push new item and return key ─────────────
async function pushItem(path, data) {
  const newRef = push(ref(db, path));
  await set(newRef, { ...data, createdAt: Date.now() });
  return newRef.key;
}

// ─── RTDB Helper: Set item at specific path ────────────────
async function setItem(path, data) {
  await set(ref(db, path), data);
}

// ─── RTDB Helper: Update item at specific path ─────────────
async function updateItem(path, data) {
  await update(ref(db, path), data);
}

// ─── RTDB Helper: Delete item at specific path ─────────────
async function removeItem(path) {
  await remove(ref(db, path));
}

// ─── RTDB Helper: Listen for changes ──────────────────────
function listen(path, callback) {
  const dbRef = ref(db, path);
  onValue(dbRef, (snapshot) => {
    callback(snapshotToArray(snapshot));
  });
  return () => off(dbRef);
}

// ─── Auth Helpers ──────────────────────────────────────────

function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

async function isAdmin(userId) {
  try {
    const snapshot = await get(ref(db, `users/${userId}`));
    if (snapshot.exists()) {
      return snapshot.val().role === "admin";
    }
    return false;
  } catch (e) {
    console.error("Error checking admin status:", e);
    return false;
  }
}

async function getUserProfile(userId) {
  try {
    const snapshot = await get(ref(db, `users/${userId}`));
    if (snapshot.exists()) {
      return { id: userId, ...snapshot.val() };
    }
    return null;
  } catch (e) {
    console.error("Error fetching user profile:", e);
    return null;
  }
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  const profile = await getUserProfile(user.uid);
  if (profile && profile.status === "pending") {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#e2e8f0;font-family:'Inter',sans-serif;">
        <div style="text-align:center;max-width:480px;padding:2rem;">
          <div style="font-size:4rem;margin-bottom:1rem;">⏳</div>
          <h2 style="font-size:1.5rem;margin-bottom:1rem;color:#fbbf24;">Account Pending Approval</h2>
          <p style="color:#94a3b8;line-height:1.7;">Your account is awaiting approval from the teacher. You'll receive access once your account is approved. Please check back later.</p>
          <a href="login.html" style="display:inline-block;margin-top:1.5rem;padding:0.75rem 2rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:12px;text-decoration:none;font-weight:600;">Back to Login</a>
        </div>
      </div>
    `;
    return null;
  }
  return { user, profile };
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  const admin = await isAdmin(user.uid);
  if (!admin) {
    window.location.href = "dashboard.html";
    return null;
  }
  const profile = await getUserProfile(user.uid);
  return { user, profile };
}

async function logout() {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Sign out error:", e);
  }
  sessionStorage.setItem('lms_logged_out', 'true');
  window.location.href = "login.html";
}

// ─── Export Everything ─────────────────────────────────────
export {
  app,
  auth,
  db,
  storage,
  // Auth functions
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  // RTDB functions
  ref,
  get,
  set,
  update,
  remove,
  push,
  child,
  onValue,
  off,
  dbQuery,
  orderByChild,
  equalTo,
  limitToFirst,
  // RTDB helpers
  snapshotToArray,
  getAll,
  getOne,
  getWhere,
  pushItem,
  setItem,
  updateItem,
  removeItem,
  listen,
  // Storage functions
  storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  // Auth helpers
  getCurrentUser,
  isAdmin,
  getUserProfile,
  requireAuth,
  requireAdmin,
  logout
};
