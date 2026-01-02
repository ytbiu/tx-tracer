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
