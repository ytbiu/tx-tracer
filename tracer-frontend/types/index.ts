export interface ParamModel {
  name: string;
  type: string;
  value: string;
}

export interface DecodedModel {
  name: string;
  params: ParamModel[];
}

export interface TraceItem {
  log: string;
  is_error: boolean;
  decoded?: DecodedModel;
}

export interface DebugResponse {
  success: boolean;
  chain_id?: string;
  full_trace?: TraceItem[];
  deepest_error?: {
    contract: string;
    caller: string;
    error: string;
    reason: string;
    input_decoded?: string;
    decoded_model?: DecodedModel;
    input_raw?: string;
    tip?: string;
  };
  message?: string;
}

export interface DebugPayload {
  chain_type?: 'evm' | 'solana';
  rpc_url?: string;
  tx_hash?: string;
  block?: string;
  data?: {
    from: string;
    to: string;
    data: string;
    value: string | number;
  };
}
