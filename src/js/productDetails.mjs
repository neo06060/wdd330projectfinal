import {
  setLocalStorage,
  getLocalStorage,
  updateCartCount,
  normalizeImageUrl,
} from "./utils.mjs";

const MONEY = (n) => `$${Number(n || 0).toFixed(2)}`;

// Fallback image inline (aucun réseau requis)
const FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480' viewBox='0 0 640 480'>
      <rect width='640' height='480' fill='#eee'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            font-family='Arial,Helvetica,sans-serif' font-size='22' fill='#888'>
        No image
      </text>
    </svg>`
  );

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.dataSource = dataSource;
    this.product = null;
  }

  async init() {
    // 1) Récupérer le produit
    try {
      this.product = await this.dataSource.findProductById(this.productId);
    } catch (e) {
      console.error("[ProductDetails] fetch error:", e);
      this.product = null;
    }

    if (!this.product) {
      console.warn("[ProductDetails] Product not found:", this.productId);
      this.renderNotFound();
      return;
    }

    // 2) Rendu
    this.renderProductDetails();

    // 3) Ecouteur Add to Cart (delegation)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("#addToCart");
      if (!btn) return;
      e.preventDefault();
      this.addProductToCart();
    });
  }

  renderNotFound() {
    const nameEl = document.getElementById("productName");
    if (nameEl) nameEl.textContent = "Product not found";

    const imgEl = document.getElementById("productImage");
    if (imgEl) imgEl.src = FALLBACK_SVG;

    const descEl = document.getElementById("productDescription");
    if (descEl) descEl.innerHTML = "<em>We couldn't load this product.</em>";

    const priceEl = document.getElementById("productPrice");
    if (priceEl) priceEl.textContent = MONEY(0);
  }

  renderProductDetails() {
    const p = this.product;
    // Nom
    const nameEl = document.getElementById("productName");
    if (nameEl) nameEl.textContent = p?.Name ?? "";

    // Description (peut être HTML)
    const descEl = document.getElementById("productDescription");
    if (descEl) descEl.innerHTML = p?.DescriptionHtmlSimple ?? "";

    // Prix
    const price = p?.FinalPrice ?? p?.ListPrice ?? 0;
    const priceEl = document.getElementById("productPrice");
    if (priceEl) priceEl.textContent = MONEY(price);

    // Image (normalisée + fallback)
    const rawImg = p?.PrimaryLarge || p?.PrimaryMedium || p?.Image || "";
    const imgPath = normalizeImageUrl(rawImg) || FALLBACK_SVG;
    const imgEl = document.getElementById("productImage");
    if (imgEl) {
      imgEl.src = imgPath;
      imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = FALLBACK_SVG;
      };
      if (p?.Name) imgEl.alt = p.Name;
    }

    // Marque
    const brand =
      typeof p?.Brand === "object" ? p.Brand?.Name : p?.Brand ?? "";
    const brandEl = document.getElementById("productBrand");
    if (brandEl) brandEl.textContent = brand;

    // Couleur (si présente)
    const color = p?.Colors?.[0]?.ColorName ?? "";
    const colorEl = document.getElementById("productColor");
    if (colorEl) colorEl.textContent = color;
  }

  addProductToCart() {
    if (!this.product || (!this.product.Id && !this.product.id)) {
      alert("Product not loaded");
      return;
    }

    const cart = getLocalStorage("so-cart") || [];
    const id = String(this.product.Id ?? this.product.id ?? this.product.SKU ?? this.product.Name);

    // Toujours stocker une image normalisée dans le panier
    const imageForCart = normalizeImageUrl(
      this.product.PrimaryMedium || this.product.PrimaryLarge || this.product.Image || ""
    );

    const price = this.product.FinalPrice ?? this.product.ListPrice ?? 0;

    // Chercher si déjà présent
    const existing = cart.find((it) => String(it.Id) === id);

    if (existing) {
      existing.quantity = (Number(existing.quantity) || 1) + 1;
      // garde la meilleure image dispo
      if (!existing.Image && imageForCart) existing.Image = imageForCart;
      if (!existing.FinalPrice && price) existing.FinalPrice = price;
    } else {
      cart.push({
        Id: id,
        Name: this.product.Name ?? "Unknown",
        Image: imageForCart,
        FinalPrice: price,
        quantity: 1,
      });
    }

    setLocalStorage("so-cart", cart);
    updateCartCount();
    window.dispatchEvent(new Event("cart:updated"));

    // Redirection vers le panier
    const base = new URL("../cart/index.html", window.location.href);
    window.location.href = base.href;
  }
}