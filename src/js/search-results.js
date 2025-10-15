// search-results.js
import { getBasePath, normalizeImageUrl } from './utils.mjs';

const resultsContainer = document.getElementById("results");

// Get the query parameter from URL
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

async function displayResults() {
  const query = getQueryParam("query")?.toLowerCase() || "";
  if (!query) return;

  try {
    // Fetch clocks.json with correct base path
    const res = await fetch(`${getBasePath()}src/json/clocks.json`);
    const clocks = await res.json();

    // Filter clocks whose name includes the search query
    const matches = clocks.filter(clock =>
      clock.name.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<div class="no-results">No clocks were found</div>`;
      return;
    }

    matches.forEach(clock => {
      const div = document.createElement("div");
      div.classList.add("result-item");

      // Normalize image URL
      const imageUrl = normalizeImageUrl(clock.Images?.[0]?.Url);

      div.innerHTML = `
        <img src="${imageUrl}" alt="${clock.name}">
        <span>${clock.name}</span>
      `;

      // Redirect to the correct product page
      div.addEventListener("click", () => {
        if (clock.pageUrl) {
          // Remove leading slash and prepend base path
          const path = clock.pageUrl.replace(/^\/+/, "");
          window.location.href = `${getBasePath()}${path}`;
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
