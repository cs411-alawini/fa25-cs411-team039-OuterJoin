import { useEffect, useState } from "react";

// const API_BASE = "http://localhost:5174";
const API_BASE = import.meta.env.VITE_API_BASE;

export default function App() {
  const [cars, setCars] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/cars`)
      .then(r => r.json())
      .then(setCars)
      .catch(() => setStatus("Failed to load cars"));
  }, []);

  async function like(car_id) {
    setStatus("Liking...");
    try {
      const res = await fetch(`${API_BASE}/api/swipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, car_id, action: "LIKE" })
      });
      if (!res.ok) throw new Error("Bad response");
      setStatus("Saved LIKE ✅");
      // For demo, no state change needed; you could remove the card, etc.
    } catch (e) {
      setStatus("Failed to save swipe");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Car Tinder</h1>
      <p style={{ opacity: 0.7 }}>End-to-end demo: retrieval + optional create</p>
      {status && <p><em>{status}</em></p>}
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
        {cars.map(car => (
          <li key={car.car_id} style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: "1rem",
            display: "grid",
            gridTemplateColumns: "160px 1fr",
            gap: "1rem",
            alignItems: "center"
          }}>
            <img
              src={car.image_url || "https://placehold.co/320x200?text=Car"}
              alt={`${car.make} ${car.model}`}
              style={{ width: 160, height: 100, objectFit: "cover", borderRadius: 8 }}
            />
            <div>
              <h3 style={{ margin: 0 }}>
                {car.year} {car.make} {car.model}
              </h3>
              <p style={{ margin: "0.25rem 0 0.75rem" }}>
                {car.price ? `$${Number(car.price).toLocaleString()}` : "Price N/A"}
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => like(car.car_id)}>❤️ Like</button>
                <button onClick={() => alert("Pass (no-op)")}>👎 Pass</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {cars.length === 0 && <p>No cars yet—seed some data in the DB.</p>}
    </div>
  );
}
