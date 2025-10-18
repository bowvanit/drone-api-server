import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors()); 
app.use(express.static('./')); 

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

// GET /logs (ดึง Log ตามเงื่อนไข: Filter, Sort, Limit, Offset)
app.get("/logs", async (req, res) => {
    // รับค่า Limit, Page, และ Sort
    const droneId = req.query.drone_id; 
    const limit = parseInt(req.query.limit) || 12; // ***ใช้ 12 รายการ***
    const page = parseInt(req.query.page) || 1; 
    const sort = req.query.sort || '-created'; // ***เรียงจากล่าสุดขึ้นก่อน***

    if (!droneId) {
        return res.status(400).json({ error: "Missing drone_id query parameter." });
    }

    const offset = (page - 1) * limit;

    try {
        // ส่ง Query ไปยัง Log Server พร้อม Filter, Sort, Limit, และ Offset
        const response = await fetch(
            `${process.env.LOG_URL}?filter=(drone_id="${droneId}")&sort=${sort}&limit=${limit}&offset=${offset}`,
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
        
        const limitedItems = data.items.slice(0, limit); 
        
        const logs = limitedItems.map(log => ({ // ใช้ limitedItems แทน data.items
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
    
    // ตรวจสอบความเสถียรของค่า celsius
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