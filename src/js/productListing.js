import { loadHeaderFooter } from "./loadHeaderFooter.js";
import ProductData from "./ProductData.mjs";
import { getParam, toTitleCase, formatMoney, updateCartCount } from "./utils.mjs";

// --- Helpers robustes ---

// 1) brand: supporte string ou objet {Name|BrandName|Title|...}
function safeBrand(b) {
    if (!b) return "";
    if (typeof b === "string") return b;
    if (typeof b === "object") {
        return (
            b.Name ||
            b.BrandName ||
            b.Title ||
            Object.values(b).find((v) => typeof v === "string") ||
            ""
        );
    }
    return String(b);
}

// 2) Récupère une URL d'image dans toutes les formes usuelles de data
function rawImageFrom(p) {
    const cands = [];
    if (p.Images) {
        if (Array.isArray(p.Images)) {
            const f = p.Images[0] || {};
            cands.push(f.Url, f.url, f.Src, f.src, f.Href, f.href);
        } else if (typeof p.Images === "object") {
            cands.push(
                p.Images.PrimaryLarge,
                p.Images.PrimaryMedium,
                p.Images.PrimarySmall,
                p.Images.Primary,
                p.Images.Url
            );
        }
    }
    cands.push(p.Image, p.image, p.Img, p.img);
    return cands.find(Boolean);
}

// 3) Normalise le chemin pour une page située dans /src/product_listing/
//    - Si on reçoit "images/xxx.jpg" on retourne "../images/xxx.jpg"
//    - Si absolu http(s) ou data:, on laisse tel quel
//    - Si déjà relatif ../ ou ./ on laisse tel quel
function resolveImageForListing(raw) {
    if (!raw) return "../images/noun_Tent_2517.svg";
    try {
        if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
        if (raw.startsWith("../") || raw.startsWith("./")) return raw;
        if (raw.startsWith("/")) {
            // Chemin absolu serveur. Souvent faux dans ce cours → on tente de corriger
            // Ex: "/images/xxx.jpg" -> "../images/xxx.jpg"
            if (raw.startsWith("/images/")) return ".." + raw; // "/images/..." => "../images/..."
            if (raw.startsWith("/src/images/")) return ".." + raw.replace("/src", ""); // "/src/images/..." => "../images/..."
            return raw;
        }
        // "images/..." -> "../images/..."
        if (raw.startsWith("images/")) return "../" + raw;
        // "src/images/..." -> "../images/..."
        if (raw.startsWith("src/images/")) return "../" + raw.replace(/^src\//, "");
        return raw;
    } catch {
        return "../images/noun_Tent_2517.svg";
    }
}

function imageUrl(p) {
    return resolveImageForListing(rawImageFrom(p));
}

// --- Carte produit ---
function productCard(p) {
    const id = p.Id ?? p.id ?? "";
    const img = imageUrl(p);
    const brand = safeBrand(p.Brand ?? p.brand);
    const name = p.Name ?? p.name ?? "";
    const price =
        p.FinalPrice ?? p.Final ?? p.ListPrice ?? p.SuggestedRetailPrice ?? p.Price ?? 0;

    return /*html*/ `
    <li class="product-card">
      <a href="../product/index.html?product=${encodeURIComponent(id)}">
        <img
          src="${img}"
          alt="${name}"
          style="width:100%;height:180px;object-fit:cover;display:block"
          onerror="this.onerror=null; this.src='../images/noun_Tent_2517.svg';"
        />
        ${brand ? `<h3 class="card__brand">${brand}</h3>` : ""}
        <h2 class="card__name">${name}</h2>
        <p class="product-card__price">${formatMoney(price)}</p>
      </a>
    </li>`;
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadHeaderFooter();
    updateCartCount();

    const category = getParam("category") || "tents";
    const title = document.querySelector(".category-title");
    if (title) title.textContent = toTitleCase(category);

    const listEl = document.querySelector(".product-list");
    const dataSource = new ProductData(category);

    try {
        const products = await dataSource.getData();
        if (!products || !products.length) {
            listEl.innerHTML = `<li>Aucun produit trouvé pour "${category}".</li>`;
            return;
        }
        listEl.innerHTML = products.map(productCard).join("");
    } catch (err) {
        console.error(err);
        listEl.innerHTML = `<li>Erreur de chargement des produits.</li>`;
    }
});