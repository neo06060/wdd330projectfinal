import { getLocalStorage, setLocalStorage, formatMoney } from "./utils.mjs";

function totals() {
  const items = getLocalStorage("so-cart") || [];
  const subtotal = items.reduce((s, i) => s + (Number(i.FinalPrice ?? i.Price ?? 0) * (i.quantity || 1)), 0);
  const tax = +(subtotal * 0.06).toFixed(2);
  const shipping = 0; // adapte si besoin
  const total = +(subtotal + tax + shipping).toFixed(2);

  const $ = (id) => document.getElementById(id);
  if ($("subtotal")) $("subtotal").textContent = formatMoney(subtotal);
  if ($("tax")) $("tax").textContent = formatMoney(tax);
  if ($("shipping")) $("shipping").textContent = formatMoney(shipping);
  if ($("orderTotal")) $("orderTotal").textContent = formatMoney(total);
}

document.addEventListener("DOMContentLoaded", () => {
  totals();

  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    totals();
    const items = getLocalStorage("so-cart") || [];
    if (!items.length) {
      alert("Your cart is empty.");
      return;
    }

    // validation HTML5 fait déjà le gros du travail (required)
    // ici on simule la confirmation de commande
    alert("Order placed! Thank you.");
    setLocalStorage("so-cart", []);
    window.location.href = "../index.html"; // retour, adapte si besoin
  });
});