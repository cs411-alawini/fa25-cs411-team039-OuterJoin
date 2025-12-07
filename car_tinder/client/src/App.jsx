import { useEffect, useState } from "react";
import CarService from "./service/carService.js";
import UsernameInput from "./components/login/UsernameInput.jsx";
import LoginService from "./service/loginService.js";

import SwipeDeck from "./components/swipe/swipedeck/SwipeDeck.jsx";
import LikedCarsModal from "./components/liked/LikedCarsModal.jsx";
import PreferencesModal from "./components/preferences/PreferencesModal.jsx";

export default function App() {
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(0);
  const [cars, setCars] = useState([]);
  const [status, setStatus] = useState("");
  const [makeFilter, setMakeFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [likedCars, setLikedCars] = useState([]);
  const [showLikes, setShowLikes] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null); 


  async function fetchCars(filters = {}) {
    try {
      setStatus("Loading cars...");
      const data = await CarService.fetchCars({ ...filters, user_id: userId });
      setCars(data);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load cars");
      setCars([]);
    }
  }
  function handleClearFilters() {
    setActiveFilter(null);
    setMakeFilter("");
    setModelFilter("");
    setYearFilter("");
    fetchCars();
  }

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (userId) {
      CarService.getPreferences(userId).then(setPreferences).catch(console.error);
      fetchCars();
      loadLikes();
    }
  }, [userId]);

  async function handleSavePreferences(newPrefs) {
    try {
      await CarService.savePreferences(newPrefs);
      setPreferences(newPrefs);
      setShowPreferences(false);
      fetchCars();
    } catch (err) {
      console.error(err);
      alert("Failed to save preferences");
    }
  }

  async function loadLikes() {
    try {
      const data = await CarService.getLikedCars(userId);
      setLikedCars(data);
    } catch (err) {
      console.error(err);
    }
  }

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
      await loadLikes();
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
      setCars(data);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load cheapest cars");
    }
  }

  async function loadPopular() {
    try {
      setStatus("Loading cars under $20k...");
      const data = await CarService.getMostLikedCars();
      setCars(data);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load popular cars");
    }
  }

  async function loadRecommended() {
    try {
      setStatus("Loading recommended cars");

      const data = await CarService.getRecommendedCars(userId, 20);

      setCars(data);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load recommended cars");
    }
  }


  async function handleUnlike(listing_id) {
    await CarService.unlikeCar({ user_id: userId, listing_id });
    await loadLikes();
  }

  async function handleDelete(listing_id) {
    await CarService.deleteLikedCar({ user_id: userId, listing_id });
    await loadLikes();
  }

  async function handleResetLikes() {
    try {
      await CarService.resetLikes(userId);
      await loadLikes();        // refresh list
    } catch (err) {
      console.error(err);
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
    <div style={{ maxWidth: 1000, margin: "2rem auto", fontFamily: "system-ui" }}>
      <LikedCarsModal
        key={likedCars.length}
        open={showLikes}
        onClose={() => setShowLikes(false)}
        cars={likedCars}
        onUnlike={handleUnlike}
        onDelete={handleDelete}
        onResetLikes={handleResetLikes}
      />

      <h1>Car Tinder</h1>
      <p className="Welcome" style={{ opacity: 0.7 }}>Welcome, {username}! UserID: {userId}</p>
      <div className="Users">
        <button
          type="button"
          onClick={async () => {
            await loadLikes();
            setShowLikes(true);
          }}
          style={{ marginBottom: "1rem", marginRight: "1rem" }}
        >
          ❤️ View My Likes
        </button>

        <button
          type="button"
          onClick={() => setShowPreferences(true)}
          style={{ marginBottom: "1rem" }}
        >
          ⚙️ Preferences
        </button>
      </div>
      {showPreferences && (
        <PreferencesModal
          userId={userId}
          onClose={() => setShowPreferences(false)}
          onSave={handleSavePreferences}
          initialPreferences={preferences}
        />
      )}
      <div className="Filters">
        <h2>Filters:</h2>
        <div>
          <button
            type="button"
            onClick={() => {
              setActiveFilter("cheapest");
              loadCheapest();
            }}
            className={activeFilter === "cheapest" ? "filter-active" : ""}
            style={{ marginBottom: "1rem" }}
          >
            Avg Price less than 20k
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFilter("popular");
              loadPopular();
              loadLikes();
            }}
            className={activeFilter === "popular" ? "filter-active" : ""}
            style={{ marginBottom: "1rem" }}
          >
            Top 10 Liked Cars
          </button>

          {likedCars.length > 10 && (
            <button
              type="button"
              onClick={() => {
                setActiveFilter("recommended");
                loadRecommended();
              }}
              className={activeFilter === "recommended" ? "filter-active" : ""}
              style={{ marginBottom: "1rem" }}
            >
              Our Recommendations
            </button>
          )}

          <button
            type="button"
            onClick={handleClearFilters}
            style={{ marginBottom: "1rem" }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {status && <p><em>{status}</em></p>}

      <SwipeDeck
        cars={cars}
        onLike={like}
        onPass={pass}
        onDeckEmpty={loadRecommended}
      />

      <form
        onSubmit={onSearch}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: "0.5rem",
          marginBottom: "2rem",
          alignItems: "center",
        }}
      >
        <input placeholder="Make (e.g. Ford)" value={makeFilter} onChange={(e) => setMakeFilter(e.target.value)} />
        <input placeholder="Model (e.g. Mustang)" value={modelFilter} onChange={(e) => setModelFilter(e.target.value)} />
        <input placeholder="Year (e.g. 2020)" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} />
        <button type="submit">Search</button>
      </form>
      {cars.length === 0 && !status && <p>No cars found.</p>}
    </div>
  );
}
