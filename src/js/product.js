import { getParam, setLocalStorage, getLocalStorage, formatMoney, updateCartCount } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

// ---- Helpers communs ----
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

// La page produit est dans /src/product/ ⇒ on force des chemins du type ../images/...
function resolveImageForProduct(raw) {
    if (!raw) return "../images/noun_Tent_2517.svg";
    try {
        if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
        if (raw.startsWith("../") || raw.startsWith("./")) return raw;
        if (raw.startsWith("/src/images/")) return ".." + raw.replace("/src", "");
        if (raw.startsWith("/images/")) return ".." + raw;         // /images/... → ../images/...
        if (raw.startsWith("src/images/")) return "../" + raw.replace(/^src\//, "");
        if (raw.startsWith("images/")) return "../" + raw;
        return raw;
    } catch {
        return "../images/noun_Tent_2517.svg";
    }
}

function imageUrl(p) {
    return resolveImageForProduct(rawImageFrom(p));
}

// ---- Rendu ----
const productId =
    getParam("product") || getParam("id") || getParam("productId") || getParam("sku");

const data = new ProductData("tents"); // findProductById scannera d'autres catégories si besoin

function template(p) {
    const img = imageUrl(p);
    const brand = safeBrand(p.Brand ?? p.brand);
    const name = p.Name ?? p.name ?? "";
    const price = p.FinalPrice ?? p.Final ?? p.ListPrice ?? p.SuggestedRetailPrice ?? p.Price ?? 0;
    const desc =
        p.Description ||
        p.DescriptionHtml ||
        p.description ||
        "Lightweight and ready for adventure.";

    return /*html*/ `
    <article class="container">
      <h1>${name}</h1>
      <img
        src="${img}"
        alt="${name}"
        style="max-width:620px;width:100%;height:auto;display:block;background:#eee"
        onerror="this.onerror=null; this.src='../images/noun_Tent_2517.svg';"
      />
      <p class="product-card__price" style="font-size:1.25rem;margin-top:.75rem">${formatMoney(price)}</p>
      ${brand ? `<p style="color:#555">${brand}</p>` : ""}
      <p style="max-width:60ch;line-height:1.5">${desc}</p>
      <button id="addToCart" style="padding:.6rem 1.2rem;margin:.5rem 0">Add to Cart</button>
    </article>`;
}

async function init() {
    const main =
        document.querySelector("main") ||
        document.body; // au cas où le gabarit n'a pas de <main>

    if (!productId) {
        main.innerHTML = "<p style='padding:1rem'>Product id manquant.</p>";
        return;
    }

    try {
        const p = await data.findProductById(productId);
        if (!p) {
            main.innerHTML = "<p style='padding:1rem'>Produit introuvable.</p>";
            return;
        }

        main.innerHTML = template(p);

        document.getElementById("addToCart").addEventListener("click", () => {
            const cart = getLocalStorage("so-cart") || [];
            cart.push({
                Id: p.Id ?? productId,
                Name: p.Name ?? p.name ?? "",
                Brand: safeBrand(p.Brand ?? p.brand),
                Image: imageUrl(p), // on stocke un chemin déjà résolu pour éviter les 404 ailleurs
                FinalPrice: p.FinalPrice ?? p.Price ?? 0,
                quantity: 1
            });
            setLocalStorage("so-cart", cart);
            updateCartCount();
            alert("Added to cart!");
        });
    } catch {
        main.innerHTML = "<p style='padding:1rem'>Erreur de chargement du produit.</p>";
    }
}

document.addEventListener("DOMContentLoaded", init);