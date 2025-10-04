// navbarSearch.js

// Map product IDs to the actual HTML filenames
const productPageMap = {
  "985RF": "northface-talus-4.html",
  "989CG": "northface-talus-3.html",
  "985PR": "northface-alpine-3.html",
  "880RR": "marmot-ajax-3.html",
  "880RT": "marmot-ajax-2.html",
  "344YJ": "cedar-ridge-rimrock-2.html"
  // add more as needed
};

// Detect environment and set base path
const hostname = window.location.hostname;
let basePath;
if (hostname === "127.0.0.1" || hostname === "localhost") {
  basePath = "/src/product_pages/"; // localhost
} else if (hostname === "neo06060.github.io") {
  basePath = "/wdd330new/src/product_pages/"; // GitHub Pages
} else {
  basePath = "/src/product_pages/"; // fallback
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("navbarSearch");
  if (!input) return;

  const jsonFiles = [
    "./json/tents.json",
    "./json/backpacks.json",
    "./json/sleeping-bags.json"
  ];

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;

      try {
        // Load all JSON files
        const allProducts = await Promise.all(
          jsonFiles.map(file => fetch(file).then(res => res.json()))
        );
        const products = allProducts.flat();

        // Fuzzy search (partial match)
        const matches = products.filter(p => p.Name && p.Name.toLowerCase().includes(query.toLowerCase()));

        if (matches.length === 1) {
          // Single match → go to page
          const product = matches[0];
          const pageFile = productPageMap[product.Id];
          if (pageFile) {
            window.location.href = `${basePath}${pageFile}?product=${product.Id}`;
          } else {
            alert("No page found for that product.");
          }
        } else if (matches.length > 1) {
          // Multiple matches → list them
          alert(
            "Multiple products found:\n" +
            matches.map(p => `- ${p.Name}`).join("\n") +
            "\n\nPlease refine your search."
          );
        } else {
          alert("No product matches your search.");
        }

      } catch (err) {
        console.error("Search error:", err);
        alert("Error searching for product.");
      }
    }
  });
});
