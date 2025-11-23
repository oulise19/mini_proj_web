
CREATE EXTENSION IF NOT EXISTS postgis;


CREATE TABLE objets (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('recuperable', 'bloque_objet', 'libere', 'code', 'bloque_code')),
    description TEXT,
    indice TEXT,
    bloquant_id INTEGER,
    bloquant_nom TEXT,
    icon TEXT,
    geom GEOMETRY(Point, 4326),
    zoom_min INT DEFAULT 13,
    code VARCHAR(10),
    objet_libere_id INT,
    question TEXT,
    reponse TEXT
);

INSERT INTO objets (id, nom, type, description, icon, geom, zoom_min)
VALUES 
(1, 'Marteau', 'recuperable', 'Un marteau ancien, utile pour ouvrir certains objets.', 
 '🔨', ST_SetSRID(ST_MakePoint(2.327, 48.863), 4326), 15);


INSERT INTO objets (id, nom, type, description, indice, bloquant_id, bloquant_nom, icon, geom, objet_libere_id, zoom_min)
VALUES 
(2, 'Couronne', 'bloque_objet', 'Couronne magnifique du Louvre', 'Cherchez le marteau dans le jardin des Tuileries',
 1, 'Marteau', 'couronne.png', ST_SetSRID(ST_MakePoint(2.3364, 48.8606), 4326), 3, 16);


INSERT INTO objets (id, nom, type, description, icon, geom, zoom_min)
VALUES 
(3, 'Lettre', 'libere', 'Le collier se cache dans le Quartier Latin, près du Panthéon', 
 'lettre.png', ST_SetSRID(ST_MakePoint(2.3364, 48.8606), 4326), 16);


INSERT INTO objets (id, nom, type, geom, objet_libere_id, zoom_min, question, reponse, icon)
VALUES (
  4, 
  'Collier', 
  'bloque_code',
  ST_SetSRID(ST_MakePoint(2.344, 48.846), 4326), 
  5, 
  17, 
  'Quel est le mdp de la sécurité du louvre ?', 
  'louvre',
  'collier.png'
);



INSERT INTO objets (id, nom, type, description, icon, geom, zoom_min)
VALUES 
(5, 'Loupe', 'libere', 'La loupe révèle un indice : "Cherchez un parchemin à la Tour Eiffel"', 
 'loupe.png', ST_SetSRID(ST_MakePoint(2.344, 48.846), 4326), 17);


INSERT INTO objets (id, nom, type, description, icon, geom, zoom_min, code)
VALUES 
(6, 'Parchemin', 'code', 'Un vieux parchemin révélant le code postal : 75007', 
 'parchemin.png', ST_SetSRID(ST_MakePoint(2.2945, 48.8584), 4326), 18, '75007');


INSERT INTO objets (id, nom, type, description, indice, bloquant_id, bloquant_nom, icon, geom, code, zoom_min)
VALUES 
(7, 'Diamant', 'bloque_code', 'Le trésor ultime du Louvre caché près de la Tour Eiffel', 
 'Le code est celui du 7ème arrondissement', 6, 'Parchemin', 'diamant.png', 
 ST_SetSRID(ST_MakePoint(2.2950, 48.8590), 4326), '75007', 18);



CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    date_jeu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_scores_score ON scores(score DESC);