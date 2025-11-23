CREATE EXTENSION IF NOT EXISTS postgis;

-- Création de la table objets
CREATE TABLE IF NOT EXISTS objets (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('recuperable', 'bloque_objet', 'bloque_code', 'code', 'libere')),
    description TEXT,
    indice TEXT,
    bloquant_id INT,
    bloquant_nom TEXT,
    icon TEXT,
    geom GEOMETRY(Point, 4326),
    zoom_min INT DEFAULT 15,
    code CHAR(9),
    question_code TEXT,
    objet_libere_id INT
);

-- Insertion du marteau (dans les jardins des Tuileries)
INSERT INTO objets (id,nom, type, description, icon, geom, zoom_min)
VALUES 
(1, 'marteau', 'recuperable', 'Un marteau ancien, utile pour ouvrir certains objets.', 
 'marteau.png', ST_SetSRID(ST_MakePoint(2.327, 48.863), 4326), 15);

-- Insertion de la couronne (bloquée par le marteau)
INSERT INTO objets (id, nom, type, description, indice, bloquant_id, bloquant_nom, icon, geom, objet_libere_id, zoom_min)
VALUES 
(2, 'couronne', 'bloque_objet', 'Couronne magnifique du Louvre', 'Cherchez le marteau dans le jardin des Tuileries',
 1, 'marteau', 'couronne.png', ST_SetSRID(ST_MakePoint(2.3364, 48.8606), 4326), 3, 16);

--Lettre : 
INSERT INTO objets (id, nom, type, description, icon, geom, zoom_min)
VALUES 
(3, 'lettre', 'libere', 'Le collier se cache dans le Quartier Latin, près du Panthéon', 
 'lettre.png', ST_SetSRID(ST_MakePoint(2.3364, 48.8606), 4326), 16);


--Collier Marie-Amelie (bloqué par un code)
INSERT INTO objets (id, nom, type, description, icon, geom, zoom_min, code, objet_libere_id, question_code)
VALUES
(4, 'collier', 'bloque_code', 'Collier somptueux de Marie-Amélie'
, 'collier.png', ST_SetSRID(ST_MakePoint(2.3469, 48.8462), 4326), 16,'Louvre', 5, 'Quel était le mot de passe du système de vidéosurveillance du Louvre');

INSERT INTO objets (id, nom, type, indice, icon, geom)
VALUES 
(5, 'loupe', 'libere', 'Allez voir vers la tour Eiffel', 'loupe.png', ST_SetSRID(ST_MakePoint(2.3469, 48.8462), 4326));

INSERT INTO objets (id, nom, type, description,indice, icon, geom, zoom_min, code)
VALUES
(6, 'parchemin', 'code', 'Parchemin ancien qui contient un code', 'Ca ressemble à un code postal', 'parchemin.png', ST_SetSRID(ST_MakePoint(2.2945, 48.8584), 4326), 17, '95380');

INSERT INTO objets (id, nom, type, description, icon, geom, zoom_min, code, objet_libere_id, question_code)
VALUES
(7, 'coffre_fort', 'bloque_code', 'Reste des bijoux volés', 
'coffre_fort.png', ST_SetSRID(ST_MakePoint(2.505, 49.039), 4326),14, '95380', 8, 'Quel est le code postal de ville dans laquelle vous êtes ?');

INSERT INTO objets (id, nom, type, indice, icon, geom)
VALUES
(8, 'reste_bijoux', 'libere', 'Vous avez retrouvé tous les bijoux volés', 'reste_bijoux.png', ST_SetSRID(ST_MakePoint(2.505, 49.039), 4326));

 CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    date_jeu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scores_score ON scores(score DESC);