import React from "react";
import { DebugResponse, DecodedModel } from "../types";

interface TraceResultProps {
  result: DebugResponse | null;
  loading: boolean;
  loadIntoEncoder: (model: DecodedModel) => void;
}

export const TraceResult: React.FC<TraceResultProps> = ({
  result,
  loading,
  loadIntoEncoder,
}) => {
  if (!result && !loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-12 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-500">
        <p>Enter transaction details or hash to see the trace.</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div
        className={`p-4 rounded-lg border ${
          result.success
            ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
            : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
        }`}
      >
        <div className="flex justify-between items-center">
          <span>
            {result.success ? "Analysis Complete" : `Error: ${result.message}`}
          </span>
          {result.chain_id && (
            <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-1 rounded">
              Chain ID: {parseInt(result.chain_id, 16)} ({result.chain_id})
            </span>
          )}
        </div>
      </div>

      {/* Deepest Error Card */}
      {result.deepest_error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-900 overflow-hidden">
          <div className="bg-red-50 dark:bg-red-900/30 px-6 py-3 border-b border-red-100 dark:border-red-900 flex justify-between items-center">
            <h3 className="font-semibold text-red-700 dark:text-red-400">
              Root Cause Found
            </h3>
            <span className="text-xs font-mono bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-2 py-1 rounded">
              {result.deepest_error.reason || "Unknown Revert"}
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs uppercase text-gray-500 font-semibold">
                  Failing Contract
                </span>
                <p className="font-mono text-sm break-all">
                  {result.deepest_error.contract}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase text-gray-500 font-semibold">
                  Caller
                </span>
                <p className="font-mono text-sm break-all">
                  {result.deepest_error.caller}
                </p>
              </div>
            </div>

            {result.deepest_error.tip && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <strong>💡 Tip:</strong> {result.deepest_error.tip}
              </div>
            )}

            {result.deepest_error.input_decoded && (
              <div className="mt-4">
                <span className="text-xs uppercase text-gray-500 font-semibold block mb-2">
                  Decoded Call Arguments
                </span>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                  {result.deepest_error.input_decoded}
                </pre>
                {result.deepest_error.decoded_model && (
                  <button
                    onClick={() =>
                      loadIntoEncoder(result.deepest_error!.decoded_model!)
                    }
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  >
                    Load into Encoder
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Trace Log (All Calls) */}
      {result.full_trace && result.full_trace.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold">Full Execution Trace</h3>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-950 font-mono text-xs overflow-x-auto rounded-b-xl max-h-[600px] overflow-y-auto">
            {result.full_trace.map((item, idx) => (
              <div key={idx} className="mb-1">
                <div
                  className={`whitespace-pre py-1 px-2 rounded ${
                    item.is_error
                      ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 font-medium"
                      : "hover:bg-gray-100 dark:hover:bg-gray-900"
                  }`}
                >
                  {item.log}
                </div>
                {item.decoded && (
                  <div className="pl-4 pr-2 py-2 text-gray-500 dark:text-gray-400 text-[10px] border-l-2 border-gray-200 dark:border-gray-700 ml-4 mt-1 bg-white dark:bg-gray-900/50 rounded-r shadow-sm">
                    <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                      Function: {item.decoded.name}
                    </div>
                    <div className="grid gap-1">
                      {item.decoded.params.map((param, pIdx) => (
                        <div
                          key={pIdx}
                          className="grid grid-cols-[auto_1fr] gap-x-2"
                        >
                          <span className="text-gray-400 text-right min-w-[60px]">
                            {param.name || `arg${pIdx}`}:
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 font-mono break-all">
                            {param.value}
                            <span className="ml-2 text-gray-400 italic text-[9px] select-none">
                              {param.type}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
