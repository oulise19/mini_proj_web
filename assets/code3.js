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
            //ajout de la méthode zoom_markers ici
            this.zoom_markers();

            //changment : zoom_markers appelé au chargement des marqueurs
            map.on('zoomend', () => {
                this.zoom_markers();
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

    // ajouter un marqueur sur la carte MAIS maitenant on ne l'affiche plus tt de suite
    ajouter_marqueur(objet, forcer = false) {
        //ne pas ajouter le marqueur si l'objet est 'libéré'
        if (objet.type === 'libere' && !forcer) return;

      const image_marqueur = L.icon({
        iconUrl: "/icons/" + objet.icon,
        iconSize: [40, 40]
      });

      let marqueur = L.marker([objet.lat, objet.lon], { icon: image_marqueur });
      marqueur.objet = objet;

      //changement ici : ajout des deux autres méthodes
      marqueur.on("click", () => {
        if (objet.type === 'bloque_objet') {
          this.objet_bloque_par_objet(objet, marqueur);
    
        } else if (objet.type === 'code') {
            this.objet_code(objet, marqueur);
        }
        else if (objet.type === 'recuperable') {
          this.objet_recuperable(objet, marqueur);
        }
        else if (objet.type === 'bloque_code') {
            this.objet_bloque_par_code(objet, marqueur);
        }
      });

      //marqueur.addTo(map);
      marqueurs.push(marqueur);

       //console.log('Markers créés:', this.markers.length);
        this.zoom_markers();
    },

//gerer le zoom/visibilité des objets sur la map
        zoom_markers() {
            let zoomActuel = map.getZoom();

            //console.log('Zoom actuel:', zoomActuel);
            //console.log('Nombre de markers:', this.markers.length);
            
            marqueurs.forEach(marqueur => {
                //si le zoom est supérieur ou égal au zoom_min de l'objet, on l'affiche
               
                if (zoomActuel >= marqueur.objet.zoom_min) {
                    marqueur.addTo(map);
                    } else {
                    map.removeLayer(marqueur);
                    }
                });
        },

    objet_recuperable(objet, marqueur) {
      this.inventaire.push(objet.nom);
      this.score += 10;

      alert(`Vous avez trouvé : ${objet.nom}`);

      //map.closePopup(); (peut etre que yen aura besoin si bug au moment du dézoom)
      map.removeLayer(marqueur);
      marqueurs = marqueurs.filter(m => m !== marqueur);

      if (objet.nom === 'Lettre') {
        alert(objet.description);
        this.verifier_fin_jeu();
      }
    },

    objet_bloque_par_objet(objet, marqueur) {
        //vérifier si l'objet bloquant est dans l'inventaire
      if (objet.bloquant_nom && this.inventaire.includes(objet.bloquant_nom)) {

        this.inventaire.push(objet.nom);
        this.score += 10;
        alert(`Vous avez utilisé ${objet.bloquant_nom} !`);

        //map.closePopup(); (peut etre que yen aura besoin si bug au moment du dézoom)
        map.removeLayer(marqueur);
        marqueurs = marqueurs.filter(m => m !== marqueur);

        //y faudrait pas push dans l'inventaire plutôt (voir méthode bloquer obj)
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

    //ajouter mes deux méthodes 
    objet_code(objet, marqueur) {
        if (this.inventaire.find(i => i.id === objet.id)) {
            //aj inventaire
            this.inventaire.push(objet);
            //est ce qu'on doit mettre le score ?
            this.score += 10;
            alert('Vous ramassez : ' + objet.nom + '\nVous obtenez le code :' + objet.code);
            
            //supprimer le marker de la carte
            //map.closePopup(); (peut etre que yen aura besoin si bug au moment du dézoom)
            map.removeLayer(marqueur);
            marqueurs = marqueurs.filter(m => m !== marqueur);
        } else {
            alert('Objet déjà dans l’inventaire');
        }   

    },


    objet_bloque_par_code(objet, marqueur) {
    if (!this.inventaire.find(i => i.id === objet.id)) {
        let userCode = '';
        
        //tant que l'utilisateur n'a pas entré le bon code
        while (userCode !== objet.code) {
            userCode = prompt(objet.question_code);
            
            if (userCode === null) {
                // L'utilisateur a annulé la saisie
                alert('Action annulée.');
                return;
            } else if (userCode === objet.code) {
                // Aj l'objet principal à l'inventaire
                this.inventaire.push(objet);
                //score ???
                this.score += 10;
        
                alert('Code correct ! Vous récupérez ' + objet.nom);
                
                // Supprimer le marker de la carte
                map.closePopup();
                map.removeLayer(marqueur);
                marqueurs = marqueurs.filter(m => m !== marqueur);
                
                // Trouver et ajouter les objets libérés directement à l'inventaire
                this.objets.forEach(obj => {
                    if (obj.bloquant_id === objet.id) {
                        this.inventaire.push(obj);
                        alert('Vous obtenez aussi : ' + obj.nom + (obj.indice ? '\n' + obj.indice : ''));
                    }
                });
                
            } else {
                alert('Code incorrect. Réessayez.');
            }
            }
        } else {
            alert('Objet déjà dans l\'inventaire');
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