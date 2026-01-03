# Debug Backend Service

This service provides an HTTP API and CLI tool to debug blockchain transactions by simulating them with `debug_traceCall` and analyzing the execution trace to find the root cause of failures.

## Features

- **Auto-Trace**: Automatically executes `debug_traceCall` on the provided transaction parameters.
- **Error Analysis**: Traverses the call stack to find the deepest revert reason.
- **Input Decoding**: Decodes input data for known function selectors (e.g., ERC20 `transfer`, `transferFrom`, `swap`) at the point of failure.
- **Smart Tips**: Provides hints for common error codes (e.g., "BNE" -> "Balance Not Enough").
- **Block Height**: Supports specifying block height for historical transaction replay via CLI argument or URL parameter.
- **Flexible Input**: Supports reading parameters from a file or directly from a JSON string argument.

## Configuration

The service requires an Ethereum RPC node supporting `debug_traceCall` or `debug_traceTransaction`.

### Environment Variables

You can configure the service using the following environment variables:

| Variable          | Description                           | Default             |
| ----------------- | ------------------------------------- | ------------------- |
| `BSC_RPC_URL`     | Default RPC URL for BSC (Chain ID 56) | -                   |
| `BASIC_AUTH_USER` | Username for Basic Auth               | `admin`             |
| `BASIC_AUTH_PASS` | Password for Basic Auth               | `tracer_admin_2026` |
| `PORT`            | Server port                           | `8080`              |

```bash
export BSC_RPC_URL="https://your-bsc-rpc-node"
export BASIC_AUTH_USER="admin"
export BASIC_AUTH_PASS="your_secure_password"
```

If `BSC_RPC_URL` is not set in the environment, the service will look for `rpc_url` in the request payload.

> **Note**: The `/debug` endpoint is protected by Basic Auth. The `/decode` and `/encode` endpoints are public.

## Usage

### 1. CLI Mode (One-shot)

You can run the tool directly without starting a server.

**Option A: Read from file**

```bash
cd tracer-backend
./run_debug.sh err.json 73760000
```

**Option B: Pass JSON string directly**

```bash
cd tracer-backend
# Note: Use single quotes for the JSON string to avoid shell expansion issues
./run_debug.sh '{"data":{"from":"0x...", "to":"0x...", "data":"0x..."}}' 73760000
```

- Argument 1: JSON file path OR JSON string containing transaction parameters.
- Argument 2: Block number (optional, defaults to "latest").

### 2. Server Mode

Start the HTTP server:

```bash
cd tracer-backend
go run main.go --port 8080
```

#### Send Debug Request

**Endpoint:** `POST /debug` (Protected by Basic Auth)

**Option A: Pass parameters via JSON Body (no file needed)**

```bash
curl -X POST -u "admin:your_secure_password" \
     -H "Content-Type: application/json" \
     -d '{"data":{"from":"0x...", "to":"0x...", "data":"0x..."}}' \
     "http://localhost:8080/debug?block=73760000"
```

**Option B: Read from file**

```bash
curl -X POST -u "admin:your_secure_password" \
     -H "Content-Type: application/json" \
     -d @err.json \
     "http://localhost:8080/debug?block=73760000"
```

### 3. Response Format

```json
{
  "success": true,
  "error_trace": [
    "-> 0xContractA [swap] FAILED (execution reverted)",
    "  -> 0xTokenB [transferFrom] FAILED (execution reverted) Reason: BNE"
  ],
  "deepest_error": {
    "contract": "0xTokenB",
    "caller": "0xContractA",
    "error": "execution reverted",
    "reason": "BNE",
    "input_decoded": "  Function: transferFrom\n  Param[0]: ...",
    "tip": "'BNE' typically stands for 'Balance Not Enough'. Check token balance."
  }
}
```
