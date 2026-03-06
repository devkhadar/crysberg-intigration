import dotenv from "dotenv";
dotenv.config();

const config = {
    rpcUrl: process.env.RPC_URL,
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
    interfaceId: process.env.INTERFACE_ID,
    tbUrl: process.env.TB_URL,
    tbToken: process.env.TB_DEVICE_TOKEN,
    pollInterval: parseInt(process.env.POLL_INTERVAL || "15000")
};

export default config;