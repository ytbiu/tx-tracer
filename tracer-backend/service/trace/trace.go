package trace

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"tracer-backend/service/abi"
	"tracer-backend/types"
	"tracer-backend/utils"

	"github.com/ethereum/go-ethereum/rpc"
)

func AnalyzeTrace(req types.RequestPayload) types.ResponsePayload {
	// 1. Setup RPC
	rpcURL := os.Getenv("RPC_URL")
	if req.RPCURL != "" {
		rpcURL = req.RPCURL
	}

	client, err := rpc.Dial(rpcURL)
	if err != nil {
		return types.ResponsePayload{Success: false, Message: fmt.Sprintf("Failed to connect to RPC: %v", err)}
	}
	defer client.Close()

	// 2. Trace
	var result interface{}
	var errCall error

	if req.TxHash != "" {
		// Trace existing transaction
		errCall = client.CallContext(context.Background(), &result, "debug_traceTransaction", req.TxHash, map[string]interface{}{
			"tracer": "callTracer",
		})
	} else {
		// Simulate transaction call
		val := "0x0"
		switch v := req.Data.Value.(type) {
		case string:
			val = utils.SanitizeNumber(v)
		case float64:
			val = fmt.Sprintf("0x%x", int64(v))
		}

		data := utils.SanitizeBytes(req.Data.Data)

		tx := map[string]interface{}{
			"from":  req.Data.From,
			"to":    req.Data.To,
			"data":  data,
			"value": val,
		}

		blockNum := "latest"
		if req.Block != "" {
			blockNum = utils.SanitizeBlockNumber(req.Block)
		}

		errCall = client.CallContext(context.Background(), &result, "debug_traceCall", tx, blockNum, map[string]interface{}{
			"tracer": "callTracer",
		})
	}

	if errCall != nil {
		return types.ResponsePayload{Success: false, Message: fmt.Sprintf("Trace failed: %v", errCall)}
	}

	// 4. Parse Result
	jsonBytes, _ := json.Marshal(result)
	var root types.TraceFrame
	if err := json.Unmarshal(jsonBytes, &root); err != nil {
		return types.ResponsePayload{Success: false, Message: fmt.Sprintf("Failed to parse trace result: %v", err)}
	}

	// 5. Analyze Errors
	response := types.ResponsePayload{Success: true}
	
	// Build Error Trace
	response.FullTrace = buildFullTrace(&root, 0)
	
	// Find Deepest Error
	deepest := findDeepestRevert(&root)
	if deepest != nil {
		errInfo := &types.DeepestError{
			Contract: deepest.To,
			Caller:   deepest.From,
			Error:    deepest.Error,
			Reason:   deepest.RevertReason,
			InputRaw: deepest.Input, // Return full input
		}
		
		// Decode Input
		decoded, model := abi.TryDecodeInput(deepest.Input)
		if decoded != "" {
			errInfo.InputDecoded = decoded
			errInfo.DecodedModel = model
		}
		
		if deepest.RevertReason == "BNE" {
			errInfo.Tip = "'BNE' typically stands for 'Balance Not Enough'. Check token balance."
		}
		
		response.DeepestError = errInfo
	} else {
		response.Message = "No revert error found in the trace."
	}

	return response
}

func buildFullTrace(frame *types.TraceFrame, depth int) []types.TraceItem {
	var traces []types.TraceItem
	
	indent := strings.Repeat("  ", depth)
	hasError := frame.Error != "" || frame.RevertReason != ""
	
	status := "SUCCESS"
	if hasError {
		status = fmt.Sprintf("FAILED (%s)", frame.Error)
		if frame.RevertReason != "" {
			status += fmt.Sprintf(" Reason: %s", frame.RevertReason)
		}
	}
	
	// Decode function name for summary
	funcName := "fallback"
	if len(frame.Input) >= 10 {
		selector := frame.Input[2:10] // skip 0x
		if name := abi.GetFunctionName(selector); name != "" {
			funcName = name
		} else {
			funcName = selector
		}
	}
	
	line := fmt.Sprintf("%s-> %s [%s] %s", indent, frame.To, funcName, status)
	
	item := types.TraceItem{
		Log:     line,
		IsError: hasError,
	}

	// Try to decode input for this call
	if len(frame.Input) > 10 { // 0x + 8 chars selector = 10
		_, model := abi.TryDecodeInput(frame.Input)
		if model != nil {
			item.Decoded = model
		}
	}
	
	traces = append(traces, item)
	
	for _, child := range frame.Calls {
		traces = append(traces, buildFullTrace(child, depth+1)...)
	}
	
	return traces
}

// findDeepestRevert finds the deepest node with an error
func findDeepestRevert(frame *types.TraceFrame) *types.TraceFrame {
	for _, child := range frame.Calls {
		if res := findDeepestRevert(child); res != nil {
			return res
		}
	}
	if frame.Error != "" || frame.RevertReason != "" {
		return frame
	}
	return nil
}
