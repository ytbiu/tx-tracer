package types

// RequestPayload matches the input JSON structure
type RequestPayload struct {
	ChainType string `json:"chain_type,omitempty"` // "evm" or "solana" (default "evm")
	RPCURL    string `json:"rpc_url,omitempty"`
	TxHash    string `json:"tx_hash,omitempty"` // Optional: Trace existing tx
	Block  string `json:"block,omitempty"`   // "latest" or hex block number
	Data   struct {
		From  string      `json:"from"`
		To    string      `json:"to"`
		Data  string      `json:"data"`
		Value interface{} `json:"value"` // Can be string (hex) or number
	} `json:"data"`
}

// ResponsePayload matches the output JSON structure
type ResponsePayload struct {
	Success      bool          `json:"success"`
	FullTrace    []TraceItem   `json:"full_trace,omitempty"`
	DeepestError *DeepestError `json:"deepest_error,omitempty"`
	Message      string        `json:"message,omitempty"`
}

type TraceItem struct {
	Log     string        `json:"log"`
	IsError bool          `json:"is_error"`
	Decoded *DecodedModel `json:"decoded,omitempty"`
}

type DeepestError struct {
	Contract     string        `json:"contract"`
	Caller       string        `json:"caller"`
	Error        string        `json:"error"`
	Reason       string        `json:"reason"`
	InputDecoded string        `json:"input_decoded,omitempty"`
	DecodedModel *DecodedModel `json:"decoded_model,omitempty"`
	InputRaw     string        `json:"input_raw,omitempty"`
	Tip          string        `json:"tip,omitempty"`
}

type DecodedModel struct {
	Name   string       `json:"name"`
	Params []ParamModel `json:"params"`
}

type ParamModel struct {
	Name  string `json:"name"`
	Type  string `json:"type"`
	Value string `json:"value"`
}

// TraceFrame represents a node in the debug_traceCall output tree
type TraceFrame struct {
	Type         string        `json:"type"`
	From         string        `json:"from"`
	To           string        `json:"to"`
	Input        string        `json:"input"`
	Output       string        `json:"output"`
	Gas          string        `json:"gas"`
	GasUsed      string        `json:"gasUsed"`
	Error        string        `json:"error,omitempty"`
	RevertReason string        `json:"revertReason,omitempty"`
	Value        string        `json:"value,omitempty"`
	Calls        []*TraceFrame `json:"calls,omitempty"`
}
