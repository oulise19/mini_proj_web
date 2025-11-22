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
      showHeatmap: false,
      tempsRestant: 300, 
      chronoInterval: null,
      chronoActif: false
    };
  },

  computed: {
    // AJOUT : Formater le temps en MM:SS
    tempsFormate() {
      const minutes = Math.floor(this.tempsRestant / 60);
      const secondes = this.tempsRestant % 60;
      return `${minutes}:${secondes.toString().padStart(2, '0')}`;
    }
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
      this.tempsRestant = 300

      this.$nextTick(() => {
        map = L.map('map').setView([48.85, 2.35], 12);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        this.heatmapLayer = L.tileLayer.wms('http://localhost:8080/geoserver/escape_game/wms', {
          layers: 'escape_game:objets',
          format: 'image/png',
          transparent: true,
          attribution: 'GeoServer'
        });

        fetch('/api/objets')
          .then(res => res.json())
          .then(data => {
            console.log('Données reçues:', data);
            data.forEach(objet => {
              this.ajouter_marqueur(objet);
            });
            this.zoom_markers();
            
          
            this.demarrer_chrono();
          });

        map.on('zoomend', () => {
          this.zoom_markers();
        });   
      });
    },

    
    demarrer_chrono() {
      this.chronoActif = true;
      this.chronoInterval = setInterval(() => {
        if (this.tempsRestant > 0) {
          this.tempsRestant--;
        } else {
          this.arreter_chrono();
          this.temps_ecoule();
        }
      }, 1000);
    },

  
    arreter_chrono() {
      if (this.chronoInterval) {
        clearInterval(this.chronoInterval);
        this.chronoInterval = null;
        this.chronoActif = false;
      }
    },

    temps_ecoule() {
      alert(' Temps écoulé ! Vous n\'avez pas trouvé tous les objets à temps.');
      // Pénalité : diviser le score par 2
      this.score = Math.floor(this.score / 2);
      this.terminer_jeu();
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
        console.log('Clic sur:', objet.nom, 'Type:', objet.type);
        
        if (objet.type === 'bloque_objet') {
          this.objet_bloque_par_objet(objet, marqueur);
        } else if (objet.type === 'code') {
          this.objet_code(objet, marqueur);
        } else if (objet.type === 'recuperable' || objet.type === 'libere') {
          this.objet_recuperable(objet, marqueur);
        } else if (objet.type === 'bloque_code') {
          this.objet_bloque_par_code(objet, marqueur);
        }
      });

      marqueurs.push(marqueur);
      this.zoom_markers();
    },

    zoom_markers() {
      let zoomActuel = map.getZoom();
      
      marqueurs.forEach(marqueur => {
        if (zoomActuel >= marqueur.objet.zoom_min) {
          if (!map.hasLayer(marqueur)) {
            marqueur.addTo(map);
          }
        } else {
          if (map.hasLayer(marqueur)) {
            map.removeLayer(marqueur);
          }
        }
      });
    },

    objet_recuperable(objet, marqueur) {
      this.inventaire.push(objet.nom);
      this.score += 10;
      alert(`Vous avez trouvé : ${objet.nom}`);

      map.removeLayer(marqueur);
      marqueurs = marqueurs.filter(m => m !== marqueur);

      if (objet.nom === 'Lettre' || objet.nom === 'Loupe') {
        if (objet.description) {
          alert(objet.description);
        }
      }
      
      this.verifier_fin_jeu();
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
      } else {
        fetch(`/api/objets/${objet.id}`)
          .then(res => res.json())
          .then(data => {
            alert(`Vous avez besoin de ${data.bloquant_nom}. Indice : ${data.indice}`);
          });
      }
    },

    objet_code(objet, marqueur) {
      if (this.inventaire.includes(objet.nom)) {
        alert('Objet déjà récupéré');
        return;
      }

      this.inventaire.push(objet.nom);
      this.score += 10;
      alert(`Vous ramassez : ${objet.nom}\nCode révélé : ${objet.code}`);
      
      map.removeLayer(marqueur);
      marqueurs = marqueurs.filter(m => m !== marqueur);
      
      this.verifier_fin_jeu();
    },

    objet_bloque_par_code(objet, marqueur) {
      if (this.inventaire.includes(objet.nom)) {
        alert('Objet déjà récupéré');
        return;
      }

      console.log('Objet bloqué par code:', objet);

      if (objet.question && objet.reponse) {
        let userAnswer = prompt(objet.question);
        
        if (userAnswer === null) {
          alert('Action annulée.');
          return;
        }
        
        if (userAnswer.trim() === objet.reponse) {
          this.inventaire.push(objet.nom);
          this.score += 10;
          alert(`Bonne réponse ! Vous récupérez ${objet.nom}`);
          
          map.removeLayer(marqueur);
          marqueurs = marqueurs.filter(m => m !== marqueur);
          
          if (objet.objet_libere_id) {
            fetch(`/api/objets/${objet.objet_libere_id}`)
              .then(res => res.json())
              .then(nouvel_objet => {
                this.ajouter_marqueur(nouvel_objet, true);
              });
          }
          
          this.verifier_fin_jeu();
        } else {
          alert(`Mauvaise réponse (vous avez répondu: "${userAnswer}"). Réessayez.`);
        }
      } 
      else if (objet.code) {
        if (objet.bloquant_nom && !this.inventaire.includes(objet.bloquant_nom)) {
          alert(`Vous avez besoin de ${objet.bloquant_nom}. Indice : ${objet.indice}`);
          return;
        }

        let userCode = prompt(`Entrez le code postal du 7ème arrondissement :`);
        
        if (userCode === null) {
          alert('Action annulée.');
          return;
        }
        
        if (userCode.trim() === objet.code) {
          this.inventaire.push(objet.nom);
          this.score += 10;
          alert(`Code correct ! Vous récupérez ${objet.nom}\n\n🎉 FÉLICITATIONS ! Vous avez terminé le jeu !`);
          
          map.removeLayer(marqueur);
          marqueurs = marqueurs.filter(m => m !== marqueur);
          
          this.verifier_fin_jeu();
        } else {
          alert(`Code incorrect (vous avez répondu: "${userCode}"). Réessayez.`);
        }
      }
    },

    verifier_fin_jeu() {
      if (marqueurs.length === 0) {
        this.arreter_chrono();
        
        if (this.tempsRestant > 0) {
          const bonus = this.tempsRestant * 2;
          this.score += bonus;
          alert(`⏱️ Bonus temps : +${bonus} points (${this.tempsRestant}s restantes) !`);
        }
        
        this.terminer_jeu();
      }
    },

    terminer_jeu() {
      this.jeuTermine = true;
      
      let message = `🎉 FÉLICITATIONS !\nVous avez terminé le jeu !\n\nVotre score : ${this.score} points.`;
      
      if (this.tempsRestant > 0) {
        message += `\nTemps restant : ${this.tempsFormate}`;
      } else {
        message += `\n Temps écoulé - Score réduit de moitié`;
      }
      let pseudo = prompt(message + '\n\nEntrez votre pseudo :');

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

    toggle_heatmap() {
      console.log('Toggle heatmap appelé');
      
      if (!map) {
        alert('Veuillez d\'abord commencer le jeu');
        return;
      }

      if (!this.heatmapLayer) {
        alert('Carte de chaleur non disponible');
        return;
      }

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