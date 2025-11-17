<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Vol du Louvre</title>

  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
  <script src="https://unpkg.com/vue@3"></script>
  <script src="https://unpkg.com/leaflet"></script>
  <link rel="stylesheet" href="assets/style.css">

</head>

<body>

<div id="app">  

  <!-- ÉCRAN D’INTRO -->
  <div v-if="showIntro" class="intro-screen">
    <div class="intro-box">
      <h1>Vol du Louvre</h1>
      <p>
        Retrouvez les bijoux volés du Louvre ! 
        Vous êtes un détective privé du 5e arrondissement.
        Vous devez retracer le parcours des voleurs et retrouver les joyaux volés.

        Les recherches commencent au Louvre, au centre de Paris. À vous de jouer !!!
      </p>
      <button @click="startGame">Commencer</button>
    </div>
  </div>

  <!-- LE JEU -->
  <div v-else>
    <h1>Trouve les objets volés du Louvre !</h1>

    <div id="map"></div>

    <div id="inventaire">
      <h3>Inventaire :</h3>
      <ul>
        <li v-for="item in inventaire">{{ item.nom }}</li>
      </ul>
    </div>
  </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/vue"></script>
    <script src="assets/code.js"></script>

</body>
</html>
