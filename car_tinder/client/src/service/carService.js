// src/services/carService.js

const API_BASE = import.meta.env.VITE_API_BASE;

class CarService {
  static async fetchCars(filters = {}) {
    const { make, model, year } = filters;

    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (year) params.set("year", year);

    const qs = params.toString();
    const url = `${API_BASE}/api/cars${qs ? `?${qs}` : ""}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch cars");
    }

    return res.json();
  }

  static async likeCar({ user_id, listing_id }) {
    const url = `${API_BASE}/api/swipes`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        listing_id,
        action: "LIKE",
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to record LIKE");
    }

    return res.json();
  }

  static async passCar({ user_id, listing_id }) {
    const url = `${API_BASE}/api/swipes`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        listing_id,
        action: "PASS",
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to record PASS");
    }

    return res.json();
  }

  static async getCheapestCars() {
    const url = `${API_BASE}/api/cheap-cars`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch cheapest cars");
    }

    return res.json();
  }

    static async getMostLikedCars() {
    const url = `${API_BASE}/api/most-liked-cars`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch most liked cars");
    }

    return res.json();
  }
}

export default CarService;
