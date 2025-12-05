import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
dotenv.config();

const app = express();
const allowed = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
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

app.get("/api/cheap-cars", async (req, res) => {
  console.log("Executing static cheap cars query");

  try {
    const sql = `
        SELECT 
            c.car_id,
            c.make,
            c.model,
            c.year,
            ci.image_url,
            u.listing_id,
            u.price,
            avg_data.avg_price
        FROM (
            SELECT 
                car_id,
                AVG(price) AS avg_price
            FROM UsedCarListing
            GROUP BY car_id
            HAVING AVG(price) < 20000
        ) AS avg_data
        JOIN Car c ON avg_data.car_id = c.car_id
        JOIN UsedCarListing u ON u.car_id = c.car_id
        LEFT JOIN CarImage ci ON c.car_id = ci.car_id
        ORDER BY avg_data.avg_price ASC;


    `;


    const [rows] = await pool.query(sql);

    res.json(rows);
  } catch (err) {
    console.error("Cheap car query failed:", err);
    res.status(500).json({ error: "DB query failed" });
  }
});

app.get("/api/most-liked-cars", async (req, res) => {
  console.log("Executing most liked cars query");

  try {
    const sql = `
          SELECT 
              c.car_id,
              c.make,
              c.model,
              c.year,
              ci.image_url,
              u.listing_id,
              u.price,
              COUNT(s.swipe_id) AS total_likes
          FROM Swipe s
          JOIN UsedCarListing u ON s.listing_id = u.listing_id
          JOIN Car c ON u.car_id = c.car_id
          LEFT JOIN CarImage ci ON c.car_id = ci.car_id
          WHERE s.action = 'LIKE'
          GROUP BY 
              c.car_id,
              c.make,
              c.model,
              c.year,
              ci.image_url,
              u.listing_id,
              u.price
          ORDER BY total_likes DESC
          LIMIT 10;

            `;


    const [rows] = await pool.query(sql);

    res.json(rows);
  } catch (err) {
    console.error("most liked car query failed:", err);
    res.status(500).json({ error: "DB query failed" });
  }
});


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

    sql += " ORDER BY Car.year DESC LIMIT 30";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB query failed" });
  }
});

app.post("/api/recommendations", async (req, res) => {
  try {
    const { user_id, limit } = req.body;

    console.log("Recommendation request received:", { user_id, limit });

    if (user_id == null || limit == null) {
      console.warn("Invalid recommendation payload:", req.body);
      return res.status(400).json({ error: "Invalid payload" });
    }

    const query = `CALL sp_get_recommended_cars(?, ?)`;

    console.log("Executing stored procedure:", query, [user_id, limit]);

    const [rows] = await pool.query(query, [user_id, limit]);

    console.log("Stored procedure executed successfully");
    res.status(200).json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error("Stored procedure call failed:", err);
    res.status(500).json({ error: "Procedure call failed" });
  }
});



app.post("/api/swipes", async (req, res) => {
  try {
    const { user_id, listing_id, action } = req.body;

    console.log("Swipe request received:", { user_id, listing_id, action });

    if (
      user_id == null ||
      listing_id == null ||
      !["LIKE", "PASS"].includes(action)
    ) {
      console.warn("Invalid swipe payload:", req.body);
      return res.status(400).json({ error: "Invalid payload" });
    }

    const query = `
      INSERT INTO Swipe (user_id, listing_id, action, created_at)
      VALUES (?, ?, ?, NOW())
    `;

    console.log("Executing SQL:", query, [user_id, listing_id, action]);

    await pool.query(query, [user_id, listing_id, action]);

    console.log("Swipe saved successfully");
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Swipe insert failed:", err);
    res.status(500).json({ error: "Insert failed" });
  }
});


app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("LOGIN REQUEST:", { username, passwordProvided: !!password });

    if (!username || !password) {
      console.log("LOGIN FAILED: Missing username or password");
      return res.status(400).json({ error: "Username and password required" });
    }

    console.log("QUERYING FOR EXISTING USER:", username);

    const [existing] = await pool.query(
      `SELECT user_id FROM User WHERE email = ? AND password = ?`,
      [username, password]
    );

    console.log("QUERY RESULT:", existing);

    if (existing.length > 0) {
      console.log("LOGIN SUCCESS:", { user_id: existing[0].user_id });
      return res.json({ user_id: existing[0].user_id });
    }

    console.log("USER NOT FOUND. GENERATING UNIQUE RANDOM ID");

    let newUserId;
    let collisionCheck;

    do {
      newUserId = Math.floor(100000 + Math.random() * 900000);
      const [rows] = await pool.query(
        `SELECT user_id FROM User WHERE user_id = ?`,
        [newUserId]
      );
      collisionCheck = rows.length > 0;
    } while (collisionCheck);

    console.log("GENERATED USER ID:", newUserId);

    const [result] = await pool.query(
      `INSERT INTO User (user_id, email, password, created_at)
       VALUES (?, ?, ?, NOW())`,
      [newUserId, username, password]
    );

    console.log("NEW USER CREATED:", { user_id: newUserId });

    return res.json({ user_id: newUserId });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login or create failed" });
  }
});

app.post("/api/liked-cars", async (req, res) => {
  try {
    const { user_id } = req.body;

    const [rows] = await pool.query(
      `SELECT 
          Car.car_id,
          Car.make,
          Car.model,
          Car.year,
          CarImage.image_url,
          UsedCarListing.listing_id,
          UsedCarListing.price,
          Swipe.created_at
        FROM Swipe
        JOIN UsedCarListing USING(listing_id)
        JOIN Car USING(car_id)
        JOIN CarImage USING(car_id)
        WHERE Swipe.user_id = ?
          AND Swipe.action = 'LIKE'
        ORDER BY Swipe.created_at DESC`,
      [user_id]
    );

    res.json(rows);

  } catch (err) {
    console.error("Error fetching liked cars:", err);
    res.status(500).json({ error: "Failed to fetch liked cars" });
  }
});

app.post("/api/unlike-car", async (req, res) => {
  console.log("UNLIKE request received:", req.body);

  try {
    const { user_id, listing_id } = req.body;

    console.log(`Updating Swipe row — user_id: ${user_id}, listing_id: ${listing_id}`);

    const [result] = await pool.query(
      `UPDATE Swipe
       SET action = 'PASS'
       WHERE user_id = ? AND listing_id = ?`,
      [user_id, listing_id]
    );

    console.log("UNLIKE query result:", result);

    res.json({ success: true });
  } catch (err) {
    console.error("UNLIKE ERROR:", err);
    res.status(500).json({ error: "Failed to unlike car" });
  }
});


app.post("/api/delete-like", async (req, res) => {
  console.log("DELETE LIKE request received:", req.body);

  try {
    const { user_id, listing_id } = req.body;

    console.log(`Deleting Swipe row — user_id: ${user_id}, listing_id: ${listing_id}`);

    const [result] = await pool.query(
      `DELETE FROM Swipe
       WHERE user_id = ? AND listing_id = ?`,
      [user_id, listing_id]
    );

    console.log("DELETE query result:", result);

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete liked car" });
  }
});






const port = Number(process.env.PORT || 5174 ||8080);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
