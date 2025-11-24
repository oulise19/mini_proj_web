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
    tempsFormate() {
      const minutes = Math.floor(this.tempsRestant / 60);
      const secondes = this.tempsRestant % 60;
      return `${minutes}:${secondes.toString().padStart(2, '0')}`;
    }
  },

  mounted() {
    console.log('App montée');
    this.charger_hall_of_fame();
  },

  methods:{

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
            data.forEach(objet => {
             
            
              this.objets = data; 
              this.ajouter_marqueur(objet);
            });
            
            //gestion du zoom des markers
            this.zoom_markers();

            //démarrer le chrono après le chargement des marqueurs
            this.demarrer_chrono();
             

            //zoom_markers appelé au chargement des marqueurs
            map.on('zoomend', () => {
                this.zoom_markers();
            });   
          });
      });
      
    },

    //fonction de gestion du chrono
    demarrer_chrono() {
      console.log('Chrono démarré');
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

  //fonction d'arrêt du chrono
    arreter_chrono() {
      console.log('Chrono arrêté');
      if (this.chronoInterval) {
        clearInterval(this.chronoInterval);
        this.chronoInterval = null;
        this.chronoActif = false;
      }
    },

    //fonction appelée lorsque le temps est écoulé
    temps_ecoule() {
      alert(' Temps écoulé ! Vous n\'avez pas trouvé tous les objets à temps.');
      // Pénalité : diviser le score par 2
      this.score = Math.floor(this.score / 2);
      this.terminer_jeu();
    },

    // Ajouter un marqueur sur la carte pour un objet
    ajouter_marqueur(objet, forcer = false) {
        //ne pas ajouter le marqueur si l'objet est un objet 'libere' après un objet bloqué 
        // par un code ou un objet bloqué par un objet
        if (objet.type === 'libere' && !forcer) return;

      const image_marqueur = L.icon({
        iconUrl: "/assets/" + objet.icon,
        iconSize: [40, 40]
      });

      let marqueur = L.marker([objet.lat, objet.lon], { icon: image_marqueur });
      marqueur.objet = objet;

      // Ajouter un gestionnaire d'événements pour le clic sur le marqueur
      marqueur.on("click", () => {
        if (objet.type === 'bloque_objet') {
          this.objet_bloque_par_objet(objet, marqueur);
    
        } else if (objet.type === 'code') {
            this.objet_code(objet, marqueur);
        }
        else if (objet.type === 'recuperable'|| objet.type === 'libere') {
          this.objet_recuperable(objet, marqueur);
        }
        else if (objet.type === 'bloque_code') {
            this.objet_bloque_par_code(objet, marqueur);
        }
      });

      
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

    //methodes pour les différents types d'objets
    objet_recuperable(objet, marqueur) {
      // Ajouter à l'inventaire
      this.inventaire.push(objet);
      // Ajouter à l'inventaire
      this.score += 10;

      alert(`Vous avez trouvé : ${objet.nom}`);
      
      // Supprimer le marker de la carte
      map.removeLayer(marqueur);
      marqueurs = marqueurs.filter(m => m !== marqueur);
    
      if (objet.nom === 'Lettre') {
        if (objet.description) {
          alert(objet.description);
        }
        
      }
      //console.log('Vérification de la fin du jeu après récupération de ' + objet.nom);
      this.verifier_fin_jeu();
        
    },

    objet_bloque_par_objet(objet, marqueur) {
      // Vérifier si l'objet bloquant est dans l'inventaire
      const aObjetBloquant = this.inventaire.some(item => item.nom === objet.bloquant_nom);
      
      if (objet.bloquant_nom && aObjetBloquant) {
        this.inventaire.push(objet);
        this.score += 10;
        alert(`Vous avez utilisé ${objet.bloquant_nom} !`);

        map.removeLayer(marqueur);
        marqueurs = marqueurs.filter(m => m !== marqueur);

        // Si l'objet libéré existe, l'ajouter à la carte
        if (objet.objet_libere_id) {
          fetch(`/api/objets/${objet.objet_libere_id}`)
            .then(res => res.json())
            .then(nouvel_objet => {
              this.ajouter_marqueur(nouvel_objet, true);

               // Afficher le message avec la description
                let message = `Un nouvel objet est apparu sur la carte : ${nouvel_objet.nom}`;
                if (nouvel_objet.description) {
                    message += `\n\n${nouvel_objet.description}`;
                }
                alert(message);
            });
        }
      } else {
        fetch(`/api/objets/${objet.id}`)
          .then(res => res.json())
          .then(data => {
            alert(`Vous avez besoin de ${data.bloquant_nom}. Indice : ${data.indice}`);
          });
      }
      //console.log('Vérification de la fin du jeu après récupération de ' + objet.nom);
      this.verifier_fin_jeu();
      
    },


   objet_code(objet, marqueur) {
    
    if (!this.inventaire.find(i => i.id === objet.id)) {
        console.log('Ajout de ' + objet.nom + ' à l\'inventaire');

        this.inventaire.push(objet);
        this.score += 10;
        
        alert('Vous ramassez : ' + objet.nom + '\nVous obtenez le code : ' + objet.code + '\nIndice : ' + objet.indice);
        
        // Supprimer le marker de la carte
        map.removeLayer(marqueur);
        marqueurs = marqueurs.filter(m => m !== marqueur);
 
      } else {
          //console.log(objet.nom + ' déjà dans l\'inventaire');
          alert('Objet déjà dans l\'inventaire');
      } 
        
      //console.log('Vérification de la fin du jeu après récupération de ' + objet.nom);
      this.verifier_fin_jeu();
    },

    objet_bloque_par_code(objet, marqueur) {
      
        if (!this.inventaire.find(i => i.id === objet.id)) {
            //console.log('code attendu =', objet.code);
            
            // Demander le code
            let userCode = prompt(objet.question_code);
            
            if (userCode === null) {
                alert('Action annulée.');
                return;
            }       
            //Enlever espaces et mettre en minuscules pour comparer
            const userCodeNormalized = userCode.trim().toLowerCase();
            const codeAttendu = objet.code.trim().toLowerCase();
            
            if (userCodeNormalized === codeAttendu) {
                this.inventaire.push(objet);
                this.score += 10;
                alert('Code correct ! Vous récupérez ' + objet.nom);
                
                // Supprimer le marker de la carte
                map.removeLayer(marqueur);
                marqueurs = marqueurs.filter(m => m !== marqueur);
                
                if (objet.objet_libere_id) {
                let objetLibere = this.objets.find(obj => obj.id === objet.objet_libere_id);
                
                if (objetLibere) {
                    console.log('Objet libéré:', objetLibere.nom);
                    // Créer un nouveau marqueur pour l'objet libéré
                    this.ajouter_marqueur(objetLibere, true);
                    alert(`Un nouvel objet est apparu sur la carte : ${objetLibere.nom}` + `\n\nIndice : ${objetLibere.indice}`);
                }
            }
              //console.log('Vérification de la fin du jeu après récupération de ' + objet.nom);
              this.verifier_fin_jeu();
            } else {
                alert('Code incorrect. Réessayez en cliquant à nouveau sur l\'objet.');
            }
        } else {
            console.log(objet.nom + ' déjà dans l\'inventaire');
            alert('Objet déjà dans l\'inventaire');
        }
    },

    // Vérifier si le jeu est terminé
    verifier_fin_jeu() {
      //Quand les marqueurs sont tous récupérés
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

    // Terminer le jeu 
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

    // Sauvegarder le score via l'API
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
          // Recharger le hall of fame
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
    //Gérer la heatmap
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