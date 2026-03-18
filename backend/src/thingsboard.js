import axios from "axios";
import config from "./config.js";

async function sendTelemetry(data) {
    await axios.post(
        `${config.tbUrl}/api/v1/${config.tbToken}/telemetry`,
        data,
        { headers: { "Content-Type": "application/json" } }
    );
}

export default {
    sendTelemetry
};