// CheckoutValidation.js
import { getLocalStorage, setLocalStorage, formatMoney } from "./utils.mjs";

function calculateTotals() {
  const items = getLocalStorage("so-cart") || [];
  const subtotal = items.reduce(
    (sum, i) => sum + (Number(i.FinalPrice ?? i.Price ?? 0) * (i.quantity || 1)),
    0
  );
  const tax = +(subtotal * 0.06).toFixed(2);
  const shipping = items.length > 0 ? 10 + (items.length - 1) * 2 : 0;
  const total = +(subtotal + tax + shipping).toFixed(2);

  const $ = (id) => document.getElementById(id);
  if ($("subtotal")) $("subtotal").textContent = formatMoney(subtotal);
  if ($("tax")) $("tax").textContent = formatMoney(tax);
  if ($("shipping")) $("shipping").textContent = formatMoney(shipping);
  if ($("orderTotal")) $("orderTotal").textContent = formatMoney(total);

  return { subtotal, tax, shipping, total };
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  calculateTotals();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const items = getLocalStorage("so-cart") || [];
    if (!items.length) {
      alert("Your cart is empty.");
      return;
    }

    const totals = calculateTotals();

    // Gather customer info
    const formData = new FormData(form);
    const customer = {};
    formData.forEach((value, key) => (customer[key] = value));

    // Create order object
    const order = {
      date: new Date().toLocaleString(),
      customer,
      items: items.map(i => ({
        Name: i.Name,
        quantity: i.quantity,
        FinalPrice: i.FinalPrice ?? i.Price ?? 0
      })),
      summary: {
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total
      }
    };

    // Store order in sessionStorage for confirmation page
    sessionStorage.setItem("lastOrder", JSON.stringify(order));

    // Clear cart
    setLocalStorage("so-cart", []);

    // Redirect to order confirmation
    window.location.href = "../order/orderConfirmation.html";
  });
});
