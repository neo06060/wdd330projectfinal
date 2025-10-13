import { getParam, setLocalStorage, getLocalStorage, updateCartCount } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

// ---------- Dynamic Base Path ----------
const BASE_PATH = window.location.pathname.includes("/src/")
  ? window.location.pathname.split("/src/")[0] // GitHub Pages
  : ""; // localhost

// ---------- Helpers ----------
function safeBrand(b) {
  if (!b) return "";
  if (typeof b === "string") return b;
  if (typeof b === "object") {
    return b.Name || b.BrandName || b.Title || Object.values(b).find(v => typeof v === "string") || "";
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
      cands.push(p.Images.PrimaryLarge, p.Images.PrimaryMedium, p.Images.PrimarySmall, p.Images.Primary, p.Images.Url);
    }
  }
  cands.push(p.Image, p.image, p.Img, p.img);
  return cands.find(Boolean);
}

function resolveImageForProduct(raw) {
  if (!raw) return `${BASE_PATH}/src/images/choesee.png`;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  if (raw.startsWith("/")) return `${BASE_PATH}${raw}`;
  if (raw.startsWith("src/")) return `${BASE_PATH}/${raw}`;
  return `${BASE_PATH}/src/images/choesee.png`;
}

function imageUrl(p) {
  return resolveImageForProduct(rawImageFrom(p));
}

function toEmbedUrl(url) {
  if (!url) return "";
  const match = url.match(/v=([^&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

// ---------- Template ----------
function template(p) {
  const img = imageUrl(p);
  const name = p.name ?? p.Name ?? "Unknown Clock";
  const maker = p.maker ?? "Unknown Maker";
  const year = p.year ?? "Unknown Year";
  const pieces = p.pieces ?? ["Pendulum", "Gear A", "Spring", "Clock face"];
  const commonBroken = p.commonBroken ?? [];
  const youtubeLink = p.youtubeLink ?? p.youtube ?? "";

  const piecePrices = [29.99, 19.99, 14.99, 9.99];
  const pieceMap = ["Pendulum", "Gear A", "Spring", "Clock face"];
  const pieceDescriptions = {
    "Pendulum": "A pendulum is a device made of a weight suspended from a pivot so that it can swing freely.[1] When a pendulum is displaced sideways from its resting, equilibrium position, it is subject to a restoring force due to gravity that will accelerate it back toward the equilibrium position.",
    "Gear A": "A gear train or gear set is a machine element of a mechanical system formed by mounting two or more gears on a frame such that the teeth of the gears engage.\n\nGear teeth are designed to ensure the pitch circles of engaging gears roll on each other without slipping, providing a smooth transmission of rotation from one gear to the next.",
    "Spring": "A mainspring is a spiral torsion spring of metal ribbon—commonly spring steel—used as a power source in mechanical watches, some clocks, and other clockwork mechanisms. Winding the timepiece, by turning a knob or key, stores energy in the mainspring by twisting the spiral tighter. The force of the mainspring then turns the clock's wheels as it unwinds, until the next winding is needed. The adjectives wind-up and spring-powered refer to mechanisms powered by mainsprings, which also include kitchen timers, metronomes, music boxes, wind-up toys and clockwork radios.",
    "Clock face": "A clock face is the part of an analog clock (or watch) that displays time through the use of a flat dial with reference marks, and revolving pointers turning on concentric shafts at the center, called hands. In its most basic, globally recognized form, the periphery of the dial is numbered 1 through 12 indicating the hours in a 12-hour cycle, and a short hour hand makes two revolutions in a day. A long minute hand makes one revolution every hour. The face may also include a second hand, which makes one revolution per minute. The term is less commonly used for the time display on digital clocks and watches."
  };

  const pieceList = pieces.map((piece, idx) => `
    <li class="piece-item">
      <div style="display:flex;align-items:center;gap:.5rem;">
        <img src="${BASE_PATH}/src/images/pieces/${pieceMap[idx]}.png" alt="${piece}"/>
        <span>${piece} - $${piecePrices[idx].toFixed(2)}</span>
      </div>
      <button class="add-piece-btn" 
              data-piece="${pieceMap[idx]}" 
              data-price="${piecePrices[idx]}"
              data-description="${pieceDescriptions[pieceMap[idx]]}">Add</button>
    </li>
  `).join("");

  return /*html*/ `
    <article class="product-container">
      <div class="product-image">
        <img src="${img}" alt="${name}"/>
      </div>
      <div class="product-info">
        <h1>${name}</h1>
        <p><strong>Made by:</strong> ${maker}</p>
        <p><strong>Year:</strong> ${year}</p>
        <p><strong>Pieces:</strong> ${pieces.length}</p>
        <p><strong>Common Broken Pieces:</strong> ${commonBroken.length > 0 ? commonBroken.join(", ") : "None"}</p>
        <div class="product-buttons">
          <button id="addPieceBtn" class="primary-btn">Add a piece to cart</button>
          <button id="youtubeBtn" class="secondary-btn" ${youtubeLink ? "" : "disabled"}>YouTube tutorial</button>
        </div>
      </div>
    </article>

    <!-- Pieces Popup -->
    <div id="piecePopup" class="popup">
      <div class="popup-content">
        <h2>Select a piece</h2>
        <ul id="pieceList">${pieceList || "<li>No pieces available</li>"}</ul>
        <button id="closePiecePopup" class="secondary-btn">Close</button>
      </div>
    </div>

    <!-- YouTube Popup -->
    <div id="youtubePopup" class="popup">
      <div class="popup-content" style="background:#000;position:relative;max-width:800px;width:90%;aspect-ratio:16/9;">
        <iframe id="youtubeFrame" src="" allowfullscreen></iframe>
        <button id="closeYoutubePopup">✖</button>
      </div>
    </div>
  `;
}

// ---------- Main Init ----------
async function init() {
  const main = document.querySelector("main") || document.body;
  const productId = getParam("product") || getParam("id") || getParam("productId") || getParam("sku");

  if (!productId) {
    main.innerHTML = "<p style='padding:1rem'>Product id manquant.</p>";
    return;
  }

  try {
    const data = new ProductData("clocks");
    const p = await data.findProductById(productId);
    if (!p) {
      main.innerHTML = "<p style='padding:1rem'>Produit introuvable.</p>";
      return;
    }

    main.innerHTML = template(p);

    // --- Popups ---
    const piecePopup = document.getElementById("piecePopup");
    const youtubePopup = document.getElementById("youtubePopup");
    const pieceListEl = document.getElementById("pieceList");
    const youtubeFrame = document.getElementById("youtubeFrame");

    function showPopup(popup) { popup.classList.add("show"); }
    function hidePopup(popup) { popup.classList.remove("show"); }

    document.getElementById("addPieceBtn").addEventListener("click", () => showPopup(piecePopup));
    document.getElementById("closePiecePopup").addEventListener("click", () => hidePopup(piecePopup));

    pieceListEl.addEventListener("click", e => {
      if (e.target.tagName === "BUTTON") {
        const pieceName = e.target.dataset.piece;
        const piecePrice = parseFloat(e.target.dataset.price);
        const pieceDesc = e.target.dataset.description; // <-- description
        const cart = getLocalStorage("so-cart") || [];
        cart.push({
          Id: `${p.id || p.Id}-${pieceName}`,
          Name: `${pieceName} for ${p.name || p.Name}`,
          Brand: safeBrand(p.Brand ?? p.brand),
          Image: `${BASE_PATH}/src/images/pieces/${pieceName}.png`,
          FinalPrice: piecePrice,
          quantity: 1,
          Description: pieceDesc
        });
        setLocalStorage("so-cart", cart);
        updateCartCount();
        alert(`${pieceName} added to cart ($${piecePrice.toFixed(2)})`);
      }
    });

    document.getElementById("youtubeBtn").addEventListener("click", () => {
      youtubeFrame.src = toEmbedUrl(p.youtubeLink || p.youtube);
      showPopup(youtubePopup);
    });
    document.getElementById("closeYoutubePopup").addEventListener("click", () => {
      youtubeFrame.src = "";
      hidePopup(youtubePopup);
    });

  } catch (err) {
    console.error(err);
    main.innerHTML = "<p style='padding:1rem'>Erreur de chargement du produit.</p>";
  }
}

document.addEventListener("DOMContentLoaded", init);
