const app = Vue.createApp({
  data() {
    return {
      map: null,
      markers: [],
      markerMap: {},
      inventaire: [],
      showIntro: true
    }
  },

  methods: {
    startGame() {
      this.showIntro = false;

      this.$nextTick(() => {
        // Initialiser la carte après que #map soit rendu
        this.map = L.map('map').setView([48.85, 2.35], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(this.map);

        const crownIcon = L.icon({
          iconUrl: "assets/couronne.png",
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });

        const hammerIcon = L.icon({
          iconUrl: "assets/marteau.png",
          iconSize: [35, 35],
          iconAnchor: [17, 35]
        });

        fetch('/api/objets') 
        .then(res => res.json()) 
        .then(objets => { 
          
          objets.forEach(o => { 
            let icon = null; 
            if (o.icon === "couronne.png") icon = crownIcon; 
            if (o.icon === "marteau.png") icon = hammerIcon; 
            
             const marker = L.marker([parseFloat(o.lat), parseFloat(o.lon)], icon ? { icon } : {}) 
            .addTo(this.map) 
            .bindPopup(o.nom); 

          marker.on('click', () => this.handleClick(o)); 
            this.markerMap[o.id] = marker; 
          }); 
        }); 
      }); 
    }, 
    handleClick(objet) {
       if (objet.type === 'recuperable') 
        { if (!this.inventaire.find(i => i.id === objet.id)) {
           this.inventaire.push(objet); 
           alert('Vous ramassez : ' + objet.nom); } 
           
           // Supprimer le marker de la carte
            const marker = this.markerMap[objet.id];
            if (marker) {
              this.map.removeLayer(marker);
              delete this.markerMap[objet.id];
            }

           else { alert('Objet déjà dans l’inventaire'); 
           } 
          } 
          else if (objet.type === 'bloque_objet') { 
            if (objet.code) { 
              const userCode = prompt("Entrez le code à 4 chiffres pour récupérer l'objet :"); 
              if (userCode === objet.code) { 
                alert('Code correct ! Vous récupérez la ' + objet.nom); 
                this.inventaire.push(objet); } else { alert('Code incorrect... Essayez encore.'); 
                 

                } 
              } 
              else { const hasRequired = this.inventaire.find(i => i.id === objet.bloquant_id); 
                if (hasRequired) { alert('Vous ouvrez l\'objet ! 🎉 Vous récupérez : ' + objet.nom); 
                  this.inventaire.push(objet); 
                  alert('Vous ramassez : ' + objet.nom);

                  // Supprimer le marker de la carte
                  const marker = this.markerMap[objet.id];
                  if (marker) {
                    this.map.removeLayer(marker);
                    delete this.markerMap[objet.id];
                  }
                
                } 
                  
                  else { alert(objet.indice || "Cet objet semble verrouillé..."); 
                   
                  } 
                } 
              } 
            } 
          } 
        });

app.mount('#app');