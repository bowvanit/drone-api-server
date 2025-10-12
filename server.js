import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// GET /configs/:droneId
app.get("/configs/:droneId", async (req, res) => {
    const { droneId } = req.params;
    
    try {
        const response = await fetch(`${process.env.CONFIG_URL}?id=${droneId}`);
        const data = await response.json();
        const drones = data.data ? data.data : data;
        const drone = drones.find(d => d.drone_id == droneId); 

        if (!drone) {
            return res.status(404).json({ error: "Config not found for this Drone ID." });
        }

        res.json({
            drone_id: drone.drone_id,
            drone_name: drone.drone_name,
            light: drone.light,
            country: drone.country,
            condition: drone.condition 
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch config data." });
    }
});

// GET /status/:droneId
app.get("/status/:droneId", async (req, res) => {
    const { droneId } = req.params;
    
    try {
        const response = await fetch(`${process.env.CONFIG_URL}?id=${droneId}`);
        const data = await response.json();
        const drones = data.data ? data.data : data;
        const drone = drones.find(d => d.drone_id == droneId);

        if (!drone) {
            return res.status(404).json({ error: "Status not found for this Drone ID." });
        }

        res.json({
            condition: drone.condition
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch status data." });
    }
});

// GET /logs/:droneId (พร้อมคะแนนพิเศษ Pagination)
app.get("/logs/:droneId", async (req, res) => {
    const { droneId } = req.params;
    const page = req.query.page || 1; 

    try {
        const response = await fetch(
            `${process.env.LOG_URL}?filter=(drone_id="${droneId}")&sort=-created&limit=12&page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.LOG_API_TOKEN}`
                }
            }
        );

        const data = await response.json();
        
        if (!data.items) {
             return res.json([]);
        }
        
        const logs = data.items.map(log => ({
            drone_id: log.drone_id,
            drone_name: log.drone_name,
            created: log.created,
            country: log.country,
            celsius: log.celsius
        }));
        
        res.json(logs);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch log data." });
    }
});

// POST /logs
app.post("/logs", async (req, res) => {
    const { drone_id, drone_name, country, celsius } = req.body;
    
    if (!drone_id || !celsius) {
        return res.status(400).json({ error: "Missing required fields (drone_id, celsius)." });
    }

    try {
        const response = await fetch(process.env.LOG_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.LOG_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ drone_id, drone_name, country, celsius })
        });
        
        const result = await response.json();
        res.status(response.status).json(result);
    } catch (error) {
         return res.status(500).json({ error: "Failed to create log record." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
