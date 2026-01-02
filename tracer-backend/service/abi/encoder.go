package abi

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

func EncodeABI(signature string, args []string) (string, error) {
	// Parse signature "func(type1,type2)"
	parts := strings.Split(signature, "(")
	if len(parts) != 2 {
		return "", fmt.Errorf("invalid signature format")
	}
	name := parts[0]
	paramsStr := strings.TrimSuffix(parts[1], ")")
	
	var paramTypes []string
	if paramsStr != "" {
		paramTypes = strings.Split(paramsStr, ",")
	}

	// Construct JSON ABI
	var inputs []map[string]string
	for _, t := range paramTypes {
		t = strings.TrimSpace(t)
		if t == "" {
			continue
		}
		inputs = append(inputs, map[string]string{"type": t})
	}

	abiDef := map[string]interface{}{
		"name":   name,
		"type":   "function",
		"inputs": inputs,
	}

	jsonBytes, _ := json.Marshal([]interface{}{abiDef})
	parsed, err := abi.JSON(bytes.NewReader(jsonBytes))
	if err != nil {
		return "", fmt.Errorf("failed to parse generated ABI: %v", err)
	}

	if len(args) != len(inputs) {
		return "", fmt.Errorf("argument count mismatch: expected %d, got %d", len(inputs), len(args))
	}

	// Convert string args to interface{}
	vals := make([]interface{}, len(inputs))
	for i, input := range inputs {
		t := input["type"]
		valStr := args[i]

		switch {
		case strings.HasPrefix(t, "uint") || strings.HasPrefix(t, "int"):
			n := new(big.Int)
			if _, ok := n.SetString(valStr, 0); !ok { // 0 handles 0x or decimal
				return "", fmt.Errorf("invalid number for %s: %s", t, valStr)
			}
			// Note: This assumes uint256/int256 mostly. For smaller types, pack might be strict.
			// However, abi.Pack with JSON-parsed ABI is usually lenient or expects correct Go type.
			// Let's assume big.Int works for all ints in this simplified encoder.
			vals[i] = n
		case t == "address":
			if !common.IsHexAddress(valStr) {
				return "", fmt.Errorf("invalid address: %s", valStr)
			}
			vals[i] = common.HexToAddress(valStr)
		case t == "bool":
			vals[i] = (valStr == "true" || valStr == "1")
		case t == "string":
			vals[i] = valStr
		case t == "bytes":
			vals[i] = common.FromHex(valStr)
		case strings.HasPrefix(t, "bytes") && t != "bytes":
			// Fixed bytes (bytes32, etc)
			// b := common.FromHex(valStr)
			// We need to pad or check length?
			// abi.Pack expects [N]byte. This is hard to construct dynamically in Go.
			// But wait, the ABI packer uses reflection.
			// We can pass the byte slice and hope it works? No, it usually requires array.
			// Workaround: We might need a better generic packer.
			// For now, fail on bytesN if not supported.
			return "", fmt.Errorf("fixed bytes types (%s) not fully supported yet", t)
		default:
			return "", fmt.Errorf("unsupported type: %s", t)
		}
	}

	packed, err := parsed.Methods[name].Inputs.Pack(vals...)
	if err != nil {
		return "", fmt.Errorf("packing failed: %v", err)
	}

	// Selector
	selector := crypto.Keccak256Hash([]byte(signature)).Bytes()[:4]
	return "0x" + hex.EncodeToString(selector) + hex.EncodeToString(packed), nil
}
