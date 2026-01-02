# Transaction Tracer Frontend

A Next.js-based web interface for debugging Ethereum transactions. It interacts with the Debug Backend Service to simulate transactions and analyze execution traces.

## Features

- **Transaction Debugging**: Simulate transactions or debug existing tx hashes.
- **Visual Trace Analysis**: View the execution stack and identify where transactions fail.
- **ABI Tools**: Built-in decoder and encoder for function calls and parameters.
- **Environment Configuration**: Configurable RPC endpoints via environment variables.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Running instance of `debug-backend` (default: http://localhost:8080)

### Configuration

Create a `.env.local` file in the root of the frontend directory to set your default RPC URL:

```bash
NEXT_PUBLIC_DEFAULT_RPC_URL=https://api.zan.top/node/v1/bsc/mainnet/your-api-key
```

### Installation

```bash
npm install
```

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

- `components/`: Reusable UI components (Header, InputForm, TraceResult, etc.)
- `services/`: API communication layer
- `types/`: Shared TypeScript interfaces
- `app/`: Next.js app router pages
