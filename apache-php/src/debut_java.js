let map;
let marqueurs = [];

const app = Vue.createApp({
  data() {
    return {
      showIntro: true,
      inventaire: [],
      score: 0,
      jeuTermine: false,
      hallOfFame: []
    };
  },

  mounted() {
    // Charger le Hall of Fame au démarrage
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
            console.log('Données reçues:', data);
            data.forEach(objet => {
              this.ajouter_marqueur(objet);
            });
          });
      });
    },

    ajouter_marqueur(objet, forcer = false) {
      console.log('Ajout marqueur pour:', objet.nom, objet.type);
      
      if (objet.type == 'libere' && !forcer) {
        console.log('Objet libéré ignoré (sera ajouté après déblocage):', objet.nom);
        return;
      }
      
      let image_marqueur = L.icon({
        iconUrl: "/icons/" + objet.icon,
        iconSize: [40, 40]
      });

      let marqueur = L.marker([objet.lat, objet.lon], { icon: image_marqueur });

      marqueur.objet = objet; 

      marqueur.on("click", (e) => {
        console.log('Clic sur:', objet.nom, 'Type:', objet.type);
        
        if (objet.type == 'bloque_objet') {
          this.objet_bloque_par_objet(objet, marqueur);
        } 
        else if (objet.type == 'recuperable' || objet.type == 'libere') {
          this.objet_recuperable(objet, marqueur);
        }
      });

      marqueur.addTo(map);
      marqueurs.push(marqueur);
    },
    
    objet_recuperable(objet, marqueur) {
      if (objet.type == 'recuperable' || objet.type == 'libere') {
        this.inventaire.push(objet.nom);
        this.score += 10; 
        alert(`Vous avez trouvé : ${objet.nom}`);
        map.removeLayer(marqueur);
        
        const index = marqueurs.indexOf(marqueur);
        if (index > -1) {
          marqueurs.splice(index, 1);
        }
        
        if (objet.nom == 'Lettre') {
          alert('Allez au quartier le plus ancien de Paris pour la suite');
          // Vérifier si c'est la fin du jeu
          this.verifier_fin_jeu();
        }
      }
    },

    objet_bloque_par_objet(objet, marqueur) {
      console.log('Dans objet_bloque_par_objet');
      console.log('bloquant_nom:', objet.bloquant_nom);
      console.log('inventaire:', this.inventaire);
      
      if (objet.bloquant_nom && this.inventaire.includes(objet.bloquant_nom)) {
        this.inventaire.push(objet.nom);
        this.score += 10; 
        alert(`Vous avez utilisé ${objet.bloquant_nom} !`);
        map.removeLayer(marqueur);
        
        const index = marqueurs.indexOf(marqueur);
        if (index > -1) {
          marqueurs.splice(index, 1);
        }
      
        if (objet.objet_libere_id) { 
          fetch(`/api/objets/${objet.objet_libere_id}`)
            .then(res => res.json())
            .then(nouvel_objet => {
              this.ajouter_marqueur(nouvel_objet, true);
            })
            .catch(err => {
              console.error('Erreur fetch nouvel objet:', err);
            });
        }
        
      } else {
        fetch(`/api/objets/${objet.id}`)
          .then(res => res.json())
          .then(data => {
            alert(`Vous avez besoin de ${data.bloquant_nom}. Indice : ${data.indice}`);
          })
          .catch(err => {
            console.error('Erreur lors de la récupération de l\'indice:', err);
            alert('Vous avez besoin d\'un objet pour débloquer ceci.');
          });
      }
    },

    verifier_fin_jeu() {
      // Vérifier si tous les objets ont été récupérés
      // Adaptez cette condition selon votre logique de jeu
      if (this.inventaire.length >= 3) { // Par exemple : Marteau + Couronne + Lettre
        this.terminer_jeu();
      }
    },

    terminer_jeu() {
      this.jeuTermine = true;
      const pseudo = prompt(`Félicitations ! Votre score est de ${this.score} points.\n\nEntrez votre pseudo pour le Hall of Fame :`);
      
      if (pseudo && pseudo.trim()) {
        this.sauvegarder_score(pseudo.trim());
      } else {
        alert('Score non sauvegardé. Merci d\'avoir joué !');
      }
    },

    sauvegarder_score(pseudo) {
      fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pseudo: pseudo,
          score: this.score
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert('Erreur : ' + data.error);
        } else {
          alert(`Score sauvegardé ! Merci ${pseudo} !`);
          this.charger_hall_of_fame(); // Recharger le classement
        }
      })
      .catch(err => {
        console.error('Erreur sauvegarde score:', err);
        alert('Erreur lors de la sauvegarde du score');
      });
    },

    charger_hall_of_fame() {
      fetch('/api/scores/top')
        .then(res => res.json())
        .then(data => {
          this.hallOfFame = data;
          console.log('Hall of Fame chargé:', data);
        })
        .catch(err => {
          console.error('Erreur chargement Hall of Fame:', err);
        });
    }
    
  }

});

app.mount('#app');

