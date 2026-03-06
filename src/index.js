import config from "./config.js";
import mk3 from "./mk3.js";
import tb from "./thingsboard.js";

let polling = false;

async function poll() {
    try {
        console.log("🚀 Poll cycle started");

        const twState = await mk3.getTwState();
        const voltage = await mk3.getTwVoltage();
        const current = await mk3.getTwCurrent();
        const decoders = await mk3.getDecoders();

        const payload = {
            ts: Date.now(),
            tw_state: twState,
            temperature:twState,
            tw_voltage: voltage,
            tw_current: current,
            decoder_count: decoders.length
        };

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