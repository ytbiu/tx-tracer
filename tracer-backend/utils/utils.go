package utils

import (
	"encoding/hex"
	"fmt"
	"math/big"
	"strings"
)

func SanitizeBlockNumber(s string) string {
	if s == "latest" || s == "earliest" || s == "pending" {
		return s
	}
	if strings.HasPrefix(s, "0x") {
		return s
	}
	// Try to parse as decimal
	n := new(big.Int)
	if _, ok := n.SetString(s, 10); ok {
		return "0x" + n.Text(16)
	}
	return s
}

func SanitizeNumber(s string) string {
	if s == "" {
		return "0x0"
	}
	if !strings.HasPrefix(s, "0x") {
		n := new(big.Int)
		if _, ok := n.SetString(s, 10); ok {
			return "0x" + n.Text(16)
		}
		// If not a number, treat as hex
		s = "0x" + s
	}
	
	hexPart := strings.TrimPrefix(s, "0x")
	if len(hexPart)%2 != 0 {
		return "0x0" + hexPart
	}
	return "0x" + hexPart
}

func SanitizeBytes(s string) string {
	if s == "" {
		return "0x"
	}
	if !strings.HasPrefix(s, "0x") {
		s = "0x" + s
	}
	
	hexPart := strings.TrimPrefix(s, "0x")
	if len(hexPart)%2 != 0 {
		// Append 0 to preserve the start (selector)
		return "0x" + hexPart + "0"
	}
	return "0x" + hexPart
}

// Helper to decode hex string if needed
func DecodeHex(s string) []byte {
	s = strings.TrimPrefix(s, "0x")
	b, _ := hex.DecodeString(s)
	return b
}

func FormatRawInput(input string) string {
	input = strings.TrimPrefix(input, "0x")
	if len(input) < 8 {
		return input
	}
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("Selector: 0x%s\n", input[:8]))
	data := input[8:]
	for i := 0; i < len(data); i += 64 {
		end := i + 64
		if end > len(data) {
			end = len(data)
		}
		sb.WriteString(fmt.Sprintf("[%03d] %s\n", i/64, data[i:end]))
	}
	return sb.String()
}
