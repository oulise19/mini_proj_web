let map;
let marqueurs = [];

const app = Vue.createApp({
  data() {
    return {
      showIntro: true,
      inventaire: [],
      score: 0,
      jeuTermine: false,
      hallOfFame: [],
      heatmapLayer: null,
      showHeatmap: false
    };
  },
  mounted() {
    this.charger_hall_of_fame();
  },

  methods: {

    debut_jeu() {
      this.showIntro = false;
      this.jeuTermine = false;
      this.inventaire = [];
      this.score = 0;

      this.$nextTick(() => {
        map = L.map('map').setView([48.85, 2.35], 12);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        fetch('/api/objets')
          .then(res => res.json())
          .then(data => {
            data.forEach(objet => {
              this.ajouter_marqueur(objet);
            });
          });
      });
      this.heatmapLayer = L.tileLayer.wms('http://localhost:8080/geoserver/escape_game/wms', {
      layers: 'escape_game:objets',
      format: 'image/png',
      transparent: true,
      attribution: 'GeoServer'
      });
    },

    ajouter_marqueur(objet, forcer = false) {
      if (objet.type === 'libere' && !forcer) return;

      const image_marqueur = L.icon({
        iconUrl: "/icons/" + objet.icon,
        iconSize: [40, 40]
      });

      let marqueur = L.marker([objet.lat, objet.lon], { icon: image_marqueur });
      marqueur.objet = objet;

      marqueur.on("click", () => {
        if (objet.type === 'bloque_objet') {
          this.objet_bloque_par_objet(objet, marqueur);
        } else {
          this.objet_recuperable(objet, marqueur);
        }
      });

      marqueur.addTo(map);
      marqueurs.push(marqueur);
    },

    objet_recuperable(objet, marqueur) {
      this.inventaire.push(objet.nom);
      this.score += 10;

      alert(`Vous avez trouvé : ${objet.nom}`);

      map.removeLayer(marqueur);
      marqueurs = marqueurs.filter(m => m !== marqueur);

      if (objet.nom === 'Lettre') {
        alert(objet.description);
        this.verifier_fin_jeu();
      }
    },

    objet_bloque_par_objet(objet, marqueur) {
      if (objet.bloquant_nom && this.inventaire.includes(objet.bloquant_nom)) {

        this.inventaire.push(objet.nom);
        this.score += 10;
        alert(`Vous avez utilisé ${objet.bloquant_nom} !`);

        map.removeLayer(marqueur);
        marqueurs = marqueurs.filter(m => m !== marqueur);

        if (objet.objet_libere_id) {
          fetch(`/api/objets/${objet.objet_libere_id}`)
            .then(res => res.json())
            .then(nouvel_objet => {
              this.ajouter_marqueur(nouvel_objet, true);
            });
        }
      } 
      else {
        fetch(`/api/objets/${objet.id}`)
          .then(res => res.json())
          .then(data => {
            alert(`Vous avez besoin de ${data.bloquant_nom}. Indice : ${data.indice}`);
          });
      }
    },

    verifier_fin_jeu() {
      if (marqueurs.length === 0) {
        this.terminer_jeu();
      }
    },

    terminer_jeu() {
      this.jeuTermine = true;
      let pseudo = prompt(
        `Félicitations !\nVotre score : ${this.score} points.\n\nEntrez votre pseudo :`
      );

      if (!pseudo) {
        alert("Score non sauvegardé.");
        return;
      }

      this.sauvegarder_score(pseudo.trim());
    },

    sauvegarder_score(pseudo) {
      fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: pseudo,
          score: this.score
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert("Erreur : " + data.error);
        } else {
          alert(`Score sauvegardé ! Merci ${pseudo} !`);
          this.charger_hall_of_fame();
        }
      });
    },

    charger_hall_of_fame() {
      fetch('/api/scores/top')
        .then(res => res.json())
        .then(data => {
          this.hallOfFame = data;
        });
    },

    charger_heatmap() {
      if (map.hasLayer(this.heatmapLayer)) {
      map.removeLayer(this.heatmapLayer);
      this.showHeatmap = false;
      } else {
      this.heatmapLayer.addTo(map);
      this.showHeatmap = true;
      }
}

  }

});

app.mount('#app');
