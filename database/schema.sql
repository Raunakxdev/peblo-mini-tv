peblo-tv/database/schema.sql
-- =========================
-- PEBLO TV DATABASE
-- =========================

-- Shows
CREATE TABLE shows (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    language VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seasons
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    title VARCHAR(150)
);

-- Episodes
CREATE TABLE episodes (
    id SERIAL PRIMARY KEY,
    season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    duration INTEGER,
    language VARCHAR(50),

    poster_url TEXT,
    banner_url TEXT,
    thumbnail_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);