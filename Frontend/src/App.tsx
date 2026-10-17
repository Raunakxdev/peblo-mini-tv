
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";

type Show = {
  id?: number;
  title: string;
  info: string;
  description: string;
  image: string;
};

const API = "http://127.0.0.1:8000";

const defaultShows: Show[] = [
  {
    title: "Panchayat",
    info: "Comedy • Drama • Hindi",
    description:
      "An engineering graduate reluctantly becomes a secretary in a village panchayat office.",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "The Family Man",
    info: "Action • Thriller • Hindi",
    description:
      "A middle-class man secretly works as an intelligence officer while balancing his family life.",
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "Mirzapur",
    info: "Crime • Drama • Hindi",
    description:
      "Power, ambition and crime collide in the lawless world of Mirzapur.",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "Special Ops",
    info: "Action • Spy • Hindi",
    description:
      "An intelligence officer hunts down the mastermind behind a series of attacks.",
    image:
      "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1800&q=80",
  },
  {
    title: "Farzi",
    info: "Crime • Thriller • Hindi",
    description:
      "A brilliant artist enters the dangerous world of counterfeit money.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=80",
  },
];

const rows = [
  {
    title: "Trending Now",
    items: ["Panchayat", "Mirzapur", "Farzi", "Special Ops", "The Family Man"],
  },
  {
    title: "Popular on Peblo",
    items: ["The Family Man", "Panchayat", "Special Ops", "Mirzapur", "Farzi"],
  },
  {
    title: "Hindi Originals",
    items: ["Panchayat", "Farzi", "Mirzapur", "Special Ops", "The Family Man"],
  },
];

const sidebarIcons = [
  { icon: "⌕", label: "Search" },
  { icon: "⌂", label: "Home" },
  { icon: "👥", label: "Community" },
  { icon: "🔖", label: "Bookmarks" },
  { icon: "🖥", label: "Screen" },
  { icon: "🕘", label: "History" },
  { icon: "🛒", label: "Cart" },
];

function Home() {
  const [active, setActive] = useState(0);
  const [theme, setTheme] = useState("dark");
  const [activeIcon, setActiveIcon] = useState(1);
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [shows, setShows] = useState<Show[]>(defaultShows);

  // Fetch shows from the backend.
  useEffect(() => {
    const loadShows = async () => {
      try {
        const response = await fetch(`${API}/shows`);

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The /shows API did not return a list.");
        }

        const apiShows: Show[] = data.map((item: any) => {
          const fallback = defaultShows.find(
            (show) =>
              show.title.toLowerCase() ===
              String(item.title ?? "").toLowerCase()
          );

          return {
            id: item.id,
            title: item.title,
            info:
              [item.category, item.language]
                .filter(Boolean)
                .join(" • ") ||
              fallback?.info ||
              "Hindi",
            description:
              item.description ||
              fallback?.description ||
              "Discover this show on Peblo.",
            image: item.image || item.poster_url || fallback?.image ||
              defaultShows[0].image,
          };
        });

        // Keep the original five shows and add/update CMS shows.
        setShows((currentShows) => {
          const merged = [...currentShows];

          apiShows.forEach((apiShow) => {
            const index = merged.findIndex(
              (show) =>
                show.title.toLowerCase() ===
                apiShow.title.toLowerCase()
            );

            if (index !== -1) {
              merged[index] = apiShow;
            } else {
              merged.push(apiShow);
            }
          });

          return merged;
        });

        console.log("Shows received from CMS API:", apiShows);
      } catch (error) {
        console.error("Could not load shows from backend:", error);
      }
    };

    loadShows();
  }, []);

  // Keep the carousel index valid when the number of shows changes.
  useEffect(() => {
    if (active >= shows.length) {
      setActive(0);
    }
  }, [active, shows.length]);

  // Automatically change the hero show.
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % shows.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [shows.length]);

  const hero = shows[active] ?? shows[0];

  const goNext = () => {
    setActive((current) => (current + 1) % shows.length);
  };

  const goPrev = () => {
    setActive((current) => (current - 1 + shows.length) % shows.length);
  };

  const toggleCard = (id: string) => {
    setOpenCard((current) => (current === id ? null : id));
  };

  return (
    <div className="peblo" data-theme={theme}>
      <aside className="sidebar">
        <div className="side-logo">▶</div>

        {sidebarIcons.map((item, index) => (
          <button
            key={item.label}
            className={index === activeIcon ? "side-icon active" : "side-icon"}
            title={item.label}
            onClick={() => setActiveIcon(index)}
          >
            <span>{item.icon}</span>
          </button>
        ))}
      </aside>

      <header className="navbar">
        <div className="logo">
          <span>▶</span> PEBLO
        </div>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/shows">Shows</Link>
          <Link to="/movies">Movies</Link>
          <Link to="/categories">Categories</Link>
        </nav>

        <div className="nav-actions">
          <button className="icon-btn">⌕</button>
          <button className="icon-btn">♡</button>

          <button
            className={`theme-switch ${theme === "light" ? "is-light" : ""}`}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle day/night theme"
          >
            <span className="theme-switch-icon">
              {theme === "dark" ? "☾" : "☀"}
            </span>
          </button>

          <div className="user">R</div>
        </div>
      </header>

      <main>
        <section className="hero">
          {shows.map((show, index) => (
            <div
              key={show.title}
              className={`hero-bg ${index === active ? "hero-bg-active" : ""}`}
              style={{ backgroundImage: `url(${show.image})` }}
            />
          ))}

          <div className="hero-overlay" />

          <div className="hero-content" key={hero.title}>
            <p className="eyebrow">PEBLO ORIGINAL</p>
            <h1>{hero.title}</h1>
            <p className="hero-info">{hero.info}</p>
            <p className="description">{hero.description}</p>

            <div className="hero-buttons">
              <button className="watch">▶ Watch Now</button>
              <button className="more">＋ My List</button>
            </div>
          </div>

          <button
            className="hero-nav hero-prev"
            onClick={goPrev}
            aria-label="Previous"
          >
            <span className="chevron chevron-left" />
          </button>

          <button
            className="hero-nav hero-next"
            onClick={goNext}
            aria-label="Next"
          >
            <span className="chevron chevron-right" />
          </button>

          <div className="slider-dots">
            {shows.map((show, index) => (
              <button
                key={show.title}
                className={index === active ? "dot active-dot" : "dot"}
                onClick={() => setActive(index)}
                aria-label={`Show ${show.title}`}
              />
            ))}
          </div>
        </section>

        <section className="content">
          {rows.map((row) => {
            const allNames = [
              ...row.items,
              ...shows
                .map((show) => show.title)
                .filter((name) => !row.items.includes(name)),
            ];

            return (
              <div className="row" key={row.title}>
                <div className="row-heading">
                  <h2>{row.title}</h2>
                  <span>View all →</span>
                </div>

                <div className="cards">
                  {allNames.map((name, index) => {
                    const show = shows.find(
                      (item) => item.title === name
                    );

                    const cardId = `${row.title}-${name}`;
                    const isOpen = openCard === cardId;

                    return (
                      <article
                        className={`card ${isOpen ? "card-open" : ""}`}
                        key={cardId}
                        onMouseEnter={() => setOpenCard(cardId)}
                        onMouseLeave={() =>
                          setOpenCard((current) =>
                            current === cardId ? null : current
                          )
                        }
                        onClick={() => toggleCard(cardId)}
                      >
                        <img
                          src={
                            show?.image ||
                            shows[index % shows.length].image
                          }
                          alt={name}
                        />

                        <div className="card-overlay">
                          <h3>{name}</h3>
                          <p className="card-info">{show?.info}</p>

                          <p className="card-description">
                            {show?.description}
                          </p>

                          <div className="card-buttons">
                            <button className="card-watch">
                              ▶ Watch
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}

function Shows() {
  return <h1>Shows Page</h1>;
}

function Movies() {
  return <h1>Movies Page</h1>;
}

function Categories() {
  return <h1>Categories Page</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/categories" element={<Categories />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
