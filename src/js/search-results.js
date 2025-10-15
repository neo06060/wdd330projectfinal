const resultsContainer = document.getElementById("results");

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

async function displayResults() {
  const query = getQueryParam("query")?.toLowerCase() || "";
  if (!query) return;

  try {
    const res = await fetch("../json/clocks.json");
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

      // Use the URL directly from JSON
      const imageUrl = clock.Images[0].Url;

      div.innerHTML = `
        <img src="${imageUrl}" alt="${clock.name}">
        <span>${clock.name}</span>
      `;

      // Click redirects to the product page (requires pageUrl in clocks.json)
      div.addEventListener("click", () => {
        if (clock.pageUrl) {
          window.location.href = clock.pageUrl;
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
