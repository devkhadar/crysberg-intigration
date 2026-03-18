import express from "express";
import cors from "cors";
import irrigation from "./irrigation.js";
import mk3 from "./mk3.js";
import config from "../config.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 📝 Enhanced health check
app.get("/health", async (req, res) => {
    try {
        await mk3.getTwState();
        res.json({ 
            status: "ok", 
            service: "irrigation-api",
            hardware: "online" 
        });
    } catch (err) {
        res.json({ 
            status: "ok", 
            service: "irrigation-api",
            hardware: "offline",
            error: err.message
        });
    }
});

// 🎮 Consolidated Irrigation Control
app.post("/control/:luId/:stationId", async (req, res) => {
    const { luId, stationId } = req.params;
    try {
        const result = await irrigation.syncStatus(luId, stationId);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Failed to control station ${stationId} on LU ${luId}`,
            error: err.message
        });
    }
});

// ⚡ MK3 Endpoints
app.get("/mk3/state", async (req, res) => {
    try {
        const state = await mk3.getTwState();
        res.json({ success: true, state });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get("/mk3/voltage", async (req, res) => {
    try {
        const voltage = await mk3.getTwVoltage();
        res.json({ success: true, voltage });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get("/mk3/current", async (req, res) => {
    try {
        const current = await mk3.getTwCurrent();
        res.json({ success: true, current });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get("/mk3/decoders", async (req, res) => {
    try {
        const decoders = await mk3.getDecoders();
        res.json({ success: true, decoders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get("/mk3/details", async (req, res) => {
    try {
        const details = await mk3.getLuDetails();
        res.json({ success: true, details });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 💧 Irrigation Status & Control
app.get("/irrigation/status/:luId/:stationId", async (req, res) => {
    const { luId, stationId } = req.params;
    try {
        const value = await irrigation.getStatus(luId, stationId);
        res.json({ success: true, luId, stationId, value });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/irrigation/on/:luId/:stationId", async (req, res) => {
    const { luId, stationId } = req.params;
    try {
        const result = await irrigation.turnOn(luId, stationId);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/irrigation/off/:luId/:stationId", async (req, res) => {
    const { luId, stationId } = req.params;
    try {
        const result = await irrigation.turnOff(luId, stationId);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 Irrigation API server running on port ${port}`);
});
