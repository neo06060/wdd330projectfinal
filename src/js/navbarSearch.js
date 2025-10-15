// navbarSearch.js

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("navbarSearch");
  if (!input) return;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;

      // Determine base path depending on environment
      const hostname = window.location.hostname;
      let basePath;
      if (hostname === "127.0.0.1" || hostname === "localhost") {
        basePath = "/src/navigation/"; // localhost
      } else if (hostname === "neo06060.github.io") {
        basePath = "/wdd330projectfinal/src/navigation/"; // GitHub Pages
      } else {
        basePath = "/src/navigation/"; // fallback
      }

      // Redirect to search-results.html with query
      window.location.href = `${basePath}search-results.html?query=${encodeURIComponent(query)}`;
    }
  });
});
