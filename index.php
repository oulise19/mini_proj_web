<?php
declare(strict_types=1);

// Framework
require_once 'flight/Flight.php';

// Connexion DB
Flight::register('db', 'PDO', [
    'pgsql:host=db;port=5432;dbname=mydb',
    'postgres',
    'postgres'
]);

// Test DB
Flight::route('/test-db', function() {
    $pdo = Flight::db();
    $r = $pdo->query("SELECT * FROM objets")->fetchAll(PDO::FETCH_ASSOC);
    Flight::json($r ?: []);
});

/* =====================================================
   API : Tous les objets
===================================================== */
Flight::route('GET /api/objets', function() {
    $db = Flight::db();

    $sql = "
        SELECT 
            o.id,
            o.nom,
            o.type,
            o.description,
            o.indice,
            o.bloquant_id,
            o.bloquant_nom,
            o.icon,
            ST_X(o.geom) AS lon,
            ST_Y(o.geom) AS lat,
            o.zoom_min,
            o.code,
            o.objet_libere_id,
            o.question_code
        FROM objets o
    ";

    $stmt = $db->query($sql);
    Flight::json($stmt->fetchAll(PDO::FETCH_ASSOC));
});

// Détail objet
Flight::route('GET /api/objets/@id', function($id) {
    $db = Flight::db();
    $stmt = $db->prepare("
        SELECT 
            o.id,
            o.nom,
            o.type,
            o.description,
            o.indice,
            o.bloquant_id,
            o.bloquant_nom,
            o.icon,
            ST_X(o.geom) AS lon,
            ST_Y(o.geom) AS lat,
            o.zoom_min,
            o.code,
            o.objet_libere_id,
            o.question_code
        FROM objets o
        WHERE o.id = ?
    ");
    $stmt->execute([$id]);
    $objet = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($objet) {
        Flight::json($objet);
    } else {
        Flight::json(['error' => 'Objet non trouvé'], 404);
    }
});


/* Pages HTML */
Flight::route('GET /', function() {
    require __DIR__ . '/views/accueil.php';
});

/* =====================================================
   API : Sauvegarder un score
===================================================== */
Flight::route('POST /api/scores', function() {
    $db = Flight::db();
    $data = Flight::request()->data;

    if (empty($data->pseudo) || !isset($data->score)) {
        Flight::json(['error' => 'Pseudo et score requis'], 400);
        return;
    }

    $pseudo = trim($data->pseudo);
    $score = (int)$data->score;

    // Validation du pseudo
    if (strlen($pseudo) < 2 || strlen($pseudo) > 50) {
        Flight::json(['error' => 'Le pseudo doit contenir entre 2 et 50 caractères'], 400);
        return;
    }

    // Insertion du score
    $stmt = $db->prepare("
        INSERT INTO scores (pseudo, score) 
        VALUES (?, ?)
        RETURNING id, pseudo, score, date_jeu
    ");

    try {
        $stmt->execute([$pseudo, $score]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        Flight::json($result, 201);
    } catch (Exception $e) {
        Flight::json(['error' => 'Erreur lors de la sauvegarde du score'], 500);
    }
});

/* =====================================================
   API : Top 10 des scores (Hall of Fame)
===================================================== */
Flight::route('GET /api/scores/top', function() {
    $db = Flight::db();

    $stmt = $db->query("
        SELECT 
            id,
            pseudo,
            score,
            date_jeu,
            ROW_NUMBER() OVER (ORDER BY score DESC) as rang
        FROM scores
        ORDER BY score DESC
        LIMIT 10
    ");

    Flight::json($stmt->fetchAll(PDO::FETCH_ASSOC));
});

/* Pages HTML */
Flight::route('GET /', function() {
    require __DIR__ . '/views/accueil.php';
});

Flight::start();