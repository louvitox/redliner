/* ============================================================
   RED LINER — Compteur de visiteurs uniques
   Fichier séparé de index.html
   Service : CountAPI (gratuit, sans inscription)
   Clé unique du compteur : redliner_louvitox_unique_visits_2026
   ------------------------------------------------------------
   Fonctionnement :
   - 1ère visite d'une personne -> incrémente le total (+1)
   - Visites suivantes (même appareil/navigateur) -> n'incrémente pas,
     affiche juste le total actuel
   - "unique" est basé sur le navigateur (localStorage). Si la personne
     vide son cache ou change de navigateur, elle sera recomptée.
     C'est la limite normale d'un compteur gratuit sans connexion.
   ============================================================ */

(function () {
  // Clé unique — ne pas réutiliser ailleurs pour éviter d'écraser
  const COUNTER_KEY = "redliner_louvitox_unique_visits_2026";
  const HIT_URL = "https://countapi.mileshilliard.com/api/v1/hit/" + COUNTER_KEY;
  const GET_URL = "https://countapi.mileshilliard.com/api/v1/get/" + COUNTER_KEY;

  const LOCAL_FLAG = "redliner_visited"; // marque "déjà venu" dans ce navigateur

  function render(value) {
    const el = document.getElementById("visitorCount");
    if (!el) return;
    if (typeof value === "number" && !isNaN(value)) {
      // formatage avec séparateur de milliers selon la langue
      el.textContent = value.toLocaleString();
    } else {
      el.textContent = "—";
    }
  }

  function extractValue(data) {
    // l'API peut renvoyer { value: N } ou { count: N } selon la version
    if (data == null) return null;
    if (typeof data.value === "number") return data.value;
    if (typeof data.count === "number") return data.count;
    return null;
  }

  let alreadyVisited = false;
  try {
    alreadyVisited = localStorage.getItem(LOCAL_FLAG) === "1";
  } catch (e) {
    // localStorage indisponible (mode privé strict) -> on comptera comme nouvelle visite
    alreadyVisited = false;
  }

  const url = alreadyVisited ? GET_URL : HIT_URL;

  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      const v = extractValue(data);
      render(v);
      if (!alreadyVisited) {
        try { localStorage.setItem(LOCAL_FLAG, "1"); } catch (e) {}
      }
    })
    .catch(function () {
      // si le service est indisponible, on tente au moins un GET simple
      fetch(GET_URL)
        .then(function (r) { return r.json(); })
        .then(function (data) { render(extractValue(data)); })
        .catch(function () { render(null); });
    });
})();
