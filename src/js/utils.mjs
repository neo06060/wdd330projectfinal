export function setLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalStorage(key) {
  const v = localStorage.getItem(key);
  return v ? JSON.parse(v) : null;
}

export function getParam(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

export function toTitleCase(str) {
  return (str || "").replace(/[-_]+/g, " ").replace(/\b\w/g, m => m.toUpperCase());
}

export function formatMoney(n) {
  const v = Number(n || 0);
  return `$${v.toFixed(2)}`;
}

// normalize image URLs to usable paths
export function normalizeImageUrl(raw) {
  if (!raw) return "images/banner-sm.jpg"; // remove leading slash
  try {
    if (/^data:/.test(raw) || /^https?:\/\//i.test(raw)) return raw; // removed raw.startsWith("/")
    if (/^images\//i.test(raw)) return raw;
    const i = raw.indexOf("/images/");
    if (i !== -1) return raw.slice(i + 1); // remove leading slash
    return raw;
  } catch { return "images/banner-sm.jpg"; }
}


// update cart badge
export function updateCartCount() {
  try {
    const cart = getLocalStorage("so-cart") || [];
    const count = cart.reduce((a, i) => a + (i.quantity || 1), 0);
    const el = document.getElementById("cart-count");
    if (el) el.textContent = String(count);
  } catch { }
}

// dynamically determine base path depending on environment
export function getBasePath() {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return "/"; // local dev root
  } else if (hostname === "neo06060.github.io") {
    const parts = pathname.split("/");
    // e.g., /wdd330projectfinal/index.html → /wdd330projectfinal/
    return `/${parts[1]}/`;
  } else {
    return "/"; // fallback
  }
}
