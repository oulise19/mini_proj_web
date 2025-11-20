-- Activer PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Création de la table objets
CREATE TABLE objets (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('recuperable', 'bloque_objet','libere')),
    description TEXT,
    indice TEXT,
    bloquant_id INTEGER,
    bloquant_nom TEXT,
    icon TEXT,
    geom GEOMETRY(Point, 4326),
    zoom_min INT DEFAULT 13,
    code CHAR(4),
    objet_libere_id INT
);

-- Réinsérer les données
INSERT INTO objets (id, nom, type, description, icon, geom)
VALUES 
(1, 'Marteau', 'recuperable', 'Un marteau ancien, utile pour ouvrir certains objets.', 
 '🔨', ST_SetSRID(ST_MakePoint(2.327, 48.863), 4326));

INSERT INTO objets (id, nom, type, description, indice, bloquant_id, bloquant_nom, icon, geom, objet_libere_id)
VALUES 
(2, 'Couronne', 'bloque_objet', 'Couronne magnifique', 'Cherchez le marteau dans le jardin des Tuileries',
 1, 'Marteau', 'couronne.png', ST_SetSRID(ST_MakePoint(2.33583, 48.86111), 4326), 3);

INSERT INTO objets (id, nom, type, description, icon, geom)
VALUES 
(3, 'Lettre', 'libere', 'Continuez vos recherches dans le quartier le plus ancien de Paris', 
 'lettre.png', ST_SetSRID(ST_MakePoint(2.33583, 48.86111), 4326));


-- Table pour stocker les scores
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    date_jeu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes de classement
CREATE INDEX idx_scores_score ON scores(score DESC);