import { getBasePath, normalizeImageUrl } from './utils.mjs';

const resultsContainer = document.getElementById("results");
const basePath = getBasePath();

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

async function displayResults() {
  const query = getQueryParam("query")?.toLowerCase() || "";
  if (!query) return;

  try {
    // Fetch clocks.json using dynamic basePath
    const res = await fetch(`${basePath}src/json/clocks.json`);
    const clocks = await res.json();

    // Filter clocks with similar name
    const matches = clocks.filter(clock => clock.name.toLowerCase().includes(query));

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<div class="no-results">No clocks were found</div>`;
      return;
    }

    matches.forEach(clock => {
      const div = document.createElement("div");
      div.classList.add("result-item");

      // Normalize image URL
      const imageUrl = normalizeImageUrl(basePath + clock.Images[0].Url.replace(/^\/+/, ''));

      // Normalize product page URL
      const pageUrl = basePath + clock.pageUrl.replace(/^\/+/, '');

      div.innerHTML = `
        <img src="${imageUrl}" alt="${clock.name}">
        <span>${clock.name}</span>
      `;

      div.addEventListener("click", () => {
        if (pageUrl) {
          window.location.href = pageUrl;
        }
      });

      resultsContainer.appendChild(div);
    });

  } catch (err) {
    console.error("Error loading clocks:", err);
    resultsContainer.innerHTML = `<div class="no-results">Error loading results</div>`;
  }
}

displayResults();
