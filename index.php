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
               icon, visible, zoom_min, code, question_code, objet_recup, indice_obj_recup, image_obj_recup
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

// Pages HTML
Flight::route('GET /', function() {
    require __DIR__ . '/views/accueil.php';
});

Flight::route('GET /accueil', function() {
    require __DIR__ . '/views/accueil.php';
});

Flight::start();