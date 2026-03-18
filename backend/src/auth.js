import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import config from "./config.js";

class AuthService {
    constructor() {
        this.jar = new CookieJar();

        this.client = wrapper(
            axios.create({
                jar: this.jar,
                withCredentials: true,
                timeout: 15000
            })
        );

        this.token = null;
        this.proxyUrl = null;
        this.tokenExpiry = null;
    }

    // 🔐 Login using RPC (sets cookie automatically in jar)
    async login() {
        try {
            const res = await this.client.post(
                config.rpcUrl,
                {
                    id: 14,
                    method: "users.login",
                    params: {
                        email: config.email,
                        password: config.password
                    }
                },
                {
                    headers: {
                        origin: "https://irrigation.online",
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!res.data?.result?.user_id) {
                throw new Error("Login failed: Invalid response");
            }

            console.log("✅ Login successful");
        } catch (err) {
            console.error("❌ Login failed:", err.response?.data || err.message);
            throw err;
        }
    }

    // 🎫 Fetch interface proxy + bearer token
    async getInterfaceToken() {
        try {
            const res = await this.client.post(
                config.rpcUrl,
                {
                    id: 1,
                    method: "users.interface",
                    params: {
                        interface_id: config.interfaceId
                    }
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!res.data?.result?.token) {
                throw new Error("Interface token not returned");
            }

            this.proxyUrl = res.data.result.proxyUrl;
            this.token = res.data.result.token;

            // Decode JWT expiry
            const payload = JSON.parse(
                Buffer.from(this.token.split(".")[1], "base64").toString()
            );

            this.tokenExpiry = payload.exp * 1000;

            console.log("✅ Interface token acquired");
            console.log("Proxy URL:", this.proxyUrl);

        } catch (err) {
            console.error("❌ Interface token error:", err.response?.data || err.message);
            throw err;
        }
    }

    // 🔁 Ensure valid token (auto refresh before expiry)
    async ensureToken() {
        try {
            const needsRefresh =
                !this.token ||
                !this.tokenExpiry ||
                Date.now() >= this.tokenExpiry - 60000; // refresh 1 min early

            if (needsRefresh) {
                console.log("🔄 Refreshing session...");
                await this.login();
                await this.getInterfaceToken();
            }
        } catch (err) {
            console.error("❌ Token refresh failed");
            throw err;
        }
    }
}

export default new AuthService();