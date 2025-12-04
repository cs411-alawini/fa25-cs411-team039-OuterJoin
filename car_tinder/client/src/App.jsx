import { useEffect, useState } from "react";
import CarService from "./service/carService.js";
import UsernameInput from "./components/login/UsernameInput.jsx";
import LoginService from "./service/loginService.js";


export default function App() {
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(0);
  const [cars, setCars] = useState([]);
  const [status, setStatus] = useState("");
  const [makeFilter, setMakeFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  async function fetchCars(filters = {}) {
    try {
      setStatus("Loading cars...");
      const data = await CarService.fetchCars(filters);
      setCars(data);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load cars");
      setCars([]);
    }
  }

  useEffect(() => {
    fetchCars();
  }, []);

  function onSearch(e) {
    e.preventDefault();
    fetchCars({
      make: makeFilter.trim(),
      model: modelFilter.trim(),
      year: yearFilter.trim(),
    });
  }

  async function like(listing_id) {
    try {
      setStatus("Liking...");
      await CarService.likeCar({ user_id: userId, listing_id });
      setStatus("Saved LIKE ✅");
    } catch (err) {
      console.error(err);
      setStatus("Failed to save swipe");
    }
  }

if (!username) {
  return (
    <UsernameInput
      onSubmit={async ({ username, password }) => {
        try {
          const userId = await LoginService.login(username, password);
          setUsername(username);
          setUserId(userId);
        } catch (err) {
          alert("Invalid username or password");
        }
      }}
    />
  );
}



  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Car Tinder</h1>
      <p style={{ opacity: 0.7 }}>Welcome, {username}!. UserID: {userId}</p>

      {/* Search form */}
      <form
        onSubmit={onSearch}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "0.5rem",
          marginBottom: "1rem",
          alignItems: "center",
        }}
      >
        <input
          placeholder="Make (e.g. Ford)"
          value={makeFilter}
          onChange={(e) => setMakeFilter(e.target.value)}
        />
        <input
          placeholder="Model (e.g. Mustang)"
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
        />
        <input
          placeholder="Year (e.g. 2020)"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {status && (
        <p>
          <em>{status}</em>
        </p>
      )}

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          display: "grid",
          gap: "1rem",
        }}
      >
        {cars.map((car) => (
          <li
            key={car.listing_id ?? car.car_id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: "1rem",
              display: "grid",
              gridTemplateColumns: "160px 1fr",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <img
              src={car.image_url || "https://placehold.co/320x200?text=Car"}
              alt={`${car.make} ${car.model}`}
              style={{
                width: 160,
                height: 100,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
            <div>
              <h3 style={{ margin: 0 }}>
                {car.year} {car.make} {car.model}
              </h3>
              <p style={{ margin: "0.25rem 0 0.75rem" }}>
                {car.price
                  ? `$${Number(car.price).toLocaleString()}`
                  : "Price N/A"}
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => like(car.listing_id)}>❤️ Like</button>
                <button onClick={() => alert("Pass (no-op)")}>👎 Pass</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {cars.length === 0 && !status && (
        <p>No cars found. Try different filters or seed some data in the DB.</p>
      )}
    </div>
  );
}
