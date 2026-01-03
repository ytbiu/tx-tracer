package handler

import (
	"net/http"

	"tracer-backend/service/abi"
	"tracer-backend/service/solana"
	"tracer-backend/service/trace"
	"tracer-backend/types"
	"tracer-backend/utils"

	"github.com/gin-gonic/gin"
)

func HandleDebug(c *gin.Context) {
	var req types.RequestPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
		return
	}

	// Allow overriding block via query parameter
	// Example: POST /debug?block=73760000
	if queryBlock := c.Query("block"); queryBlock != "" {
		req.Block = queryBlock
	}

	var resp types.ResponsePayload
	if req.ChainType == "solana" {
		resp = solana.AnalyzeTrace(req)
	} else {
		resp = trace.AnalyzeTrace(req)
	}

	c.JSON(http.StatusOK, resp)
}

func HandleDecode(c *gin.Context) {
	var req struct {
		Input string `json:"input"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	decoded, model := abi.TryDecodeInput(req.Input)
	if decoded == "" {
		// If decoding failed or no ABI matched, return the raw input split by 32 bytes for easier reading
		decoded = utils.FormatRawInput(req.Input)
	}

	c.JSON(http.StatusOK, gin.H{
		"decoded": decoded,
		"model":   model,
	})
}

func HandleEncode(c *gin.Context) {
	var req struct {
		Signature string   `json:"signature"`
		Args      []string `json:"args"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
		return
	}

	encoded, err := abi.EncodeABI(req.Signature, req.Args)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Encoding failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"encoded": encoded,
	})
}
