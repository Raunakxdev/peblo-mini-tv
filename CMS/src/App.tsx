import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000";

type Show = {
  id: number;
  title: string;
  description?: string;
  category: string;
  language: string;
  status: string;
  featured?: boolean;
};

type Season = {
  id: number;
  season_number: number;
  title?: string;
};

type Episode = {
  id: number;
  episode_number: number;
  title: string;
  description?: string;
  duration?: number;
  language?: string;
  poster_url?: string;
  banner_url?: string;
  thumbnail_url?: string;
};

function App() {
  const [page, setPage] = useState("Dashboard");
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);

  const [showForm, setShowForm] = useState({
    title: "",
    description: "",
    category: "",
    language: "Hindi",
    status: "Draft",
  });

  const loadShows = async () => {
    try {
      const res = await fetch(`${API}/shows`);

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setShows(data);
    } catch (error) {
      console.error(error);
      alert("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShows();
  }, []);

  const openAddShow = () => {
    setEditingShow(null);

    setShowForm({
      title: "",
      description: "",
      category: "",
      language: "Hindi",
      status: "Draft",
    });

    setShowModal(true);
  };

  const openEditShow = (show: Show) => {
    setEditingShow(show);

    setShowForm({
      title: show.title,
      description: show.description || "",
      category: show.category || "",
      language: show.language || "Hindi",
      status:
        show.status.toLowerCase() === "published"
          ? "Published"
          : "Draft",
    });

    setShowModal(true);
  };

  const saveShow = async () => {
    if (!showForm.title.trim()) {
      alert("Please enter show title");
      return;
    }

    try {
      const url = editingShow
        ? `${API}/shows/${editingShow.id}`
        : `${API}/shows`;

      const method = editingShow ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: showForm.title,
          description: showForm.description,
          category: showForm.category,
          language: showForm.language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || data.message || "Failed");
        return;
      }

      const showId = editingShow
        ? editingShow.id
        : data.id;

      await fetch(
        `${API}/shows/${showId}/${
          showForm.status === "Published"
            ? "publish"
            : "unpublish"
        }`,
        {
          method: "PATCH",
        }
      );

      setShowModal(false);
      setEditingShow(null);

      await loadShows();

      alert(
        editingShow
          ? "Show updated successfully!"
          : "Show added successfully!"
      );
    } catch (error) {
      console.error(error);
      alert("Backend connection failed");
    }
  };

  const deleteShow = async (id: number) => {
    if (!window.confirm("Delete this show?")) return;

    try {
      const response = await fetch(`${API}/shows/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Delete failed");
        return;
      }

      await loadShows();
      alert("Show deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Backend connection failed");
    }
  };

  const togglePublish = async (show: Show) => {
    const isPublished =
      show.status.toLowerCase() === "published";

    try {
      await fetch(
        `${API}/shows/${show.id}/${
          isPublished ? "unpublish" : "publish"
        }`,
        {
          method: "PATCH",
        }
      );

      await loadShows();
    } catch (error) {
      console.error(error);
      alert("Failed to change status");
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span>▶</span> PEBLO
        </div>

        <p className="label">CONTENT</p>

        <button
          className={
            page === "Dashboard" ? "nav active" : "nav"
          }
          onClick={() => setPage("Dashboard")}
        >
          <span>⌂</span> Dashboard
        </button>

        <button
          className={
            page === "Shows" ? "nav active" : "nav"
          }
          onClick={() => setPage("Shows")}
        >
          <span>▣</span> Shows
        </button>

        <button
          className={
            page === "Seasons" ? "nav active" : "nav"
          }
          onClick={() => setPage("Seasons")}
        >
          <span>▤</span> Seasons
        </button>

        <button
          className={
            page === "Episodes" ? "nav active" : "nav"
          }
          onClick={() => setPage("Episodes")}
        >
          <span>▶</span> Episodes
        </button>

        <p className="label system">SYSTEM</p>

        <button className="nav">
          <span>⚙</span> Settings
        </button>

        <div className="admin">
          <div className="avatar">R</div>

          <div>
            <b>Admin</b>
            <small>Administrator</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h1>{page}</h1>
            <p>Manage your Peblo TV content</p>
          </div>

          <div className="header-right">
            <button className="icon-btn">
              🔔
            </button>

            <div className="profile">R</div>
          </div>
        </header>

        {page === "Dashboard" && (
          <Dashboard
            shows={shows}
            loading={loading}
            setPage={setPage}
            openAdd={openAddShow}
            openEdit={openEditShow}
            deleteShow={deleteShow}
          />
        )}

        {page === "Shows" && (
          <ShowsPage
            shows={shows}
            loading={loading}
            openAdd={openAddShow}
            openEdit={openEditShow}
            deleteShow={deleteShow}
            togglePublish={togglePublish}
            reload={loadShows}
          />
        )}

        {page === "Seasons" && (
          <SeasonsPage shows={shows} />
        )}

        {page === "Episodes" && (
          <EpisodesPage shows={shows} />
        )}
      </main>

      {showModal && (
        <Modal
          title={
            editingShow
              ? "Edit Show"
              : "Add New Show"
          }
          close={() => setShowModal(false)}
        >
          <label>Title *</label>

          <input
            value={showForm.title}
            placeholder="Enter show title"
            onChange={(e) =>
              setShowForm({
                ...showForm,
                title: e.target.value,
              })
            }
          />

          <label>Description</label>

          <textarea
            value={showForm.description}
            placeholder="Enter description"
            onChange={(e) =>
              setShowForm({
                ...showForm,
                description: e.target.value,
              })
            }
          />

          <label>Category</label>

          <input
            value={showForm.category}
            placeholder="Comedy / Drama / Action"
            onChange={(e) =>
              setShowForm({
                ...showForm,
                category: e.target.value,
              })
            }
          />

          <label>Language</label>

          <select
            value={showForm.language}
            onChange={(e) =>
              setShowForm({
                ...showForm,
                language: e.target.value,
              })
            }
          >
            <option>Hindi</option>
            <option>English</option>
            <option>Bengali</option>
            <option>Tamil</option>
            <option>Telugu</option>
          </select>

          <label>Status</label>

          <select
            value={showForm.status}
            onChange={(e) =>
              setShowForm({
                ...showForm,
                status: e.target.value,
              })
            }
          >
            <option>Draft</option>
            <option>Published</option>
          </select>

          <div className="modal-actions">
            <button
              className="cancel"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>

            <button
              className="save"
              onClick={saveShow}
            >
              {editingShow
                ? "Update Show"
                : "Save Show"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}


/* =========================
   DASHBOARD
========================= */

function Dashboard({
  shows,
  loading,
  setPage,
  openAdd,
  openEdit,
  deleteShow,
}: {
  shows: Show[];
  loading: boolean;
  setPage: (page: string) => void;
  openAdd: () => void;
  openEdit: (show: Show) => void;
  deleteShow: (id: number) => void;
}) {
  const published = shows.filter(
    (show) =>
      show.status.toLowerCase() === "published"
  ).length;

  const featured = shows.filter(
    (show) => show.featured
  ).length;

  return (
    <>
      <section className="welcome">
        <div>
          <h2>Welcome back, Admin 👋</h2>

          <p>
            Manage your shows, seasons and episodes
            from one place.
          </p>
        </div>

        <button
          className="primary"
          onClick={openAdd}
        >
          + Add Show
        </button>
      </section>

      <section className="stats">
        <Stat
          title="Total Shows"
          value={String(shows.length)}
          icon="▣"
        />

        <Stat
          title="Published"
          value={String(published)}
          icon="✓"
        />

        <Stat
          title="Featured"
          value={String(featured)}
          icon="★"
        />

        <Stat
          title="Episodes"
          value="—"
          icon="▶"
        />
      </section>

      <div className="section-heading">
        <div>
          <h2>Recent Shows</h2>
          <p>Your latest content</p>
        </div>

        <button
          className="view"
          onClick={() => setPage("Shows")}
        >
          View all →
        </button>
      </div>

      {loading ? (
        <div className="empty">
          <h2>Loading...</h2>
        </div>
      ) : (
        <ShowTable
          shows={shows.slice(0, 5)}
          openEdit={openEdit}
          deleteShow={deleteShow}
        />
      )}
    </>
  );
}


/* =========================
   SHOWS
========================= */

function ShowsPage({
  shows,
  loading,
  openAdd,
  openEdit,
  deleteShow,
  togglePublish,
  reload,
}: {
  shows: Show[];
  loading: boolean;
  openAdd: () => void;
  openEdit: (show: Show) => void;
  deleteShow: (id: number) => void;
  togglePublish: (show: Show) => void;
  reload: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(
    "All Status"
  );

  const filteredShows = shows.filter((show) => {
    const query = search.toLowerCase();

    const matchesSearch =
      show.title
        .toLowerCase()
        .includes(query) ||
      show.category
        ?.toLowerCase()
        .includes(query) ||
      show.language
        ?.toLowerCase()
        .includes(query);

    const status =
      show.status.toLowerCase() === "published"
        ? "Published"
        : "Draft";

    const matchesStatus =
      filter === "All Status" ||
      filter === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>All Shows</h2>
          <p>
            Manage your TV shows and featured
            content.
          </p>
        </div>

        <button
          className="primary"
          onClick={openAdd}
        >
          + Add Show
        </button>
      </div>

      <div className="table-card">
        <div className="table-tools">
          <input
            type="text"
            placeholder="Search shows..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
          >
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>

          <button
            className="refresh"
            onClick={reload}
          >
            ↻
          </button>
        </div>

        {loading ? (
          <div className="empty">
            <h2>Loading...</h2>
          </div>
        ) : (
          <ShowTable
            shows={filteredShows}
            openEdit={openEdit}
            deleteShow={deleteShow}
            togglePublish={togglePublish}
          />
        )}
      </div>
    </>
  );
}


function ShowTable({
  shows,
  openEdit,
  deleteShow,
  togglePublish,
}: {
  shows: Show[];
  openEdit: (show: Show) => void;
  deleteShow: (id: number) => void;
  togglePublish?: (show: Show) => void;
}) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th>SHOW</th>
            <th>CATEGORY</th>
            <th>LANGUAGE</th>
            <th>STATUS</th>
            <th>FEATURED</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {shows.map((show) => {
            const published =
              show.status.toLowerCase() ===
              "published";

            return (
              <tr key={show.id}>
                <td>
                  <div className="show">
                    <div className="poster">
                      {show.title?.[0] || "P"}
                    </div>

                    <div>
                      <b>{show.title}</b>
                      <small>
                        ID #{show.id}
                      </small>
                    </div>
                  </div>
                </td>

                <td>
                  {show.category || "-"}
                </td>

                <td>
                  {show.language || "-"}
                </td>

                <td>
                  <span
                    className={
                      published
                        ? "status published"
                        : "status draft"
                    }
                  >
                    ●{" "}
                    {published
                      ? "Published"
                      : "Draft"}
                  </span>
                </td>

                <td>
                  <span
                    className={
                      show.featured
                        ? "star selected"
                        : "star"
                    }
                  >
                    ★
                  </span>
                </td>

                <td>
                  <div className="actions">
                    <button
                      title="Edit"
                      onClick={() =>
                        openEdit(show)
                      }
                    >
                      ✎
                    </button>

                    {togglePublish && (
                      <button
                        title={
                          published
                            ? "Unpublish"
                            : "Publish"
                        }
                        onClick={() =>
                          togglePublish(show)
                        }
                      >
                        {published ? "↙" : "↗"}
                      </button>
                    )}

                    <button
                      title="Delete"
                      onClick={() =>
                        deleteShow(show.id)
                      }
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {shows.length === 0 && (
            <tr>
              <td colSpan={6}>
                <div className="empty">
                  <h2>No shows found</h2>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


/* =========================
   SEASONS
========================= */

function SeasonsPage({
  shows,
}: {
  shows: Show[];
}) {
  const [selectedShow, setSelectedShow] =
    useState<number | "">("");

  const [seasons, setSeasons] =
    useState<Season[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [modal, setModal] =
    useState(false);

  const [editing, setEditing] =
    useState<Season | null>(null);

  const [form, setForm] = useState({
    season_number: "",
    title: "",
  });

  const loadSeasons = async () => {
    if (!selectedShow) {
      setSeasons([]);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API}/shows/${selectedShow}/seasons`
      );

      const data = await res.json();

      setSeasons(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load seasons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, [selectedShow]);

  const openAdd = () => {
    setEditing(null);

    setForm({
      season_number: String(
        seasons.length + 1
      ),
      title: "",
    });

    setModal(true);
  };

  const openEdit = (season: Season) => {
    setEditing(season);

    setForm({
      season_number: String(
        season.season_number
      ),
      title: season.title || "",
    });

    setModal(true);
  };

  const saveSeason = async () => {
    if (!selectedShow) {
      alert("Select a show first");
      return;
    }

    if (!form.season_number) {
      alert("Season number is required");
      return;
    }

    try {
      const url = editing
        ? `${API}/seasons/${editing.id}`
        : `${API}/shows/${selectedShow}/seasons`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          season_number:
            Number(form.season_number),
          title: form.title,
        }),
      });

      if (!response.ok) {
        alert("Failed to save season");
        return;
      }

      setModal(false);
      await loadSeasons();

      alert(
        editing
          ? "Season updated!"
          : "Season added!"
      );
    } catch (error) {
      console.error(error);
      alert("Backend connection failed");
    }
  };

  const deleteSeason = async (id: number) => {
    if (!window.confirm("Delete this season?"))
      return;

    try {
      await fetch(`${API}/seasons/${id}`, {
        method: "DELETE",
      });

      await loadSeasons();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Seasons Management</h2>
          <p>
            Manage seasons for your TV shows.
          </p>
        </div>

        <button
          className="primary"
          onClick={openAdd}
          disabled={!selectedShow}
        >
          + Add Season
        </button>
      </div>

      <div className="table-card">
        <div className="table-tools">
          <select
            value={selectedShow}
            onChange={(e) =>
              setSelectedShow(
                e.target.value
                  ? Number(e.target.value)
                  : ""
              )
            }
          >
            <option value="">
              Select Show
            </option>

            {shows.map((show) => (
              <option
                key={show.id}
                value={show.id}
              >
                {show.title}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="empty">
            <h2>Loading...</h2>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>SEASON</th>
                <th>TITLE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {seasons.map((season) => (
                <tr key={season.id}>
                  <td>
                    Season{" "}
                    {season.season_number}
                  </td>

                  <td>
                    {season.title || "-"}
                  </td>

                  <td>
                    <div className="actions">
                      <button
                        onClick={() =>
                          openEdit(season)
                        }
                      >
                        ✎
                      </button>

                      <button
                        onClick={() =>
                          deleteSeason(
                            season.id
                          )
                        }
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {selectedShow &&
                seasons.length === 0 && (
                  <tr>
                    <td colSpan={3}>
                      <div className="empty">
                        <h2>
                          No seasons found
                        </h2>
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal
          title={
            editing
              ? "Edit Season"
              : "Add Season"
          }
          close={() => setModal(false)}
        >
          <label>Season Number *</label>

          <input
            type="number"
            value={form.season_number}
            onChange={(e) =>
              setForm({
                ...form,
                season_number:
                  e.target.value,
              })
            }
          />

          <label>Season Title</label>

          <input
            value={form.title}
            placeholder="e.g. Season One"
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />

          <div className="modal-actions">
            <button
              className="cancel"
              onClick={() =>
                setModal(false)
              }
            >
              Cancel
            </button>

            <button
              className="save"
              onClick={saveSeason}
            >
              Save Season
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}


/* =========================
   EPISODES
========================= */

function EpisodesPage({
  shows,
}: {
  shows: Show[];
}) {
  const [selectedShow, setSelectedShow] =
    useState<number | "">("");

  const [seasons, setSeasons] =
    useState<Season[]>([]);

  const [selectedSeason, setSelectedSeason] =
    useState<number | "">("");

  const [episodes, setEpisodes] =
    useState<Episode[]>([]);

  const [modal, setModal] =
    useState(false);

  const [editing, setEditing] =
    useState<Episode | null>(null);

  const [form, setForm] = useState({
    episode_number: "",
    title: "",
    description: "",
    duration: "",
    language: "Hindi",
    poster_url: "",
    banner_url: "",
    thumbnail_url: "",
  });

  useEffect(() => {
    if (!selectedShow) {
      setSeasons([]);
      setSelectedSeason("");
      return;
    }

    fetch(
      `${API}/shows/${selectedShow}/seasons`
    )
      .then((res) => res.json())
      .then((data) => {
        setSeasons(data);

        if (data.length > 0) {
          setSelectedSeason(data[0].id);
        } else {
          setSelectedSeason("");
        }
      })
      .catch((error) =>
        console.error(error)
      );
  }, [selectedShow]);

  const loadEpisodes = async () => {
    if (!selectedSeason) {
      setEpisodes([]);
      return;
    }

    try {
      const res = await fetch(
        `${API}/seasons/${selectedSeason}/episodes`
      );

      const data = await res.json();

      setEpisodes(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load episodes");
    }
  };

  useEffect(() => {
    loadEpisodes();
  }, [selectedSeason]);

  const openAdd = () => {
    setEditing(null);

    setForm({
      episode_number: String(
        episodes.length + 1
      ),
      title: "",
      description: "",
      duration: "",
      language: "Hindi",
      poster_url: "",
      banner_url: "",
      thumbnail_url: "",
    });

    setModal(true);
  };

  const openEdit = (episode: Episode) => {
    setEditing(episode);

    setForm({
      episode_number: String(
        episode.episode_number
      ),
      title: episode.title || "",
      description:
        episode.description || "",
      duration:
        episode.duration != null
          ? String(episode.duration)
          : "",
      language:
        episode.language || "Hindi",
      poster_url:
        episode.poster_url || "",
      banner_url:
        episode.banner_url || "",
      thumbnail_url:
        episode.thumbnail_url || "",
    });

    setModal(true);
  };

  const saveEpisode = async () => {
    if (!selectedSeason) {
      alert("Select a season first");
      return;
    }

    if (
      !form.episode_number ||
      !form.title.trim()
    ) {
      alert(
        "Episode number and title are required"
      );
      return;
    }

    try {
      const url = editing
        ? `${API}/episodes/${editing.id}`
        : `${API}/seasons/${selectedSeason}/episodes`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          episode_number:
            Number(form.episode_number),

          title: form.title,

          description:
            form.description,

          duration: form.duration
            ? Number(form.duration)
            : null,

          language:
            form.language,

          poster_url:
            form.poster_url || null,

          banner_url:
            form.banner_url || null,

          thumbnail_url:
            form.thumbnail_url || null,
        }),
      });

      if (!response.ok) {
        alert("Failed to save episode");
        return;
      }

      setModal(false);

      await loadEpisodes();

      alert(
        editing
          ? "Episode updated!"
          : "Episode added!"
      );
    } catch (error) {
      console.error(error);
      alert("Backend connection failed");
    }
  };

  const deleteEpisode = async (
    id: number
  ) => {
    if (
      !window.confirm(
        "Delete this episode?"
      )
    )
      return;

    try {
      await fetch(
        `${API}/episodes/${id}`,
        {
          method: "DELETE",
        }
      );

      await loadEpisodes();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Episodes Management</h2>

          <p>
            Manage episodes inside each season.
          </p>
        </div>

        <button
          className="primary"
          onClick={openAdd}
          disabled={!selectedSeason}
        >
          + Add Episode
        </button>
      </div>

      <div className="table-card">
        <div className="table-tools">
          <select
            value={selectedShow}
            onChange={(e) =>
              setSelectedShow(
                e.target.value
                  ? Number(e.target.value)
                  : ""
              )
            }
          >
            <option value="">
              Select Show
            </option>

            {shows.map((show) => (
              <option
                key={show.id}
                value={show.id}
              >
                {show.title}
              </option>
            ))}
          </select>

          <select
            value={selectedSeason}
            onChange={(e) =>
              setSelectedSeason(
                e.target.value
                  ? Number(e.target.value)
                  : ""
              )
            }
            disabled={!selectedShow}
          >
            <option value="">
              Select Season
            </option>

            {seasons.map((season) => (
              <option
                key={season.id}
                value={season.id}
              >
                Season{" "}
                {season.season_number}
              </option>
            ))}
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>EPISODE</th>
              <th>TITLE</th>
              <th>DURATION</th>
              <th>LANGUAGE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {episodes.map((episode) => (
              <tr key={episode.id}>
                <td>
                  EP {episode.episode_number}
                </td>

                <td>
                  {episode.title}
                </td>

                <td>
                  {episode.duration
                    ? `${episode.duration} min`
                    : "-"}
                </td>

                <td>
                  {episode.language || "-"}
                </td>

                <td>
                  <div className="actions">
                    <button
                      onClick={() =>
                        openEdit(episode)
                      }
                    >
                      ✎
                    </button>

                    <button
                      onClick={() =>
                        deleteEpisode(
                          episode.id
                        )
                      }
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {selectedSeason &&
              episodes.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty">
                      <h2>
                        No episodes found
                      </h2>
                    </div>
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal
          title={
            editing
              ? "Edit Episode"
              : "Add Episode"
          }
          close={() => setModal(false)}
        >
          <label>Episode Number *</label>

          <input
            type="number"
            value={form.episode_number}
            onChange={(e) =>
              setForm({
                ...form,
                episode_number:
                  e.target.value,
              })
            }
          />

          <label>Title *</label>

          <input
            value={form.title}
            placeholder="Episode title"
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />

          <label>Description</label>

          <textarea
            value={form.description}
            placeholder="Episode description"
            onChange={(e) =>
              setForm({
                ...form,
                description:
                  e.target.value,
              })
            }
          />

          <label>Duration (minutes)</label>

          <input
            type="number"
            value={form.duration}
            placeholder="45"
            onChange={(e) =>
              setForm({
                ...form,
                duration:
                  e.target.value,
              })
            }
          />

          <label>Language</label>

          <select
            value={form.language}
            onChange={(e) =>
              setForm({
                ...form,
                language:
                  e.target.value,
              })
            }
          >
            <option>Hindi</option>
            <option>English</option>
            <option>Bengali</option>
            <option>Tamil</option>
            <option>Telugu</option>
          </select>

          <label>Poster URL</label>

          <input
            value={form.poster_url}
            placeholder="https://..."
            onChange={(e) =>
              setForm({
                ...form,
                poster_url:
                  e.target.value,
              })
            }
          />

          <label>Banner URL</label>

          <input
            value={form.banner_url}
            placeholder="https://..."
            onChange={(e) =>
              setForm({
                ...form,
                banner_url:
                  e.target.value,
              })
            }
          />

          <label>Thumbnail URL</label>

          <input
            value={form.thumbnail_url}
            placeholder="https://..."
            onChange={(e) =>
              setForm({
                ...form,
                thumbnail_url:
                  e.target.value,
              })
            }
          />

          <div className="modal-actions">
            <button
              className="cancel"
              onClick={() =>
                setModal(false)
              }
            >
              Cancel
            </button>

            <button
              className="save"
              onClick={saveEpisode}
            >
              Save Episode
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* =========================
   MODAL
========================= */

function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#111116",
          border: "1px solid #292930",
          borderRadius: 14,
          padding: 25,
          boxShadow:
            "0 20px 70px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "white",
              }}
            >
              {title}
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#777780",
                fontSize: 13,
              }}
            >
              Manage your Peblo TV content
            </p>
          </div>

          <button
            onClick={close}
            style={{
              background: "transparent",
              border: 0,
              color: "#aaa",
              fontSize: 25,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {children}
        </div>

        <style>
          {`
            .modal-actions {
              display: flex;
              justify-content: flex-end;
              gap: 10px;
              margin-top: 15px;
            }

            .modal-actions button {
              padding: 10px 18px;
              border-radius: 8px;
              cursor: pointer;
            }

            .cancel {
              background: #19191f;
              border: 1px solid #303039;
              color: #aaa;
            }

            .save {
              background: #e50914;
              border: 0;
              color: white;
              font-weight: 600;
            }

            [style*="max-width: 520px"] label {
              color: #aaa;
              font-size: 12px;
              margin-top: 5px;
            }

            [style*="max-width: 520px"] input,
            [style*="max-width: 520px"] textarea,
            [style*="max-width: 520px"] select {
              padding: 11px 12px;
              border: 1px solid #303039;
              border-radius: 8px;
              outline: none;
              background: #19191f;
              color: white;
              width: 100%;
            }

            [style*="max-width: 520px"] textarea {
              min-height: 80px;
              resize: vertical;
            }
          `}
        </style>
      </div>
    </div>
  );
}


/* =========================
   STAT
========================= */

function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="stat">
      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default App;