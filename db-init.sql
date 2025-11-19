CREATE EXTENSION IF NOT EXISTS postgis;

-- Création de la table objets
CREATE TABLE IF NOT EXISTS objets (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('recuperable', 'bloque_objet')),
    description TEXT,
    indice TEXT,
    bloquant_id INT,
    icon TEXT,
    visible BOOLEAN DEFAULT TRUE,
    geom GEOMETRY(Point, 4326),
    zoom_min INT DEFAULT 13,
    code CHAR(4)
);

-- Insertion du marteau (dans les jardins des Tuileries)
INSERT INTO objets (nom, type, description, icon, visible, geom, code)
VALUES 
('Marteau', 'recuperable', 'Un marteau ancien, utile pour ouvrir certains objets.', 
 'marteau.png', TRUE, ST_SetSRID(ST_MakePoint(2.327, 48.863), 4326), '1234');

-- Insertion de la couronne (bloquée par le marteau)
INSERT INTO objets (nom, type, description, indice, icon, visible, geom)
VALUES
('La couronne de l’impératrice Eugénie', 'bloque_objet', 
 'Une couronne impériale protégée par un objet clé.', 
 'Il semble qu’il faille un marteau pour l''ouvrir...', 
 'couronne.png', TRUE, ST_SetSRID(ST_MakePoint(2.336, 48.860), 4326));

-- Mise à jour de la relation bloquant_id
UPDATE objets
SET bloquant_id = (SELECT id FROM objets WHERE nom = 'Marteau')
WHERE nom = 'La couronne de l’impératrice Eugénie';