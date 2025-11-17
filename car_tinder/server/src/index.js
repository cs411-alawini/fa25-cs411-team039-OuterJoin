import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
dotenv.config();

const app = express();
const allowed = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // add your Firebase Hosting URL after first deploy, e.g.:
  // "https://car-tinder-476522.web.app",
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

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// --- Minimal retrieval (READ) ---
app.get("/api/cars", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT Car.car_id, make, model, year, image_url
       FROM Car JOIN CarImage on Car.car_id = CarImage.car_id
       ORDER BY year DESC
       LIMIT 20`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB query failed" });
  }
});

// --- Optional: minimal CREATE (record a swipe) ---
// app.post("/api/swipes", async (req, res) => {
//   try {
//     const { user_id, car_id, action } = req.body; // action: 'LIKE' | 'PASS'
//     if (!user_id || !car_id || !["LIKE", "PASS"].includes(action)) {
//       return res.status(400).json({ error: "Invalid payload" });
//     }
//     await pool.query(
//       `INSERT INTO Swipe (user_id, car_id, action, created_at)
//        VALUES (?, ?, ?, NOW())`,
//       [user_id, car_id, action]
//     );
//     res.status(201).json({ ok: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Insert failed" });
//   }
// });

const port = Number(process.env.PORT || 5174 ||8080);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
