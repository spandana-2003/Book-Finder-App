import React, { useState } from "react";
import "./styles.css";

export default function App() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function searchBooks() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setBooks([]);
    try {
      // Use Open Library Search API
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          q
        )}&limit=40`
      );
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setBooks(data.docs || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch results. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function coverUrl(doc) {
    if (doc.cover_i)
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
    if (doc.isbn && doc.isbn.length)
      return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`;
    return null;
  }

  return (
    <div className="app">
      <header>
        <h1>Book Finder</h1>
        <p className="subtitle">Search books using the Open Library API</p>
      </header>

      <div className="search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, or subject (e.g. harry potter)"
          onKeyDown={(e) => {
            if (e.key === "Enter") searchBooks();
          }}
        />
        <button onClick={searchBooks} disabled={!query.trim()}>
          Search
        </button>
      </div>

      <div className="meta">
        {loading && <div className="info">Loading...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && books.length > 0 && (
          <div className="info">Showing {books.length} results</div>
        )}
      </div>

      <main className="results">
        {books.map((b, idx) => (
          <article key={b.key || idx} className="card">
            <div className="cover">
              {coverUrl(b) ? (
                <img src={coverUrl(b)} alt={b.title} />
              ) : (
                <div className="nocover">No cover</div>
              )}
            </div>
            <div className="card-body">
              <h2>{b.title}</h2>
              <div className="small">
                Author: {b.author_name ? b.author_name.join(", ") : "N/A"}
              </div>
              <div className="small">
                First published: {b.first_publish_year || "N/A"}
              </div>
              <div className="small">
                Publisher:{" "}
                {b.publisher ? b.publisher.slice(0, 3).join(", ") : "N/A"}
              </div>
              {b.key && (
                <a
                  className="openlink"
                  href={`https://openlibrary.org${b.key}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Library page
                </a>
              )}
            </div>
          </article>
        ))}
      </main>

      <footer className="footer"></footer>
    </div>
  );
}
