package solana

import (
	"context"
	"fmt"
	"strings"
	"tracer-backend/types"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
)

func AnalyzeTrace(req types.RequestPayload) types.ResponsePayload {
	if req.RPCURL == "" {
		req.RPCURL = rpc.MainNetBeta_RPC
	}

	// If no TxHash is provided, we can't do much for Solana yet without implementing full simulation construction
	if req.TxHash == "" {
		return types.ResponsePayload{
			Success: false,
			Message: "Solana simulation requires a transaction hash for now (custom simulation not yet implemented)",
		}
	}

	client := rpc.New(req.RPCURL)
	sig, err := solana.SignatureFromBase58(req.TxHash)
	if err != nil {
		return types.ResponsePayload{
			Success: false,
			Message: "Invalid signature: " + err.Error(),
		}
	}

	// Fetch transaction
	// MaxSupportedTransactionVersion is important for V0 transactions
	maxVersion := uint64(0)
	out, err := client.GetTransaction(
		context.Background(),
		sig,
		&rpc.GetTransactionOpts{
			Commitment:                     rpc.CommitmentConfirmed,
			MaxSupportedTransactionVersion: &maxVersion,
		},
	)
	if err != nil {
		return types.ResponsePayload{
			Success: false,
			Message: "Failed to fetch transaction: " + err.Error(),
		}
	}

	if out == nil || out.Meta == nil {
		return types.ResponsePayload{
			Success: false,
			Message: "Transaction not found or no metadata",
		}
	}

	traceItems := []types.TraceItem{}
	for _, logMsg := range out.Meta.LogMessages {
		isError := strings.Contains(logMsg, "failed") || strings.Contains(logMsg, "Error")
		traceItems = append(traceItems, types.TraceItem{
			Log:     logMsg,
			IsError: isError,
		})
	}

	// Check for error in meta
	var deepestError *types.DeepestError
	if out.Meta.Err != nil {
		errStr := fmt.Sprintf("%v", out.Meta.Err)
		deepestError = &types.DeepestError{
			Error:  errStr,
			Reason: "Transaction failed on-chain",
		}

		// Try to find the last log which might contain the error
		if len(traceItems) > 0 {
			lastLog := traceItems[len(traceItems)-1]
			deepestError.Reason = lastLog.Log
			// Ensure the last log is marked as error
			traceItems[len(traceItems)-1].IsError = true
		}
	}

	return types.ResponsePayload{
		Success:      out.Meta.Err == nil,
		FullTrace:    traceItems,
		DeepestError: deepestError,
	}
}
