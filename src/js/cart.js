import { getLocalStorage, setLocalStorage, formatMoney, updateCartCount } from "./utils.mjs";

/* ==== Helpers ==== */
function resolveImageForCart(raw) {
  if (!raw) return "../images/noun_Tent_2517.svg";
  try {
    if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
    if (raw.startsWith("../") || raw.startsWith("./")) return raw;
    if (raw.startsWith("/src/images/")) return ".." + raw.replace("/src", "");
    if (raw.startsWith("/images/")) return ".." + raw;
    if (raw.startsWith("src/images/")) return "../" + raw.replace(/^src\//, "");
    if (raw.startsWith("images/")) return "../" + raw;
    return raw;
  } catch {
    return "../images/noun_Tent_2517.svg";
  }
}
function safeBrand(b) {
  if (!b) return "";
  if (typeof b === "string") return b;
  if (typeof b === "object") {
    return b.Name || b.BrandName || b.Title || Object.values(b).find(v => typeof v === "string") || "";
  }
  return String(b);
}
function normalizeItem(it) {
  const candidate = it?.Images?.[0]?.Url ?? it?.Image ?? it?.image ?? it?.img;
  return {
    ...it,
    Image: resolveImageForCart(candidate),
    Brand: safeBrand(it?.Brand ?? it?.brand),
    quantity: Math.max(1, Number(it?.quantity || 1)),
  };
}
function migrateCart() {
  const arr = getLocalStorage("so-cart") || [];
  let changed = false;
  const fixed = arr.map(it => {
    const n = normalizeItem(it);
    if (n.Image !== it.Image || n.Brand !== it.Brand || n.quantity !== it.quantity) changed = true;
    return n;
  });
  if (changed) setLocalStorage("so-cart", fixed);
  return fixed;
}

/* ==== Rendu ==== */
function rowTemplate(item, idx) {
  const color = item.Colors?.[0]?.ColorName || "N/A";
  const price = Number(item.FinalPrice ?? item.Price ?? 0);
  return /*html*/`
    <li class="cart-card divider" data-index="${idx}">
      <a class="cart-card__image" href="#">
        <img
          src="${item.Image}"
          alt="${item.Name}"
          onerror="this.onerror=null; this.src='../images/noun_Tent_2517.svg';"
        />
      </a>
      <a href="#" class="cart-card__name"><h2 class="card__name">${item.Name}</h2></a>
      <p class="cart-card__color">${color}</p>
      <p class="cart-card__brand">${item.Brand || "N/A"}</p>
      <label class="cart-card__quantity">qty:
        <input type="number" min="1" value="${item.quantity}" class="qty-input" />
      </label>
      <p class="cart-card__price">${formatMoney(price)}</p>
      <button class="cart-remove">Remove</button>
    </li>`;
}
function render() {
  const listEl = document.querySelector(".product-list");
  const totalEl = document.querySelector(".cart-total");
  const emptyEl = document.querySelector(".cart-empty");
  if (!listEl) return;

  const items = migrateCart();
  if (items.length === 0) {
    listEl.innerHTML = "";
    if (emptyEl) emptyEl.hidden = false;
    if (totalEl) totalEl.textContent = "$0.00";
    updateCartCount();
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  listEl.innerHTML = items.map(rowTemplate).join("");
  const total = items.reduce((s, it) => s + (Number(it.FinalPrice ?? it.Price ?? 0) * (it.quantity || 1)), 0);
  if (totalEl) totalEl.textContent = formatMoney(total);
  updateCartCount();

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".cart-remove");
    if (!btn) return;
    const li = btn.closest("li[data-index]");
    const idx = Number(li?.dataset?.index);
    const arr = getLocalStorage("so-cart") || [];
    arr.splice(idx, 1);
    setLocalStorage("so-cart", arr);
    render();
  }, { once: true });

  listEl.addEventListener("change", (e) => {
    const input = e.target.closest(".qty-input");
    if (!input) return;
    const li = input.closest("li[data-index]");
    const idx = Number(li?.dataset?.index);
    const qty = Math.max(1, Number(input.value || 1));
    const arr = getLocalStorage("so-cart") || [];
    if (arr[idx]) arr[idx].quantity = qty;
    setLocalStorage("so-cart", arr);
    render();
  }, { once: true });
}

/* ==== Boutons globaux ==== */
function wireButtons() {
  const clearBtn = document.getElementById("clearCart");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Clear the cart?")) {
        setLocalStorage("so-cart", []);
        render();
      }
    });
  }
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const items = getLocalStorage("so-cart") || [];
      if (!items.length) { alert("Your cart is empty."); return; }
      // >>> ICI: ta page est dans src/cart/ <<<
      window.location.href = "./checkout.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  render();
  wireButtons();
});