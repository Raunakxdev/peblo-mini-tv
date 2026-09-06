from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conn = psycopg2.connect(
    host="localhost",
    database="peblo_tv",
    user="postgres",
    password="Raunak763@"
)

@app.get("/")
def home():
    return {
        "message": "Peblo TV Backend is running!",
        "database": "Connected"
    }
@app.get("/shows")
def get_shows():
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, title, description, category, language, status
        FROM shows
        ORDER BY id;
    """)

    shows = cursor.fetchall()

    cursor.close()

    return [
        {
            "id": show[0],
            "title": show[1],
            "description": show[2],
            "category": show[3],
            "language": show[4],
            "status": show[5]
        }
        for show in shows
    ]
@app.post("/shows")
def create_show(show: dict):
    title = show.get("title", "").strip()

    if not title:
        return {
            "error": "Title is required"
        }

    if len(title) > 150:
        return {
            "error": "Title must be 150 characters or less"
        }

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO shows (title, description, category, language)
        VALUES (%s, %s, %s, %s)
        RETURNING id;
        """,
        (
            title,
            show.get("description"),
            show.get("category"),
            show.get("language")
        )
    )

    show_id = cursor.fetchone()[0]

    conn.commit()
    cursor.close()

    return {
        "message": "Show created successfully",
        "id": show_id
    }
@app.put("/shows/{show_id}")
def update_show(show_id: int, show: dict):
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE shows
        SET title = %s,
            description = %s,
            category = %s,
            language = %s
        WHERE id = %s
        RETURNING id;
        """,
        (
            show["title"],
            show.get("description"),
            show.get("category"),
            show.get("language"),
            show_id
        )
    )

    updated = cursor.fetchone()

    if updated is None:
        cursor.close()
        return {"message": "Show not found"}

    conn.commit()
    cursor.close()

    return {
        "message": "Show updated successfully",
        "id": updated[0]
    }


@app.delete("/shows/{show_id}")
def delete_show(show_id: int):
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM shows
        WHERE id = %s
        RETURNING id;
        """,
        (show_id,)
    )

    deleted = cursor.fetchone()

    if deleted is None:
        cursor.close()
        return {"message": "Show not found"}

    conn.commit()
    cursor.close()

    return {
        "message": "Show deleted successfully",
        "id": deleted[0]
    }

# =========================
# SEASONS
# =========================

@app.get("/shows/{show_id}/seasons")
def get_seasons(show_id: int):
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, season_number, title
        FROM seasons
        WHERE show_id = %s
        ORDER BY season_number;
        """,
        (show_id,)
    )

    seasons = cursor.fetchall()
    cursor.close()

    return [
        {
            "id": s[0],
            "season_number": s[1],
            "title": s[2]
        }
        for s in seasons
    ]


@app.post("/shows/{show_id}/seasons")
def create_season(show_id: int, season: dict):
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO seasons (show_id, season_number, title)
        VALUES (%s, %s, %s)
        RETURNING id;
        """,
        (
            show_id,
            season["season_number"],
            season.get("title")
        )
    )

    season_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()

    return {
        "message": "Season created successfully",
        "id": season_id
    }


@app.put("/seasons/{season_id}")
def update_season(season_id: int, season: dict):
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE seasons
        SET season_number = %s,
            title = %s
        WHERE id = %s
        RETURNING id;
        """,
        (
            season["season_number"],
            season.get("title"),
            season_id
        )
    )

    updated = cursor.fetchone()

    if updated is None:
        cursor.close()
        return {"message": "Season not found"}

    conn.commit()
    cursor.close()

    return {
        "message": "Season updated successfully",
        "id": updated[0]
    }


@app.delete("/seasons/{season_id}")
def delete_season(season_id: int):
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM seasons
        WHERE id = %s
        RETURNING id;
        """,
        (season_id,)
    )

    deleted = cursor.fetchone()

    if deleted is None:
        cursor.close()
        return {"message": "Season not found"}

    conn.commit()
    cursor.close()

    return {
        "message": "Season deleted successfully",
        "id": deleted[0]
    }


# =========================
# EPISODES
# =========================

@app.get("/seasons/{season_id}/episodes")
def get_episodes(season_id: int):
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, episode_number, title, description,
               duration, language, poster_url,
               banner_url, thumbnail_url
        FROM episodes
        WHERE season_id = %s
        ORDER BY episode_number;
        """,
        (season_id,)
    )

    episodes = cursor.fetchall()
    cursor.close()

    return [
        {
            "id": e[0],
            "episode_number": e[1],
            "title": e[2],
            "description": e[3],
            "duration": e[4],
            "language": e[5],
            "poster_url": e[6],
            "banner_url": e[7],
            "thumbnail_url": e[8]
        }
        for e in episodes
    ]


@app.post("/seasons/{season_id}/episodes")
def create_episode(season_id: int, episode: dict):
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO episodes
        (season_id, episode_number, title, description,
         duration, language, poster_url, banner_url, thumbnail_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
        """,
        (
            season_id,
            episode["episode_number"],
            episode["title"],
            episode.get("description"),
            episode.get("duration"),
            episode.get("language"),
            episode.get("poster_url"),
            episode.get("banner_url"),
            episode.get("thumbnail_url")
        )
    )

    episode_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()

    return {
        "message": "Episode created successfully",
        "id": episode_id
    }


@app.put("/episodes/{episode_id}")
def update_episode(episode_id: int, episode: dict):
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE episodes
        SET episode_number = %s,
            title = %s,
            description = %s,
            duration = %s,
            language = %s,
            poster_url = %s,
            banner_url = %s,
            thumbnail_url = %s
        WHERE id = %s
        RETURNING id;
        """,
        (
            episode["episode_number"],
            episode["title"],
            episode.get("description"),
            episode.get("duration"),
            episode.get("language"),
            episode.get("poster_url"),
            episode.get("banner_url"),
            episode.get("thumbnail_url"),
            episode_id
        )
    )

    updated = cursor.fetchone()

    if updated is None:
        cursor.close()
        return {"message": "Episode not found"}

    conn.commit()
    cursor.close()

    return {
        "message": "Episode updated successfully",
        "id": updated[0]
    }


@app.delete("/episodes/{episode_id}")
def delete_episode(episode_id: int):
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM episodes
        WHERE id = %s
        RETURNING id;
        """,
        (episode_id,)
    )

    deleted = cursor.fetchone()

    if deleted is None:
        cursor.close()
        return {"message": "Episode not found"}

    conn.commit()
    cursor.close()

    return {
        "message": "Episode deleted successfully",
        "id": deleted[0]
    }


#searching And validation
#Publish and unPublish

@app.patch("/shows/{show_id}/publish")
def publish_show(show_id: int):
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE shows
        SET status = 'published'
        WHERE id = %s
        RETURNING id;
        """,
        (show_id,)
    )

    updated = cursor.fetchone()

    if updated is None:
        cursor.close()
        return {"message": "Show not found"}

    conn.commit()
    cursor.close()

    return {
        "message": "Show published successfully",
        "id": updated[0]
    }


@app.patch("/shows/{show_id}/unpublish")
def unpublish_show(show_id: int):
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE shows
        SET status = 'draft'
        WHERE id = %s
        RETURNING id;
        """,
        (show_id,)
    )

    updated = cursor.fetchone()

    if updated is None:
        cursor.close()
        return {"message": "Show not found"}

    conn.commit()
    cursor.close()

    return {
        "message": "Show unpublished successfully",
        "id": updated[0]
    }

#Search API
@app.get("/search")
def search_shows(q: str):
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, title, description, category, language, status
        FROM shows
        WHERE title ILIKE %s
           OR description ILIKE %s
           OR category ILIKE %s
        ORDER BY id;
        """,
        (f"%{q}%", f"%{q}%", f"%{q}%")
    )

    shows = cursor.fetchall()
    cursor.close()

    return [
        {
            "id": show[0],
            "title": show[1],
            "description": show[2],
            "category": show[3],
            "language": show[4],
            "status": show[5]
        }
        for show in shows
    ]