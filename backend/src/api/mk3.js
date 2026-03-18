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
        
        const data = res.data;
        
        // 🚨 Hardware/Service Error detection
        // If the proxy API returns an error object, throw it to stop higher-level processing
        if (data && data.error) {
            throw new Error(`Crysberg Service Error: ${data.error.msg || 'service unavailable'} (Code: ${data.error.code})`);
        }
        
        // Some proxy endpoints might return { result: ... } while others return data directly
        return data && Object.prototype.hasOwnProperty.call(data, 'result') 
            ? data.result 
            : data;

    } catch (err) {
        if (err.response?.status === 401) {
            console.log("⚠ 401 detected. Refreshing token once...");
            auth.token = null;
            await auth.ensureToken();

            const retry = await axios.get(`${auth.proxyUrl}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                },
                timeout: 15000
            });

            const retryData = retry.data;

            if (retryData && retryData.error) {
                throw new Error(`Crysberg Service Error: ${retryData.error.msg || 'service unavailable'} (Code: ${retryData.error.code})`);
            }

            return retryData && Object.prototype.hasOwnProperty.call(retryData, 'result') 
                ? retryData.result 
                : retryData;
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
    const response = await callProxy("/lu?compact");
    await sleep(75);
    
    if (response && !Array.isArray(response) && typeof response === 'object') {
        return response.result || response.items || response.lous || [];
    }
    return Array.isArray(response) ? response : [];
}

async function getLuDetails() {
    const response = await callProxy("/lu");
    await sleep(75);

    // Defensive check: Many proxy APIs return the array inside 'result' or 'items'
    // or sometimes return the array directly.
    let lous = response;
    
    // If we have an object but not an array, try to find the array in common fields
    if (lous && !Array.isArray(lous) && typeof lous === 'object') {
        lous = lous.result || lous.items || lous.lous || [];
    }
    
    // Final safety: if not an array now, use an empty array
    const safeLous = Array.isArray(lous) ? lous : [];

    const details = [];
    for (const decoder of safeLous) {
        try {
            const addr = decoder.addr;
            if (!addr) continue; // Skip if no address
            
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