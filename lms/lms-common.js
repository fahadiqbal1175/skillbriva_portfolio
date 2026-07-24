// ═══════════════════════════════════════════════════════════════
// LMS Common Utilities — Shared across all LMS pages
// ═══════════════════════════════════════════════════════════════

// ─── Toast Notification System ─────────────────────────────
let toastContainer = null;

function initToasts() {
  if (toastContainer) return;
  toastContainer = document.createElement("div");
  toastContainer.className = "lms-toast-container";
  document.body.appendChild(toastContainer);
}

function showToast(message, type = "info", duration = 4000) {
  initToasts();
  const toast = document.createElement("div");
  toast.className = `lms-toast lms-toast--${type}`;

  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-xmark",
    warning: "fa-triangle-exclamation",
    info: "fa-circle-info"
  };

  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}"></i>
    <span>${message}</span>
    <button class="lms-toast__close" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("lms-toast--visible"));

  setTimeout(() => {
    toast.classList.remove("lms-toast--visible");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Modal System ──────────────────────────────────────────
function showModal(title, content, actions = []) {
  const overlay = document.createElement("div");
  overlay.className = "lms-modal-overlay";
  overlay.innerHTML = `
    <div class="lms-modal">
      <div class="lms-modal__header">
        <h3>${title}</h3>
        <button class="lms-modal__close" aria-label="Close modal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="lms-modal__body">${content}</div>
      <div class="lms-modal__footer" id="modalActions"></div>
    </div>
  `;

  const actionsContainer = overlay.querySelector("#modalActions");
  actions.forEach((action) => {
    const btn = document.createElement("button");
    btn.className = `lms-btn ${action.class || "lms-btn--ghost"}`;
    btn.textContent = action.label;
    btn.onclick = () => {
      if (action.onClick) action.onClick();
      overlay.remove();
    };
    actionsContainer.appendChild(btn);
  });

  overlay.querySelector(".lms-modal__close").onclick = () => overlay.remove();
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("lms-modal-overlay--visible"));
  return overlay;
}

function showConfirm(title, message) {
  return new Promise((resolve) => {
    showModal(title, `<p>${message}</p>`, [
      { label: "Cancel", class: "lms-btn--ghost", onClick: () => resolve(false) },
      { label: "Confirm", class: "lms-btn--primary", onClick: () => resolve(true) }
    ]);
  });
}

// ─── Loading States ────────────────────────────────────────
function showLoading(container, message = "Loading...") {
  if (typeof container === "string") container = document.querySelector(container);
  if (!container) return;
  container.innerHTML = `
    <div class="lms-loading">
      <div class="lms-loading__spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

function showEmpty(container, message = "No data found", icon = "fa-inbox") {
  if (typeof container === "string") container = document.querySelector(container);
  if (!container) return;
  container.innerHTML = `
    <div class="lms-empty">
      <i class="fa-solid ${icon}"></i>
      <p>${message}</p>
    </div>
  `;
}

// ─── Sidebar Navigation ───────────────────────────────────
function initSidebar() {
  const toggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("lms-sidebar--open");
      if (overlay) overlay.classList.toggle("lms-sidebar-overlay--visible");
    });
  }
  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("lms-sidebar--open");
      overlay.classList.remove("lms-sidebar-overlay--visible");
    });
  }
}

function initTabs() {
  const tabBtns = document.querySelectorAll("[data-tab]");
  const tabPanes = document.querySelectorAll("[data-tab-pane]");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      tabPanes.forEach((pane) => {
        pane.classList.remove("active");
        if (pane.dataset.tabPane === target) {
          pane.classList.add("active");
        }
      });

      // Update URL hash
      window.location.hash = target;
    });
  });

  // Restore tab from URL hash
  const hash = window.location.hash.replace("#", "");
  if (hash) {
    const targetBtn = document.querySelector(`[data-tab="${hash}"]`);
    if (targetBtn) targetBtn.click();
  }
}

// ─── Date/Time Formatting ──────────────────────────────────
function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatDateTime(timestamp) {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatTime(timestamp) {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}

function timeAgo(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 }
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

function isOverdue(timestamp) {
  if (!timestamp) return false;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.getTime() < Date.now();
}

// ─── Utility Functions ─────────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function truncate(str, maxLength = 100) {
  if (!str) return "";
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

function getSubjectIcon(subject) {
  const icons = {
    "Quran with Tajweed": "fa-quran",
    "Basic Islamic Studies": "fa-mosque",
    "Computer Science": "fa-laptop-code",
    "Mathematics": "fa-calculator",
    "English": "fa-spell-check",
    "Programming": "fa-code",
    "Science": "fa-flask",
    "AI & Machine Learning": "fa-brain"
  };
  return icons[subject] || "fa-book";
}

function getSubjectColor(subject) {
  const colors = {
    "Quran with Tajweed": { bg: "#065f46", text: "#6ee7b7", accent: "#10b981" },
    "Basic Islamic Studies": { bg: "#164e63", text: "#67e8f9", accent: "#06b6d4" },
    "Computer Science": { bg: "#312e81", text: "#a5b4fc", accent: "#6366f1" },
    "Mathematics": { bg: "#713f12", text: "#fde68a", accent: "#f59e0b" },
    "English": { bg: "#7f1d1d", text: "#fca5a5", accent: "#ef4444" },
    "Programming": { bg: "#581c87", text: "#d8b4fe", accent: "#a855f7" },
    "Science": { bg: "#0c4a6e", text: "#7dd3fc", accent: "#0ea5e9" },
    "AI & Machine Learning": { bg: "#831843", text: "#f9a8d4", accent: "#ec4899" }
  };
  return colors[subject] || { bg: "#374151", text: "#d1d5db", accent: "#6b7280" };
}

// ─── File Size Formatting ──────────────────────────────────
function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

// ─── Grade/Score Badge ─────────────────────────────────────
function getScoreBadge(percentage) {
  if (percentage >= 90) return { class: "excellent", label: "Excellent", color: "#10b981" };
  if (percentage >= 75) return { class: "good", label: "Good", color: "#6366f1" };
  if (percentage >= 60) return { class: "average", label: "Average", color: "#f59e0b" };
  return { class: "needs-improvement", label: "Needs Work", color: "#ef4444" };
}

// ─── Render User Avatar ────────────────────────────────────
function renderAvatar(name, size = 40) {
  const initials = getInitials(name);
  const hue = name ? name.charCodeAt(0) * 7 % 360 : 200;
  return `<div class="lms-avatar" style="width:${size}px;height:${size}px;background:hsl(${hue},60%,45%);font-size:${size * 0.4}px;">${initials}</div>`;
}

// ─── Export for ES Modules ─────────────────────────────────
export {
  showToast,
  showModal,
  showConfirm,
  showLoading,
  showEmpty,
  initSidebar,
  initTabs,
  formatDate,
  formatDateTime,
  formatTime,
  timeAgo,
  isOverdue,
  escapeHtml,
  truncate,
  getInitials,
  getSubjectIcon,
  getSubjectColor,
  formatFileSize,
  getScoreBadge,
  renderAvatar
};
