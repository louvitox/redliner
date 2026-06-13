/* ============================================================
   RED LINER — Stats Roblox en direct
   Fichier séparé de index.html
   ------------------------------------------------------------
   Récupère en temps réel depuis l'API publique Roblox :
   - Joueurs en ligne (playing)
   - Visites totales (visits)
   - Likes (upvotes)
   - Favoris (favorites)

   L'API Roblox bloque les appels directs depuis un navigateur (CORS),
   on passe donc par un proxy CORS public (Approche A).
   Si le proxy tombe, les stats affichent "—" sans casser le site.
   ============================================================ */

(function () {
  const PLACE_ID = "94987506187454"; // RED LINER (depuis l'URL du jeu)

  // Proxy CORS public. Si l'un tombe, on peut changer ici.
  const PROXY = "https://corsproxy.io/?url=";

  function fmt(n) {
    if (typeof n !== "number" || isNaN(n)) return "—";
    return n.toLocaleString();
  }
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function proxied(url) {
    return PROXY + encodeURIComponent(url);
  }

  async function getJSON(url) {
    const r = await fetch(proxied(url));
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }

  async function loadStats() {
    try {
      // 1) Place ID -> Universe ID
      const uniData = await getJSON(
        "https://apis.roblox.com/universes/v1/places/" + PLACE_ID + "/universe"
      );
      const universeId = uniData.universeId;
      if (!universeId) throw new Error("no universeId");

      // 2) Données du jeu (playing, visits, favorites)
      const gamesData = await getJSON(
        "https://games.roblox.com/v1/games?universeIds=" + universeId
      );
      const g = gamesData.data && gamesData.data[0] ? gamesData.data[0] : {};

      setText("statPlaying", fmt(g.playing));
      setText("statVisits", fmt(g.visits));
      setText("statFavorites", fmt(g.favoritedCount));

      // 3) Votes (likes / dislikes)
      try {
        const votesData = await getJSON(
          "https://games.roblox.com/v1/games/votes?universeIds=" + universeId
        );
        const v = votesData.data && votesData.data[0] ? votesData.data[0] : {};
        setText("statLikes", fmt(v.upVotes));
      } catch (e) {
        setText("statLikes", "—");
      }
    } catch (e) {
      // tout échoue : on laisse les tirets, le site marche quand même
      setText("statPlaying", "—");
      setText("statVisits", "—");
      setText("statFavorites", "—");
      setText("statLikes", "—");
    }
  }

  loadStats();
  // rafraîchit le "joueurs en ligne" toutes les 30 secondes
  setInterval(loadStats, 30000);
})();
