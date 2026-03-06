import express from "express";
import irrigation from "./irrigation.js";
import config from "../config.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 📝 Basic health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "irrigation-api" });
});

// 🎮 Consolidated Irrigation Control
// Checks status and performs corresponding ON/OFF action automatically
app.post("/control/:luId/:stationId", async (req, res) => {
    const { luId, stationId } = req.params;
    try {
        const result = await irrigation.syncStatus(luId, stationId);
        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Failed to control station ${stationId} on LU ${luId}`,
            error: err.message
        });
    }
});

app.listen(port, () => {
    console.log(`🚀 Irrigation API server running on port ${port}`);
});
