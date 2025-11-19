//charger la map centrée sur le Louvre
var map = L.map('map').setView([48.8606, 2.3376], 13); // More precise Louvre coordinates

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
}).addTo(map);

let coucheMarkers = L.geoJSON().bindPopup(layer => {
    return '<h3>'+layer.feature.properties.label+'</h3><p>'+layer.feature.properties.context+'</p>';
}).addTo(map);

let coucheGeom = L.geoJSON().addTo(map);


//rentrer en dur les images des objets
let couronneImage = L.icon({
          iconUrl: "assets/couronne.png",
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });

let marteauImage = L.icon({
          iconUrl: "assets/marteau.png",
          iconSize: [35, 35],
          iconAnchor: [17, 35]
        });

let collierImage = L.icon({
          iconUrl: "assets/collier_marie-amelie.png",
          iconSize: [40, 40],
          iconAnchor: [17, 35]
        });

let parcheminImage = L.icon({
          iconUrl: "assets/parchemin.png",
          iconSize: [30, 40],
          iconAnchor: [15, 40]
        });

let coffre_fortImage = L.icon({
          iconUrl: "assets/coffre_fort.png",
          iconSize: [30, 40],
          iconAnchor: [15, 40]
        });


const app = Vue.createApp({
    data() {
        return {
            inventaire: [],
            objets:[],
            markers: [],
            markerMap: {}
        }
    },
    computed:{},
    mounted(){
        //pour faire marcher la méthode 
        this.aj_obj();
       
    },
    methods: {

        //permet d'ajouter les objets sur la map
        aj_obj() {
        let url='/api/objets';
        fetch(url)
        .then(response => response.json())  
        .then(objets => {

            this.objets = objets; 
            
            objets.forEach(o => {
          
            const lat = parseFloat(o.lat);
            const lon = parseFloat(o.lon);

            //aj les autres images avec des if
            let icon;
            if (o.nom === "Marteau") {
                icon = marteauImage;
            } 
            if (o.nom === 'La couronne de l\'impératrice Eugénie') {
                icon = couronneImage;
            }
            if (o.nom === "Collier Marie-Amelie") {
                icon = collierImage;
            }
            if (o.nom === "Parchemin") {
                icon = parcheminImage;
            } 
            if (o.nom === 'Derniers bijoux') {
                icon = coffre_fortImage;
            }
            const marker = L.marker([lat, lon], { icon: icon })
                .addTo(map)
                .bindPopup(o.nom);
            

            marker.on('click', () => this.ramasser_obj(o)); 
            this.markerMap[o.id] = marker; 

            });
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
        },

    //nouvelle méthode pour ramasser les objets   
        ramasser_obj(objet) {
            //parchemin : l'objet donne un code
            if (objet.type === 'code') {
            if (!this.inventaire.find(i => i.id === objet.id)) {
                this.inventaire.push(objet);
                alert('Vous ramassez : ' + objet.nom + '\nVous obtenez le code : ' + objet.code + ' ' +objet.indice);
                
            } else {
                alert('Objet déjà dans l’inventaire');
            }
            }
            //collier : objet bloqué par un code 
            else if (objet.type === 'bloque_code') {

                 if (!this.inventaire.find(i => i.id === objet.id)) {
                    let userCode = '';
                
                // tant que l'utilisateur n'a pas entré le bon code
                while (userCode !== objet.code) {
                if (!this.inventaire.find(i => i.id === objet.id)) {
                    let userCode = prompt('Quel est le code pour ouvrir le ' + objet.nom + ' :');
                    if (userCode === objet.code) {
                        this.inventaire.push(objet);
                        alert('Code correct ! Vous récupérez la ' + objet.nom + 
                                'Vous ramassez une loupe! Elle vous indique de zoomer sur la Tour Eiffel');
                    } else {
                        alert('Code incorrect. Réessayez.');
                    }  
                }             
                    
                }
               
                }
            }
        },
    },

});

app.mount('#app');