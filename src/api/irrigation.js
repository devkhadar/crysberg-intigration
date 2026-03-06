import axios from "axios";
import auth from "../auth.js";

async function getStatus(luId, stationId) {
    await auth.ensureToken();
    try {
        const url = `${auth.proxyUrl}/lu/${luId}/${stationId}/value`;
        console.log(`📡 Fetching status from: ${url}`);
        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${auth.token}` },
            timeout: 15000
        });
        return res.data?.result;
    } catch (err) {
        if (err.response?.status === 401) {
            auth.token = null;
            await auth.ensureToken();
            const retry = await axios.get(`${auth.proxyUrl}/lu/${luId}/${stationId}/value`, {
                headers: { Authorization: `Bearer ${auth.token}` },
                timeout: 15000
            });
            return retry.data?.result;
        }
        throw err;
    }
}

async function sendCommand(luId, stationId, action) {
    await auth.ensureToken();
    try {
        const url = `${auth.proxyUrl}/lu/${luId}/${stationId}/${action}`;
        console.log(`📡 Sending '${action}' command to: ${url}`);
        const res = await axios.post(url, {}, {
            headers: { Authorization: `Bearer ${auth.token}` },
            timeout: 15000
        });
        console.log(`✅ Command '${action}' sent for LU ${luId}, Station ${stationId}.`);
        return res.data;
    } catch (err) {
        if (err.response?.status === 401) {
            auth.token = null;
            await auth.ensureToken();
            const retry = await axios.post(`${auth.proxyUrl}/lu/${luId}/${stationId}/${action}`, {}, {
                headers: { Authorization: `Bearer ${auth.token}` },
                timeout: 15000
            });
            return retry.data;
        }
        throw err;
    }
}

async function syncStatus(luId, stationId) {
    const value = await getStatus(luId, stationId);
    // If it's ON (1), turn it OFF. Otherwise (0 or -1), turn it ON.
    const action = value === 1 ? 'off' : 'on';
    
    console.log(`🔄 Toggling LU ${luId}, Station ${stationId}: Current Value ${value} -> Sending '${action}'`);
    
    await sendCommand(luId, stationId, action);
    
    const statusLabel = value === 1 ? "ON" : (value === 0 ? "OFF" : "Unknown");
    
    return {
        luId,
        stationId,
        previousValue: value,
        actionTaken: action,
        message: `Station ${stationId} on LU ${luId} was ${statusLabel}. It has been toggled '${action.toUpperCase()}' successfully.`
    };
}

export default {
    getStatus,
    sendCommand,
    syncStatus,
    turnOff: (luId, stationId) => sendCommand(luId, stationId, "off"),
    turnOn: (luId, stationId) => sendCommand(luId, stationId, "on")
};
