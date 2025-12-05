import { useEffect, useState } from "react";
import CarService from "./service/carService.js";
import UsernameInput from "./components/login/UsernameInput.jsx";
import LoginService from "./service/loginService.js";

import SwipeDeck from "./components/swipe/swipedeck/swipedeck.jsx";


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

    async function pass(listing_id) {
    try {
      setStatus("passing...");
      await CarService.passCar({ user_id: userId, listing_id });
      setStatus("Saved pass ❌");
    } catch (err) {
      console.error(err);
      setStatus("Failed to save swipe");
    }
  }

  async function loadCheapest() {
    try {
      setStatus("Loading cars under $20k...");
      const data = await CarService.getCheapestCars();
      console.log("Cheap cars result:", data);
      setCars(data);
      setStatus("");
    } catch (err) {
      console.error("Failed to load cheapest cars:", err);
      setStatus("Failed to load cheapest cars");
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
      <p style={{ opacity: 0.7 }}>Welcome, {username}! UserID: {userId}</p>

      <form
        onSubmit={onSearch}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "0.5rem",
          marginBottom: "2rem",
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

      <button type="button" onClick={loadCheapest} style={{ marginBottom: "1rem" }}>
        Avg Price less than 20k
      </button>

      {status && (
        <p>
          <em>{status}</em>
        </p>
      )}

    <SwipeDeck
      cars={cars}
      onLike={like}
      onPass={pass}
    />


      {cars.length === 0 && !status && (
        <p>No cars found. Try different filters or seed some data in the DB.</p>
      )}
    </div>
  );
}
