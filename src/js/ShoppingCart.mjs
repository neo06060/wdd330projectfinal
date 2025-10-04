import { getLocalStorage, setLocalStorage, renderWithTemplate, qs, updateCartCount } from "./utils.mjs";

const MONEY = (n) => `$${Number(n).toFixed(2)}`;

export default class ShoppingCart {
    constructor(key = "so-cart", selectors = { list: ".product-list", total: ".cart-total .value", empty: ".cart-empty" }) {
        this.key = key;
        this.selectors = selectors;
    }

    // ----- storage -----
    get items() {
        return getLocalStorage(this.key) || [];
    }
    set items(newCart) {
        setLocalStorage(this.key, newCart);
        if (typeof updateCartCount === "function") updateCartCount();
    }

    // ----- mutations -----
    changeQty(id, qty) {
        const cart = this.items.map((it) => {
            if (String(it.Id) === String(id)) {
                const nextQty = Math.max(1, Number(qty) || 1);
                return { ...it, qty: nextQty };
            }
            return it;
        });
        this.items = cart;
    }

    remove(id) {
        const cart = this.items.filter((it) => String(it.Id) !== String(id));
        this.items = cart;
    }

    clear() {
        this.items = [];
    }

    // ----- compute -----
    lineTotal(item) {
        const unit = item.FinalPrice ?? item.Price ?? 0;
        const q = item.qty ?? 1;
        return Number(unit) * Number(q);
    }

    total() {
        return this.items.reduce((sum, it) => sum + this.lineTotal(it), 0);
    }

    // ----- render -----
    render() {
        const listEl = qs(this.selectors.list);
        const totalEl = qs(this.selectors.total);
        const emptyEl = qs(this.selectors.empty);
        const tpl = qs("#cart-item-template");

        if (!listEl || !tpl) return;

        // reset UI
        listEl.innerHTML = "";

        const cart = this.items;
        const isEmpty = cart.length === 0;

        if (emptyEl) emptyEl.hidden = !isEmpty;
        if (totalEl) totalEl.textContent = MONEY(this.total());

        if (isEmpty) return;

        cart.forEach((item) => {
            renderWithTemplate(tpl, listEl, item, (clone, data) => {
                const li = clone.querySelector("li.cart-card");
                li.dataset.id = data.Id;

                const img = clone.querySelector("img");
                img.src = data.Image;
                img.alt = data.Name;

                clone.querySelector(".card__name").textContent = data.Name;

                const colorText = data.Colors?.[0]?.ColorName ?? "N/A";
                clone.querySelector(".cart-card__color").textContent = colorText;

                const unit = data.FinalPrice ?? data.Price ?? 0;
                clone.querySelector(".cart-card__price").textContent = MONEY(unit);

                const qtyInput = clone.querySelector(".qty");
                qtyInput.value = data.qty ?? 1;

                // listeners
                qtyInput.addEventListener("change", (e) => {
                    this.changeQty(data.Id, e.target.value);
                    if (totalEl) totalEl.textContent = MONEY(this.total());
                });

                clone.querySelector(".remove").addEventListener("click", () => {
                    this.remove(data.Id);
                    this.render(); // re-render after removal
                });

                return clone;
            });
        });

        // update total after render to be safe
        if (totalEl) totalEl.textContent = MONEY(this.total());
    }
}
