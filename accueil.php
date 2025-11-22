<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Vol du Louvre</title>

  <!-- CSS local -->
  <link rel="stylesheet" href="/views/style.css" />

  <!-- Leaflet -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <!-- Vue 3 -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>

<body>
  <div id="app">

    <!-- Écran d'introduction -->
    <div v-if="showIntro" class="intro-screen">

      <div class="intro-box">
        <h1>Cambriolage du Louvre</h1>
        <p>
          Bienvenue à "Vol du Louvre",<br>
          Vous êtes un détective privé.<br>
          Votre première mission concerne le braquage du Louvre.<br>
          Retrouvez les objets volés dissimulés dans Paris.<br>
          À vous de jouer !
        </p>

        <button @click="debut_jeu">Commencer</button>

        <div v-if="hallOfFame.length > 0" class="hall-of-fame">
          <h2>🏆 Hall of Fame</h2>
          <table>
            <thead>
              <tr>
                <th>Rang</th>
                <th>Pseudo</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="score in hallOfFame" :key="score.id">
                <td :class="'rank-' + score.rang">{{ score.rang }}</td>
                <td>{{ score.pseudo }}</td>
                <td>{{ score.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>


    <div v-else class="interface-grid">

      <h1>Vol du Louvre</h1>

      <div class="inventaire">
        <h2> Inventaire</h2>
        <ul v-if="inventaire.length > 0">
          <li v-for="item in inventaire" :key="item">{{ item }}</li>
        </ul>
        <p v-else style="opacity: 0.6;">Vide</p>
      </div>

      <div class="score">
        <h2> Score</h2>
        <p class="score-points">{{ score }} points</p>
        
        <div class="chrono" :class="{ 'chrono-danger': tempsRestant < 60 }">
          <h3>Temps</h3>
          <p class="temps">{{ tempsFormate }}</p>
        </div>
        
        <div class="heatmap-toggle">
          <label>
            <input type="checkbox" @change="toggle_heatmap" :checked="showHeatmap">
             Heatmap
          </label>
        </div>
      </div>

      <div id="map"></div>

    </div>

  </div>

  <script src="/views/java.js"></script>
</body>
</html>