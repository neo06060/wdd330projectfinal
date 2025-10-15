import { getBasePath } from './utils.mjs';

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("navbarSearch");
  if (!input) return;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;

      const basePath = getBasePath();
      // Redirect to search-results.html with query
      window.location.href = `${basePath}src/navigation/search-results.html?query=${encodeURIComponent(query)}`;
    }
  });
});
