import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors()); 
app.use(express.static('../Assignment_2'));

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

// GET /logs 
app.get("/logs", async (req, res) => {
    const { page = 1, limit = 12 } = req.query;
    const filter = `drone_id='${process.env.DRONE_ID}'`;

    try {
        const pbUrl = `${process.env.LOG_URL}?sort=-created&filter=${filter}&page=${page}&perPage=${limit}`;
        
        const response = await fetch(pbUrl, {
            headers: {
                Authorization: `Bearer ${process.env.LOG_API_TOKEN}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
        return res.status(response.status).json(data);
        }

        if (!data || !data.items) {
            return res.json({ items: [], totalPages: 0, totalItems: 0, currentPage: 1 });
        }
        
        const logs = data.items.map(log => ({ 
            drone_id: log.drone_id,
            drone_name: log.drone_name,
            created: log.created,
            country: log.country,
            celsius: log.celsius
        }));
        
        
        res.json({
            items: logs, 
            totalPages: data.totalPages, 
            totalItems: data.totalItems,
            currentPage: data.page
        });

        } catch (error) {
        return res.status(500).json({ error: "Failed to fetch log data." });
    }
});

// POST /logs
app.post("/logs", async (req, res) => {
    const { drone_id, drone_name, country, celsius } = req.body;
    
    if (!drone_id || !Number.isFinite(celsius)) {
        return res.status(400).json({ error: "Missing required fields or 'celsius' is not a valid number." });
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