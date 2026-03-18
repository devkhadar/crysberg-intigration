# Crysberg Irrigation System Control

A modern, full-stack application to control Crysberg MK3 irrigation systems via a proxy API.

## Project Structure

```text
.
├── backend/          # Node.js / Express API
│   ├── src/          # API source code
│   ├── .env          # API environment variables
│   └── package.json  # Backend dependencies
└── frontend/         # Next.js 15+ Frontend
    ├── app/          # App router pages
    ├── lib/          # Frontend API client
    ├── .env.local    # Frontend environment variables
    └── package.json  # Frontend dependencies
```

## Getting Started

### 1. Backend

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your credentials in `.env` (copy from `.env.example` if needed).
4.  Start the API:
    ```bash
    npm run api
    ```
    The API will be available at `http://localhost:3000`.

### 2. Frontend

1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  If needed, update `NEXT_PUBLIC_API_URL` in `.env.local`.
4.  Start the dev server:
    ```bash
    npm run dev
    ```
    The UI will be available at `http://localhost:3001` (or whatever port Next.js picks).

## Features

-   **Dashboard**: Monitor System State, Line Voltage, and Line Current.
-   **Decoder Control**: View status and toggle ON/OFF individual irrigation stations.
-   **Modern UI**: Built with Next.js 15, Tailwind CSS v4, and Lucide icons.
-   **Auto-refresh**: Real-time monitoring with periodic background updates.
