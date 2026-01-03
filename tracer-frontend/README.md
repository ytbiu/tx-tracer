# Transaction Tracer Frontend

A Next.js-based web interface for debugging Ethereum transactions. It interacts with the Debug Backend Service to simulate transactions and analyze execution traces.

## Features

- **Transaction Debugging**: Simulate transactions or debug existing tx hashes.
- **Visual Trace Analysis**: View the execution stack and identify where transactions fail.
- **ABI Tools**: Built-in decoder and encoder for function calls and parameters.
- **GitHub Login**: Secure access via GitHub OAuth.
- **Environment Configuration**: Configurable RPC endpoints via environment variables.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Running instance of `tracer-backend` (default: http://localhost:8080)
- A GitHub OAuth App (for login)

### Configuration

Create a `.env.local` file in the root of the frontend directory to set your default RPC URL and GitHub credentials:

```bash
# RPC Configuration (Chain ID -> RPC URL)
# EVM (BNB Chain - 56)
RPC_URL_56=https://your-bsc-rpc-node
# Solana (Mainnet - -1)
RPC_URL_-1=https://api.mainnet-beta.solana.com

# Default fallback
NEXT_PUBLIC_DEFAULT_RPC_URL=https://your-default-rpc-url

# Backend Basic Auth (Must match backend configuration)
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=your_secure_password

# Invitation System
INVITE_CODES=CODE1,CODE2,VIP888

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret

# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

#### Setting up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers).
2. Create a new OAuth App.
3. Set **Homepage URL** to `http://localhost:3000`.
4. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`.
5. Copy the **Client ID** and **Client Secret** to your `.env.local` file.

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
