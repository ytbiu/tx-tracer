package abi

import (
	"encoding/hex"
	"fmt"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"tracer-backend/types"
)

// Common ERC20/ERC721 selectors
var commonSelectors = map[string]struct {
	Name   string
	Params []string
}{
	"a9059cbb": {"transfer", []string{"address", "uint256"}},
	"23b872dd": {"transferFrom", []string{"address", "address", "uint256"}},
	"095ea7b3": {"approve", []string{"address", "uint256"}},
	"70a08231": {"balanceOf", []string{"address"}},
}

var knownABIs = map[string]string{
	"3867c1cb": `[{"constant":false,"inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"name":"path","type":"address[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swap","outputs":[],"type":"function"}]`,
}

func GetFunctionName(selector string) string {
	if info, ok := commonSelectors[selector]; ok {
		return info.Name
	}
	if selector == "3867c1cb" {
		return "swap"
	}
	return ""
}

func TryDecodeInput(input string) (string, *types.DecodedModel) {
	input = strings.TrimPrefix(input, "0x")
	if len(input) < 8 {
		return "", nil
	}
	selector := input[:8]
	dataBytes, _ := hex.DecodeString(input[8:])

	// 1. Try generic ABI decoding if known
	if jsonABI, ok := knownABIs[selector]; ok {
		parsed, err := abi.JSON(strings.NewReader(jsonABI))
		if err == nil {
			method, err := parsed.MethodById(common.Hex2Bytes(selector))
			if err == nil {
				args, err := method.Inputs.Unpack(dataBytes)
				if err == nil {
					var sb strings.Builder
					var params []types.ParamModel

					sb.WriteString(fmt.Sprintf("  Function: %s\n", method.Name))
					for i, arg := range args {
						valStr := fmt.Sprintf("%v", arg)
						sb.WriteString(fmt.Sprintf("  %s (%s): %s\n", method.Inputs[i].Name, method.Inputs[i].Type, valStr))

						params = append(params, types.ParamModel{
							Name:  method.Inputs[i].Name,
							Type:  method.Inputs[i].Type.String(),
							Value: valStr,
						})
					}

					model := &types.DecodedModel{
						Name:   method.Name,
						Params: params,
					}
					return sb.String(), model
				}
			}
		}
	}

	// 2. Fallback to simple common selectors
	dataHex := input[8:] // Keep hex string for manual parsing
	if info, ok := commonSelectors[selector]; ok {
		var sb strings.Builder
		var params []types.ParamModel

		sb.WriteString(fmt.Sprintf("  Function: %s\n", info.Name))

		// Decode params
		offset := 0
		for i, paramType := range info.Params {
			var val string

			if offset+64 > len(dataHex) {
				sb.WriteString(fmt.Sprintf("  Param[%d] (%s): <insufficient data>\n", i, paramType))
				val = "<insufficient data>"
			} else {
				chunk := dataHex[offset : offset+64]
				offset += 64

				if paramType == "address" {
					// Address is last 40 chars of the 64 char chunk
					val = "0x" + chunk[24:]
				} else if paramType == "uint256" {
					n := new(big.Int)
					n.SetString(chunk, 16)
					val = n.String()
				} else {
					val = "0x" + chunk
				}
				sb.WriteString(fmt.Sprintf("  Param[%d] (%s): %s\n", i, paramType, val))
			}

			params = append(params, types.ParamModel{
				Name:  fmt.Sprintf("param%d", i),
				Type:  paramType,
				Value: val,
			})
		}

		model := &types.DecodedModel{
			Name:   info.Name,
			Params: params,
		}
		return sb.String(), model
	}

	// Fallback: chunk data (no model)
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("  Selector: 0x%s\n", selector))
	for i := 0; i < len(dataHex); i += 64 {
		end := i + 64
		if end > len(dataHex) {
			end = len(dataHex)
		}
		sb.WriteString(fmt.Sprintf("  Arg[%d]: 0x%s\n", i/64, dataHex[i:end]))
	}
	return sb.String(), nil
}
