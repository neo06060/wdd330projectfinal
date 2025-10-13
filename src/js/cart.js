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
    return "../images/choesee.png";
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
  const merged = [];
  const map = {};

  arr.forEach(it => {
    const n = normalizeItem(it);
    const id = n.Id || n.id || n.Name; // unique key
    if (map[id]) {
      map[id].quantity += n.quantity;
    } else {
      map[id] = { ...n, id };
      merged.push(map[id]);
    }
  });

  setLocalStorage("so-cart", merged);
  return merged;
}

/* ==== Render cart ==== */
function rowTemplate(item, idx) {
  const price = Number(item.FinalPrice ?? item.Price ?? 0);
  return /*html*/`
    <li class="cart-card vertical" data-id="${item.id}">
      <div class="cart-card__name">
        <h2 class="card__name">${item.Name}</h2>
      </div>
      <div class="cart-card__image">
        <img
          src="${item.Image}"
          alt="${item.Name}"
          onerror="this.onerror=null; this.src='../images/noun_Tent_2517.svg';"
        />
      </div>
      <div class="cart-card__footer">
        <p class="cart-card__price">${formatMoney(price * item.quantity)}</p>
        <div class="cart-card__actions">
          <label class="cart-card__quantity">
            Qty:
            <input type="number" min="1" value="${item.quantity}" class="qty-input" />
          </label>
          <button class="cart-remove" aria-label="Remove item" title="Remove item">
            <img src="../images/trashcan.png" alt="Remove" class="trash-icon" />
          </button>
        </div>
      </div>
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
  const total = items.reduce((s, it) => s + (Number(it.FinalPrice ?? it.Price ?? 0) * it.quantity), 0);
  if (totalEl) totalEl.textContent = formatMoney(total);
  updateCartCount();

  // Remove button
  listEl.querySelectorAll(".cart-remove").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const li = btn.closest("li[data-id]");
      const id = li.dataset.id;
      const cart = getLocalStorage("so-cart") || [];
      const newCart = cart.filter(i => String(i.id) !== id);
      setLocalStorage("so-cart", newCart);
      render();
    });
  });

  // Quantity change
  listEl.querySelectorAll(".qty-input").forEach(input => {
    input.addEventListener("change", e => {
      const li = input.closest("li[data-id]");
      const id = li.dataset.id;
      const val = Math.max(1, Number(input.value || 1));
      const cart = getLocalStorage("so-cart") || [];
      const item = cart.find(i => String(i.id) === id);
      if (item) item.quantity = val;
      setLocalStorage("so-cart", cart);
      render();
    });
  });

  // Click to open popup
  listEl.querySelectorAll(".cart-card.vertical").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const item = items.find(i => String(i.id) === id);
      if (!item) return;
      const popup = document.getElementById("productPopup");
      document.getElementById("popupTitle").textContent = item.Name;
      document.getElementById("popupDesc").textContent = item.Description || "No description available";
      popup.classList.add("show");
    });
  });
}

/* ==== Popup close ==== */
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("productPopup");
  const closeBtn = document.getElementById("closePopup");
  if (closeBtn) closeBtn.addEventListener("click", () => popup.classList.remove("show"));
  if (popup) popup.addEventListener("click", e => { if (e.target === popup) popup.classList.remove("show"); });

  render();
  wireButtons();
});

/* ==== Buttons global ==== */
function wireButtons() {
  const clearBtn = document.getElementById("clearCart");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (clearBtn) {
    clearBtn.addEventListener("click", e => {
      e.preventDefault();
      if (confirm("Clear the cart?")) {
        setLocalStorage("so-cart", []);
        render();
      }
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", e => {
      e.preventDefault();
      const items = getLocalStorage("so-cart") || [];
      if (!items.length) {
        alert("Your cart is empty.");
        return;
      }
      // Go to checkout page first
      window.location.href = "./checkout.html";
    });
  }
}
