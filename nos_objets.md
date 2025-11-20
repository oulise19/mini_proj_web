Objet récupérable : **Diadème** **de l’impératrice Eugénie**

 o Un objet que l’on peut récupérer et conserver dans notre inventaire

 

Objet code : **Collier en saphirs de la reine Marie-Amélie**



 o Un objet qui affiche un code à 4 chiffres





Objet bloqué par un autre objet : **La couronne de l’impératrice EugénieBroche de l’impératrice Eugénie**

 o Un objet qui nécessite d’avoir le bon objet dans son inventaire pour le

débloquer

 o Quand débloqué, libère un autre objet

 



Objet bloqué par un code :**Broche de l’impératrice Eugénie**



 o Un objet qui nécessite un code pour le débloquer

 o Quand *débloqué*, libère un autre objet



PROGRESSION DU JEU :

1. Page pour expliquer le jeu :

  Bienvenue à "nom du jeu", vous êtes un détective d'un bureau de détective privée.

  Votre première mission concerne le braquage du Louvre le mois dernier.

  Vous devez retrouver retracer les voleurs et retrouver les objets volés.

  BLABLABLA……



  Les recherches commencent au Louvre.

  A vous de jouer!!!

 

 



2\. 1er objet : marqueur visible que lorsque qu'on zoome sur le louvre

Pour débloquer le 1er objet explication :

Tu as trouvé la couronne de l'impératrice Eugénie

Tu as besoin de trouver un marteau ( je sais pas) pour pouvoir prendre la couronne.

Trouve le marteau et mets le dans l'invetaire.

Ensuite mets la couronne dans ton sac



Sur les traces du 2ème objet : des policiers ont trouvés des traces du collier au niveau de



3\.





<?php

ini\_set('display\_errors', 1);

ini\_set('display\_startup\_errors', 1);

error\_reporting(E\_ALL);

?>

<!DOCTYPE html>

<html>

<head>

&nbsp; <meta charset="utf-8" />

&nbsp; <title>Vol du Louvre</title>



&nbsp; <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />

&nbsp; <script src="https://unpkg.com/vue@3"></script>

&nbsp; <script src="https://unpkg.com/leaflet"></script>



&nbsp; <style>

&nbsp;   #map { width: 100%; height: 500px; background-color: lightgray; }

&nbsp;   .intro-screen {

&nbsp;     position: fixed; top: 0; left: 0; width: 100%; height: 100%;

&nbsp;     background: rgba(207,10,10,0.75); display: flex;

&nbsp;     align-items: center; justify-content: center; color: white; z-index: 9999;

&nbsp;   }

&nbsp;   .intro-box {

&nbsp;     background: rgba(201,226,59,0.8); padding: 30px;

&nbsp;     border-radius: 10px; max-width: 400px; text-align: center;

&nbsp;   }

&nbsp;   .intro-box button {

&nbsp;     margin-top: 20px; padding: 10px 20px; font-size: 18px;

&nbsp;     background: #9e8be7ff; border: none; border-radius: 5px; cursor: pointer;

&nbsp;   }

&nbsp;   #inventaire { margin-top: 20px; }

&nbsp; </style>

</head>



<body>



<div id="app">  

&nbsp; <!-- ÉCRAN D’INTRO -->

&nbsp; <div v-if="showIntro" class="intro-screen">

&nbsp;   <div class="intro-box">

&nbsp;     <h1>Vol du Louvre</h1>

&nbsp;     <p>

&nbsp;       Bienvenue à "Vol du Louvre", vous êtes un détective privé.

&nbsp;       Votre première mission concerne le braquage du Louvre.

&nbsp;       Vous devez retrouver les objets volés.

&nbsp;       Les recherches commencent au Louvre. À vous de jouer !!!

&nbsp;     </p>

&nbsp;     <button @click="startGame">Commencer</button>

&nbsp;   </div>

&nbsp; </div>



&nbsp; <!-- LE JEU -->

&nbsp; <div v-else>

&nbsp;   <h1>Trouve les objets volés du Louvre !</h1>



&nbsp;   <div id="map"></div>



&nbsp;   <div id="inventaire">

&nbsp;     <h3>Inventaire :</h3>

&nbsp;     <ul>

&nbsp;       <li v-for="item in inventaire">{{ item.nom }}</li>

&nbsp;     </ul>

&nbsp;   </div>

&nbsp; </div>



</div>



<script>

const app = Vue.createApp({

&nbsp; data() {

&nbsp;   return {

&nbsp;     map: null,

&nbsp;     markers: \[],

&nbsp;     inventaire: \[],

&nbsp;     showIntro: true,

&nbsp;     objets: \[

&nbsp;       {

&nbsp;         id: 1,

&nbsp;         nom: 'La couronne de l’impératrice Eugénie',

&nbsp;         type: 'bloque\_objet',

&nbsp;         description: 'Une couronne impériale, protégée par un marteau.',

&nbsp;         indice: 'Il semble qu’il faille un marteau pour l\\'ouvrir...',

&nbsp;         bloquant\_id: 2,

&nbsp;         icon: 'couronne.png',

&nbsp;         lat: 48.860,

&nbsp;         lon: 2.336,

&nbsp;         code: null

&nbsp;       },

&nbsp;       {

&nbsp;         id: 2,

&nbsp;         nom: 'Marteau',

&nbsp;         type: 'recuperable',

&nbsp;         description: 'Un marteau ancien, utile pour ouvrir certains objets.',

&nbsp;         icon: 'marteau.png',

&nbsp;         lat: 48.863,

&nbsp;         lon: 2.327,

&nbsp;         code: 'marteau' // réponse attendue à la question

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp; },



&nbsp; methods: {

&nbsp;   startGame() {

&nbsp;     this.showIntro = false;



&nbsp;     this.$nextTick(() => {

&nbsp;       this.map = L.map('map').setView(\[48.85, 2.35], 13);

&nbsp;       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

&nbsp;         maxZoom: 19

&nbsp;       }).addTo(this.map);



&nbsp;       const icons = {

&nbsp;         'couronne.png': L.icon({ iconUrl: 'couronne.png', iconSize: \[40,40], iconAnchor: \[20,40] }),

&nbsp;         'marteau.png': L.icon({ iconUrl: 'marteau.png', iconSize: \[35,35], iconAnchor: \[17,35] })

&nbsp;       };



&nbsp;       this.objets.forEach(o => {

&nbsp;         const marker = L.marker(\[o.lat, o.lon], o.icon ? {icon: icons\[o.icon]} : {})

&nbsp;           .addTo(this.map)

&nbsp;           .bindPopup(o.nom);

&nbsp;         marker.on('click', () => this.handleClick(o));

&nbsp;         this.markers.push(marker);

&nbsp;       });

&nbsp;     });

&nbsp;   },



&nbsp;   handleClick(objet) {

&nbsp;     if (objet.type === 'recuperable') {

&nbsp;       if (objet.code) {

&nbsp;         const userAnswer = prompt(

&nbsp;           "Pour récupérer le " + objet.nom + ", répondez à la question :\\n" +

&nbsp;           "Quel outil est nécessaire pour ouvrir certains objets ?"

&nbsp;         );

&nbsp;         if (userAnswer \&\& userAnswer.toLowerCase() === objet.code.toLowerCase()) {

&nbsp;           if (!this.inventaire.find(i => i.id === objet.id)) {

&nbsp;             this.inventaire.push(objet);

&nbsp;             alert('Bonne réponse ! Vous récupérez : ' + objet.nom);

&nbsp;           } else alert('Objet déjà récupéré.');

&nbsp;         } else {

&nbsp;           alert('Mauvaise réponse... essayez encore.');

&nbsp;         }

&nbsp;       } else {

&nbsp;         if (!this.inventaire.find(i => i.id === objet.id)) {

&nbsp;           this.inventaire.push(objet);

&nbsp;           alert('Vous ramassez : ' + objet.nom);

&nbsp;         }

&nbsp;       }

&nbsp;     } else if (objet.type === 'bloque\_objet') {

&nbsp;       const hasRequired = this.inventaire.find(i => i.id === objet.bloquant\_id);

&nbsp;       if (hasRequired) {

&nbsp;         if (!this.inventaire.find(i => i.id === objet.id)) {

&nbsp;           alert('Vous ouvrez l\\'objet ! 🎉 Vous récupérez : ' + objet.nom);

&nbsp;           this.inventaire.push(objet);

&nbsp;         } else alert('Objet déjà récupéré.');

&nbsp;       } else {

&nbsp;         alert(objet.indice || "Cet objet semble verrouillé...");

&nbsp;       }

&nbsp;     }

&nbsp;   }

&nbsp; }

});



app.mount('#app');

</script>



</body>

</html>



 

 

