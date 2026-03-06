import axios from "axios";
import auth from "../auth.js";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function callProxy(endpoint) {
    await auth.ensureToken();

    try {
        const res = await axios.get(`${auth.proxyUrl}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            },
            timeout: 15000
        });
// console.log(`📡 Called ${endpoint}, got:`, res.data.result);
        return res.data.result;

    } catch (err) {

        if (err.response?.status === 401) {
            console.log("⚠ 401 detected. Refreshing token once...");

            // force refresh
            auth.token = null;
            await auth.ensureToken();

            const retry = await axios.get(`${auth.proxyUrl}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                },
                timeout: 15000
            });

            return retry.data.result;
        }

        throw err;
    }
}

async function getTwState() {
    const result = await callProxy("/tw/state");
    await sleep(75);
    return result;
}

async function getTwVoltage() {
    const result = await callProxy("/tw/voltage");
    await sleep(75);
    return result;
}

async function getTwCurrent() {
    const result = await callProxy("/tw/current");
    await sleep(75);
    return result;
}

async function getDecoders() {
    const result = await callProxy("/lu?compact");
    await sleep(75);
    return result;
}

async function getLuDetails() {
    const lous = await callProxy("/lu");
    await sleep(75);

    const details = [];
    for (const decoder of (lous || [])) {
        try {
            const addr = decoder.addr;
            // Fetching status for station 1 by default
            const status = await callProxy(`/lu/${addr}/1/value`);
            details.push({
                addr: addr,
                alias: decoder.alias,
                state: decoder.state,
                value: status
            });
            await sleep(50); // Be gentle on the interface
        } catch (err) {
            console.warn(`⚠ Could not fetch status for LU ${decoder.addr}: ${err.message}`);
        }
    }
    return details;
}

export default {
    getTwState,
    getTwVoltage,
    getTwCurrent,
    getDecoders,
    getLuDetails
};