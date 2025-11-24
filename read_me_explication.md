# Escape Game Géographique : Vol du Louvre 

Le but de notre escape game est de retrouver les objets volés du Louvre.

## Description

Vous êtes un détective privé chargé d'enquêter sur le cambriolage du Louvre. Les objets volés ont été dissimulés à travers Paris. Explorez la carte, résolvez des énigmes et retrouvez tous les trésors avant la fin du temps imparti !

Il y a 7 objets à retrouver au total avant la fin du chronomètre (5 minutes) pour pouvoir obtenir le prix final, sinon il y a un malus qui est ajouté.

### Types d'objets

 - Le Marteau: objet récupérable
 - La Couronne d'Eugénie: objet bloqué par un objet
 - La Lettre: objet libéré par la couronne
 - Le Collier: objet bloqué par une question
 - La Loupe : objet libéré par le collier
 - Le parchemin : objet code
 - Le Coffre-Fort : objet bloqué par un code donné par le parchemin
 - Le Reste_Bijoux : objet libéré par le coffre-fort

### Parcours du jeu

1. Les recherches commencent au Musée du Louvre : 
   On y trouve la couronne d'Eugénie : 
        -  Il faut utiliser le Marteau (au jardin des Tuileries) pour débloquer la Couronne. 
        -  Cela libère une Lettre (au Musée du Louvre) qui contient un indice pour la suite.

2. L'indice mène au Quartier Latin :
   On y trouve le Collier : 
        - Il faut répondre à une question pour débloquer l'objet : 
        Question : Quel était le code de sécurité du Musée du Louvre avant le braquage ?
        Réponse : Louvre
        - Cela libère une loupe qui contient un indice pour la suite.

3. L'indice mène à la Tour Eiffel :
   On y trouve un Parchemin :
        - Le parchemin possède un code qui est en fait un code postal de la commune du Louvres (95380).
    

4. On arrive donc dans la commune du Louvres:
   On y trouve enfin le Coffre, il faut mettre comme code, son code postal : 95380.

## Position des objets et Ordre des objets
 - Le Marteau: (2.327, 48.863)
 - La Couronne (2.3364, 48.8606)
 - La Lettre: (2.3364, 48.8606)
 - Le Collier: (2.3469, 48.8462)
 - La Loupe : (2.3469, 48.8462)
 - Le Parchemin : (2.2945, 48.8584)
 - Le Coffre-Fort: (2.505, 49.039)
 - Les Reste_Bijoux : (2.505, 49.039)


## Fonctionnement du jeu
   - L’utilisateur commence à l’écran d’introduction et clique sur Commencer.
   - La carte Leaflet s’affiche avec les objets disponibles selon le zoom.
   - Cliquer sur un objet permet de le récupérer, de répondre à une question ou de saisir un code.
   - Certains objets débloquent d’autres objets ou fournissent des indices pour progresser.
   - Une fois tous les objets collectés dans le bon ordre, le jeu se termine et le score est sauvegardé. Ensuite le score sera afficher dans l'écran d'introduction.
   - Si, à la fin du temps imparti tous les objets ne sont pas trouvés le score est divisé par deux.

## Installation
 - URL du projet : https://github.com/oulise19/mini_proj_web/tree/main
 - Base de donnée : db-init.sql
 - API : index.php
 - HTML : accueil.php
 - Javascript : code3.js
 - Style : style.css
 - GéoServer : http://localhost:8080/geoserver/escape_game/wms + fichier workspace

 

 















