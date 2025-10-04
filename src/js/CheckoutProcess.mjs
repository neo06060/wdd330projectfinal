// CheckoutProcess.mjs
import { getLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

export default class CheckoutProcess {
  constructor(cartKey, outputSelector) {
    this.cartKey = cartKey;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.tax = 0;
    this.shipping = 0;
    this.orderTotal = 0;
    this.services = new ExternalServices();
  }

  init() {
    this.list = getLocalStorage(this.cartKey);
    this.calculateItemSubTotal();
  }

  calculateItemSubTotal() {
    this.itemTotal = this.list.reduce(
      (sum, item) =>
        sum +
        ((item.FinalPrice ?? item.Price ?? 0) *
          (parseInt(item.quantity ?? 1, 10) || 1)),
      0
    );
    document.querySelector(`${this.outputSelector} #subtotal`).textContent =
      `$${this.itemTotal.toFixed(2)}`;
  }

  calculateOrderTotal() {
    this.tax = this.itemTotal * 0.06;
    this.shipping = this.list.length > 0 ? 10 + (this.list.length - 1) * 2 : 0;
    this.orderTotal = this.itemTotal + this.tax + this.shipping;
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const root = document.querySelector(this.outputSelector);
    root.querySelector("#tax").textContent = `$${this.tax.toFixed(2)}`;
    root.querySelector("#shipping").textContent = `$${this.shipping.toFixed(
      2
    )}`;
    root.querySelector("#orderTotal").textContent = `$${this.orderTotal.toFixed(
      2
    )}`;
  }

  packageItems(items) {
    return items.map((item) => ({
      id: item.Id,
      name: item.Name,
      price: item.FinalPrice ?? item.Price ?? 0,
      quantity: parseInt(item.quantity ?? 1, 10),
    }));
  }

  async checkout(form) {
    const formData = new FormData(form);
    const order = {};
    formData.forEach((value, key) => (order[key] = value));

    order.orderDate = new Date().toISOString();
    order.orderTotal = this.orderTotal.toFixed(2);
    order.tax = this.tax.toFixed(2);
    order.shipping = this.shipping;
    order.items = this.packageItems(this.list);

    return await this.services.checkout(order);
  }
}
