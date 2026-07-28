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
    // Timeout after 10 seconds — Firebase might fail to initialize
    const timeout = setTimeout(() => {
      console.error("[LMS] getCurrentUser timed out after 10s");
      resolve(null);
    }, 10000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeout);
      unsubscribe();
      console.log("[LMS] Auth state:", user ? user.email : "not logged in");
      resolve(user);
    });
  });
}

async function isAdmin(userId) {
  try {
    const snapshot = await get(ref(db, `users/${userId}`));
    if (snapshot.exists()) {
      const role = (snapshot.val().role || "").toLowerCase().trim();
      console.log("[LMS] User role from DB:", snapshot.val().role, "→ normalized:", role);
      return role === "admin";
    }
    console.warn("[LMS] User record not found in DB for:", userId);
    return false;
  } catch (e) {
    console.error("[LMS] Error checking admin status:", e);
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
    console.error("[LMS] Error fetching user profile:", e);
    return null;
  }
}

async function requireAuth() {
  try {
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
  } catch (e) {
    console.error("[LMS] requireAuth failed:", e);
    window.location.href = "login.html";
    return null;
  }
}

async function requireAdmin() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log("[LMS] requireAdmin: no user, redirecting to login");
      window.location.href = "login.html";
      return null;
    }
    const adminCheck = await isAdmin(user.uid);
    if (!adminCheck) {
      console.log("[LMS] requireAdmin: not admin, redirecting to dashboard");
      window.location.href = "dashboard.html";
      return null;
    }
    const profile = await getUserProfile(user.uid);
    console.log("[LMS] requireAdmin: success, profile:", profile);
    return { user, profile };
  } catch (e) {
    console.error("[LMS] requireAdmin failed:", e);
    window.location.href = "login.html";
    return null;
  }
}

async function logout() {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Sign out error:", e);
  }
  sessionStorage.removeItem('lms_authed');
  sessionStorage.setItem('lms_logged_out', 'true');
  window.location.href = "login.html";
}

// ─── Back-Button Protection ───────────────────────────────
// When user presses browser back after logout, re-verify auth
// This prevents cached/bfcache pages from showing after logout
const protectedPages = ['dashboard.html', 'admin.html', 'course.html', 'quiz.html'];
const currentPage = window.location.pathname.split('/').pop();

if (protectedPages.includes(currentPage)) {
  // Handle bfcache (back/forward cache) - fires when page is restored from cache
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      // Page was served from bfcache — re-check auth
      const user = auth.currentUser;
      if (!user) {
        window.location.href = 'login.html';
      }
    }
  });

  // Handle tab visibility change — re-check auth when tab becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const user = auth.currentUser;
      if (!user) {
        window.location.href = 'login.html';
      }
    }
  });
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
