export async function loadHeaderFooter() {
    async function loadInto(containerId, urls) {
        const el = document.getElementById(containerId);
        if (!el) return;
        for (const url of urls) {
            try {
                const res = await fetch(url);
                if (res.ok) { el.innerHTML = await res.text(); return; }
            } catch (_) { }
        }
        el.innerHTML = `<p style="color:#b00;">Failed to load ${urls[0]}</p>`;
    }

    await Promise.all([
        loadInto("headercontainer", ["/assets/header.html", "./assets/header.html", "../assets/header.html"]),
        loadInto("footercontainer", ["/assets/footer.html", "./assets/footer.html", "../assets/footer.html"]),
    ]);
}