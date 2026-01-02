# Transaction Tracer (tx-tracer)

Transaction Tracer is a full-stack tool designed to help developers debug and analyze Ethereum transactions. It provides a visual interface to simulate transactions, view execution traces, and identify the root causes of transaction failures.

## Project Structure

This repository consists of two main components:

- **[tracer-backend](./tracer-backend)**: A Go-based service that interacts with Ethereum RPC nodes to perform `debug_traceCall` and analyze the execution stack.
- **[tracer-frontend](./tracer-frontend)**: A Next.js web interface that allows users to input transaction details, view trace results, and use ABI encoding/decoding tools.

## Prerequisites

- **Go**: Version 1.20 or higher (for backend).
- **Node.js**: Version 18 or higher (for frontend).
- **Ethereum RPC Node**: An RPC endpoint that supports `debug_traceCall` or `debug_traceTransaction` (e.g., Geth, Erigon, or supported providers like Zan, Alchemy, etc.).

## Quick Start

### Option 1: One-Click Start (Recommended)

You can start both the backend and frontend services with a single script:

```bash
./start.sh
```

This will:

1. Start the backend service on port `8080`.
2. Install frontend dependencies (if missing) and start the dev server on port `3000`.

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Manual Start

If you prefer to run services manually:

#### 1. Start the Backend

The backend runs on port `8080` by default.

```bash
cd tracer-backend
# Set your RPC URL (optional, can also be set in frontend or passed in request)
export RPC_URL="https://your-rpc-node-url"
go run main.go
```

For more details, see [tracer-backend/README.md](./tracer-backend/README.md).

#### 2. Start the Frontend

The frontend runs on port `3000` by default.

```bash
cd tracer-frontend
# Install dependencies
npm install
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For more details, see [tracer-frontend/README.md](./tracer-frontend/README.md).

## Features

- **Transaction Simulation**: Simulate arbitrary transactions with custom `from`, `to`, `data`, and `value` fields.
- **Historical Debugging**: Replay and debug past transactions using their transaction hash.
- **Trace Visualization**: Visualize the call stack and see exactly where and why a transaction reverted.
- **Error Analysis**: Automatically extracts revert reasons and decoded error data.
- **ABI Tools**: Built-in utilities to encode and decode ABI parameters.
