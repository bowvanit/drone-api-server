import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// GET /configs/:droneId
app.get("/configs/:droneId", async (req, res) => {
  const { droneId } = req.params;
  const response = await fetch(process.env.CONFIG_URL);
  const data = await response.json();
  const drones = data.data ? data.data : data;
  const drone = drones.find(d => d.drone_id == droneId);

  res.json({
    drone_id: drone.drone_id,
    drone_name: drone.drone_name,
    light: drone.light,
    country: drone.country,
    weight: drone.weight
  });
});

// GET /status/:droneId
app.get("/status/:droneId", async (req, res) => {
  const { droneId } = req.params;
  const response = await fetch(process.env.CONFIG_URL);
  const data = await response.json();
  const drones = data.data ? data.data : data;
  const drone = drones.find(d => d.drone_id == droneId);

  res.json({
    condition: drone.condition
  });
});

// GET /logs/:droneId
app.get("/logs/:droneId", async (req, res) => {
  const { droneId } = req.params;
  const response = await fetch(
    `${process.env.LOG_URL}?filter=(drone_id=${droneId})&sort=-created&limit=12`,
    {
      headers: {
        Authorization: `Bearer ${process.env.LOG_API_TOKEN}`
      }
    }
  );
  const data = await response.json();
  const logs = data.items.map(log => ({
    drone_id: log.drone_id,
    drone_name: log.drone_name,
    created: log.created,
    country: log.country,
    celsius: log.celsius
  }));
  res.json(logs);
});

// POST /logs
app.post("/logs", async (req, res) => {
  const { drone_id, drone_name, country, celsius } = req.body;
  const response = await fetch(process.env.LOG_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOG_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ drone_id, drone_name, country, celsius })
  });
  const result = await response.json();
  res.json(result);
});

app.listen(process.env.PORT);
