import config from "./config.js";
import mk3 from "./api/mk3.js";
import tb from "./thingsboard.js";

let polling = false;

async function poll() {
    try {
        console.log("🚀 Poll cycle started");

        const twState = await mk3.getTwState();
        const voltage = await mk3.getTwVoltage();
        const current = await mk3.getTwCurrent();
        const luDetails = await mk3.getLuDetails();

        const payload = {
            ts: Date.now(),
            tw_state: twState,
            result: twState,
            tw_voltage: voltage,
            tw_current: current,
            decoder_count: luDetails.length
        };
        // Add individual LU status and state to payload
        luDetails.forEach(detail => {
            // Using a clean key for ThingsBoard: status_{addr} and state_{addr}
            // Default undefined values to -1
            payload[`status_${detail.addr}`] = detail.value !== undefined ? detail.value : -1;
            payload[`state_${detail.addr}`] = detail.state !== undefined ? detail.state : -1;
        });

        await tb.sendTelemetry(payload);

        console.log("✅ Telemetry sent:", payload);

    } catch (err) {
        console.error("❌ Polling error:", err.response?.data || err.message);
    }
}

async function safePoll() {
    if (polling) {
        console.log("⏳ Previous poll still running. Skipping...");
        return;
    }

    polling = true;

    try {
        await poll();
    } finally {
        polling = false;
    }
}

async function startPolling() {
    await safePoll();
    setTimeout(startPolling, config.pollInterval);
}

startPolling();