# Transaction Tracer Frontend

A Next.js-based web interface for debugging Ethereum transactions. It interacts with the Debug Backend Service to simulate transactions and analyze execution traces.

## Features

- **Transaction Debugging**: Simulate transactions or debug existing tx hashes.
- **Visual Trace Analysis**: View the execution stack and identify where transactions fail.
- **ABI Tools**: Built-in decoder and encoder for function calls and parameters.
- **User Authentication**: Support for GitHub and Google login (optional).
- **Environment Configuration**: Configurable RPC endpoints via environment variables.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Running instance of `debug-backend` (default: http://localhost:8080)

### Configuration

Create a `.env.local` file in the root of the frontend directory to set your default RPC URL and Auth credentials:

```bash
NEXT_PUBLIC_DEFAULT_RPC_URL=https://api.zan.top/node/v1/bsc/mainnet/your-api-key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here

# GitHub OAuth (Optional)
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Setting up OAuth Providers

1. **GitHub**:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers).
   - Create a new OAuth App.
   - Set **Homepage URL** to `http://localhost:3000`.
   - Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`.
2. **Google**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create credentials for OAuth 2.0 Client ID.
   - Set **Authorized JavaScript origins** to `http://localhost:3000`.
   - Set **Authorized redirect URIs** to `http://localhost:3000/api/auth/callback/google`.

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
