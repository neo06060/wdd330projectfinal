let BASE = "";
try { BASE = (import.meta?.env?.VITE_SERVER_URL) || ""; } catch { }

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const data = await res.json();
  // Supporte soit un tableau direct, soit { Result: [...] }
  return Array.isArray(data) ? data : (data.Result ?? []);
}

// Génère plusieurs chemins candidats pour le JSON local, peu importe le dossier courant.
function localJsonCandidates(category) {
  const file = `${category}.json`;
  return [
    // racine serveur
    `/json/${file}`,
    // depuis /src/... (fréquent avec Live Server)
    `../json/${file}`,
    `../../json/${file}`,
    `../../../json/${file}`,
    // si les JSON restent sous public/json
    `public/json/${file}`,
    `../public/json/${file}`,
    `../../public/json/${file}`,
    `../../../public/json/${file}`,
  ];
}

export default class ProductData {
  constructor(category) { this.category = category || "tents"; this._cache = null; }

  async getData() {
    if (this._cache) return this._cache;

    // 1) Essai API distante (si BASE défini)
    if (BASE) {
      const candidates = [
        `${BASE}search/${this.category}`,
        `${BASE}search?category=${encodeURIComponent(this.category)}`,
        `${BASE}products/category/${this.category}`
      ];
      for (const u of candidates) {
        try {
          const list = await fetchJson(u);
          if (list?.length) { this._cache = list; return list; }
        } catch { }
      }
    }

    // 2) Fallback JSON local (essaie plusieurs emplacements possibles)
    const locals = localJsonCandidates(this.category);
    for (const u of locals) {
      try {
        const list = await fetchJson(u);
        if (list?.length) { this._cache = list; return list; }
      } catch { } // on continue à essayer
    }
    throw new Error("Aucune source locale trouvée pour " + this.category);
  }

  async findProductById(id) {
    if (!id) return null;

    // API directe
    if (BASE) {
      const direct = `${BASE}product/${encodeURIComponent(id)}`;
      try {
        const payload = await fetchJson(direct);
        if (payload && (payload.Id || payload.id)) return payload;
        if (Array.isArray(payload) && payload.length) return payload[0];
      } catch { }
    }

    // Rechercher d’abord dans la catégorie courante
    try {
      const list = await this.getData();
      const hit = list.find(p => String(p.Id ?? p.id) === String(id));
      if (hit) return hit;
    } catch { }

    // Scanner toutes les catégories locales courantes connues
    for (const cat of ["tents", "backpacks", "sleeping-bags", "hammocks"]) {
      for (const u of localJsonCandidates(cat)) {
        try {
          const list = await fetchJson(u);
          const hit = list.find(p => String(p.Id ?? p.id) === String(id));
          if (hit) return hit;
        } catch { }
      }
    }
    return null;
  }
}