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
    $r = $pdo->query("SELECT * FROM points")->fetchAll(PDO::FETCH_ASSOC);
    Flight::json($r ?: []);
});

// Liste objets visibles
Flight::route('GET /api/objets', function() {
    $db = Flight::db();

    $sql = "
        SELECT id, nom, type, description, indice, bloquant_id,
               ST_X(geom) AS lon, ST_Y(geom) AS lat,
               icon, visible, zoom_min, code, question_code, objet_libere_id
        FROM objets
        WHERE visible = TRUE
    ";

    $stmt = $db->query($sql);
    Flight::json($stmt->fetchAll(PDO::FETCH_ASSOC));
});

// Détail objet
Flight::route('GET /api/objets/@id', function($id) {
    $db = Flight::db();
    $stmt = $db->prepare("SELECT * FROM objets WHERE id = ?");
    $stmt->execute([$id]);
    $obj = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($obj) Flight::json($obj);
    else Flight::json(['error' => 'Objet non trouvé'], 404);
});

/* Pages HTML */
Flight::route('GET /', function() {
    require __DIR__ . '/views/accueil.php';
});


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