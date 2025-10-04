import { loadHeaderFooter } from "./loadHeaderFooter.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadHeaderFooter();
    } catch (err) {
        console.error("Header/Footer load error:", err);
    }
});