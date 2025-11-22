import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
dotenv.config();

const app = express();
const allowed = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://car-tinder-476522.web.app"
]);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.has(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
}));
app.options("*", cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/cars", async (req, res) => {
  try {
    const { make, model, year } = req.query;

    let sql = `
      SELECT Car.car_id, Car.make, Car.model, Car.year, CarImage.image_url, UsedCarListing.listing_id, UsedCarListing.price
      FROM Car JOIN CarImage ON Car.car_id = CarImage.car_id JOIN UsedCarListing ON UsedCarListing.car_id = Car.car_id
    `;

    const conditions = [];
    const params = [];

    if (make) {
      conditions.push("Car.make LIKE ?");
      params.push(`%${make}%`);
    }

    if (model) {
      conditions.push("Car.model LIKE ?");
      params.push(`%${model}%`);
    }

    if (year) {
      // basic numeric guard, avoid weird input
      const yearNum = Number(year);
      if (!Number.isNaN(yearNum)) {
        conditions.push("Car.year = ?");
        params.push(yearNum);
      }
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY Car.year DESC LIMIT 20";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB query failed" });
  }
});


// minimal CREATE (record a swipe) ---
app.post("/api/swipes", async (req, res) => {
  try {
    const { user_id, listing_id, action } = req.body; // action: 'LIKE' | 'PASS'

    if (user_id == null || listing_id == null || !["LIKE", "PASS"].includes(action)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    await pool.query(
      `INSERT INTO Swipe (user_id, listing_id, action, created_at)
       VALUES (?, ?, ?, NOW())`,
      [user_id, listing_id, action]
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert failed" });
  }
});

const port = Number(process.env.PORT || 5174 ||8080);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
