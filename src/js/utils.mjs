export function setLocalStorage(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
export function getLocalStorage(key) { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
export function getParam(name) { const u = new URL(window.location.href); return u.searchParams.get(name); }
export function toTitleCase(str) { return (str || "").replace(/[-_]+/g, " ").replace(/\b\w/g, m => m.toUpperCase()); }
export function formatMoney(n) { const v = Number(n || 0); return `$${v.toFixed(2)}`; }

// normalise divers formats d'URL d'images vers un chemin utilisable
export function normalizeImageUrl(raw) {
  if (!raw) return "/images/banner-sm.jpg";
  try {
    if (/^data:/.test(raw) || /^https?:\/\//i.test(raw) || raw.startsWith("/")) return raw;
    if (/^images\//i.test(raw)) return "/" + raw;
    const i = raw.indexOf("/images/");
    if (i !== -1) return raw.slice(i);
    return raw;
  } catch { return "/images/banner-sm.jpg"; }
}

// badge du panier (basique)
export function updateCartCount() {
  try {
    const cart = getLocalStorage("so-cart") || [];
    const count = cart.reduce((a, i) => a + (i.quantity || 1), 0);
    const el = document.getElementById("cart-count");
    if (el) el.textContent = String(count);
  } catch { }
}