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
            this.creer_marker();

            map.on('zoomend', () => {
                    this.zoom_markers();
                });        
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
        },


    //permet de créer les markers à mettre sur la map
    
        creer_marker() {
            
        this.markers = []; 
        this.objets.forEach(o => {
            //console.log('Objet avant push:', o);

            const lat = parseFloat(o.lat);
            const lon = parseFloat(o.lon);
            console.log('Objet:', o.nom, 'zoom_min:', o.zoom_min, 'visible:', o.visible);

            //aj les autres images avec des if
            let icon;
            if (o.nom === "Marteau") {
               icon = marteauImage;
            } 
            if (o.nom === 'Couronne') {
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
                .bindPopup(o.nom);

            marker.on('click', () => this.ramasser_obj(o)); 
            this.markerMap[o.id] = marker; 
            
            this.markers.push({marker: marker, 
                objet: o


            });
        });
             //console.log('Markers créés:', this.markers.length);
            this.zoom_markers();
            
        },

        //gerer le zoom/visibilité des objets sur la map
        zoom_markers() {
            let zoomActuel = map.getZoom();

            //console.log('Zoom actuel:', zoomActuel);
            //console.log('Nombre de markers:', this.markers.length);
            
            this.markers.forEach(m => {
                //si le zoom est supérieur ou égal au zoom_min de l'objet, on l'affiche
               
                if (zoomActuel >= m.objet.zoom_min) {
                    m.marker.addTo(map);
                    } else {
                    map.removeLayer(m.marker);
                    }
                });
        },

    //nouvelle méthode pour ramasser les objets   
        ramasser_obj(objet) {
            //parchemin : l'objet donne un code
            if (objet.type === 'code') {
                if (!this.inventaire.find(i => i.id === objet.id)) {
                    //ajouter à l'inventaire
                    this.inventaire.push(objet);
                    alert('Vous ramassez : ' + objet.nom + '\nVous obtenez le code : ' + objet.code + ' ' +objet.indice);
                    
                    
                    //supprimer le marker de la carte
                    map.closePopup();
                    let markerItem = this.markers.find(m => m.objet.id === objet.id);
                                if (markerItem) {
                                    markerItem.marker.closePopup();
                                    map.removeLayer(markerItem.marker);
                                    this.markers = this.markers.filter(m => m.objet.id !== objet.id);
                                }
                } else {
                    alert('Objet déjà dans l\’inventaire');
                }
            }
            //collier : objet bloqué par un code 
            else if (objet.type === 'bloque_code') {

                    if (!this.inventaire.find(i => i.id === objet.id)) {
                        let userCode = '';
                    
                    // tant que l'utilisateur n'a pas entré le bon code
                    while (userCode !== objet.code) {
                        
                        //ajouter case dans sql pour adapter le message selon l'objet
                        //à changer 
                        userCode = prompt('Quel était le mot de passe du système de vidéosurveillance du Louvre :');
                        
                        if (userCode === null) {
                            // L'utilisateur a annulé la saisie
                            alert('Action annulée.');
                            return;
                        } else if (userCode === objet.code) {
                            //Aj à l'inventaire
                            this.inventaire.push(objet);
                            alert('Code correct ! Vous récupérez la ' + objet.nom);    
                            
                            //supprimer le marker de la carte
                            //supp tous les pop ups ouverts sinon ca bug
                            map.closePopup();
                            let markerItem = this.markers.find(m => m.objet.id === objet.id);
                                if (markerItem) {
                                    markerItem.marker.closePopup();
                                    map.removeLayer(markerItem.marker);
                                    this.markers = this.markers.filter(m => m.objet.id !== objet.id);
                                }
                        } else {
                            alert('Code incorrect. Réessayez.');
                        
                        }  
                     }
            
            } else {
                alert('Objet déjà dans l’\inventaire');
            }           
                    
                }
               
                }
            }
        });

app.mount('#app');