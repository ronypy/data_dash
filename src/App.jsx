import React, { useEffect, useState } from "react";
import "./app.css";

const API_URL = "https://collection.cooperhewitt.org/rest/";
const ACCESS_TOKEN = "d5ab59ded3e2ed1e68adff6355f839c3"; // <- REPLACE THIS with your actual token

export default function App() {
  const [objects, setObjects] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const url = `${API_URL}?method=cooperhewitt.objects.getList&access_token=${ACCESS_TOKEN}&page=1&per_page=100`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.objects) {
          setObjects(data.objects);
        } else {
          setError("No data found.");
        }
      } catch (err) {
        setError("Failed to fetch data.");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Gather unique types for the filter dropdown
  const types = [
    "All",
    ...Array.from(
      new Set(
        objects
          .map((obj) => obj.type_name)
          .filter((t) => !!t && t.trim() !== "")
      )
    ),
  ];

  // Filter + search logic
  const filteredObjects = objects.filter((obj) => {
    const matchesSearch =
      obj.title && obj.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = type === "All" || obj.type_name === type;
    return matchesSearch && matchesType;
  });

  // --- Summary statistics ---
  const totalLoaded = objects.length;
  const uniqueArtists = new Set(objects.map((o) => o.artist)).size;
  const years = objects
    .map((o) => (o.date_display || "").match(/\d{4}/g))
    .filter(Boolean)
    .flat()
    .map(Number);
  const earliestYear = years.length ? Math.min(...years) : "—";
  const latestYear = years.length ? Math.max(...years) : "—";

  return (
    <div className="container">
      <h1 className="dashboard-title">🖼️ Cooper Hewitt Objects Dashboard</h1>

      {/* Summary stats */}
      <div className="summary">
        <div className="stat">
          <div className="stat-value">{totalLoaded}</div>
          <div className="stat-label">Objects Loaded</div>
        </div>
        <div className="stat">
          <div className="stat-value">{uniqueArtists}</div>
          <div className="stat-label">Unique Artists</div>
        </div>
        <div className="stat">
          <div className="stat-value">
            {earliestYear} - {latestYear}
          </div>
          <div className="stat-label">Date Range</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="type-select"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <table className="objects-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Artist</th>
                <th>Date</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredObjects.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-results">
                    No objects found.
                  </td>
                </tr>
              ) : (
                filteredObjects.slice(0, 30).map((obj) => (
                  <tr key={obj.id}>
                    <td>{obj.title || "—"}</td>
                    <td>{obj.artist || "—"}</td>
                    <td>{obj.date_display || "—"}</td>
                    <td>{obj.type_name || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="count-note">
            Showing {filteredObjects.length} results
            {filteredObjects.length > 30 && " (showing first 30)"}
          </div>
        </>
      )}
    </div>
  );
}
