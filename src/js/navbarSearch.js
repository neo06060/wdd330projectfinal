// navbarSearch.js
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("navbarSearch");
  if (!input) return;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;

      // Determine relative path to search-results.html
      const currentPath = window.location.pathname;
      let basePath;

      if (currentPath.includes("/src/")) {
        // Local dev
        basePath = "../navigation/";
      } else {
        // GitHub Pages
        basePath = "src/navigation/";
      }

      // Redirect with query
      window.location.href = `${basePath}search-results.html?query=${encodeURIComponent(query)}`;
    }
  });
});
