import React from "react";

interface ABIToolProps {
  toolMode: "decode" | "encode";
  setToolMode: (mode: "decode" | "encode") => void;
  toolInputHex: string;
  setToolInputHex: (val: string) => void;
  toolSignature: string;
  setToolSignature: (val: string) => void;
  toolArgs: string;
  setToolArgs: (val: string) => void;
  toolResult: string;
  handleToolDecode: () => void;
  handleToolEncode: () => void;
  setTxData: (val: string) => void;
}

export const ABITool: React.FC<ABIToolProps> = ({
  toolMode,
  setToolMode,
  toolInputHex,
  setToolInputHex,
  toolSignature,
  setToolSignature,
  toolArgs,
  setToolArgs,
  toolResult,
  handleToolDecode,
  handleToolEncode,
  setTxData,
}) => {
  return (
    <div
      id="tools-section"
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit"
    >
      <h2 className="text-xl font-semibold mb-4">ABI Tool</h2>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setToolMode("decode")}
          className={`flex-1 py-1 px-2 rounded text-sm font-medium transition-colors ${
            toolMode === "decode"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          }`}
        >
          Decode
        </button>
        <button
          onClick={() => setToolMode("encode")}
          className={`flex-1 py-1 px-2 rounded text-sm font-medium transition-colors ${
            toolMode === "encode"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          }`}
        >
          Encode
        </button>
      </div>

      {toolMode === "decode" ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">
              Input Data (Hex)
            </label>
            <textarea
              value={toolInputHex}
              onChange={(e) => setToolInputHex(e.target.value)}
              rows={4}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono break-all"
              placeholder="0x..."
            />
          </div>
          <button
            onClick={handleToolDecode}
            className="w-full py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
          >
            Decode
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">
              Function Signature
            </label>
            <input
              type="text"
              value={toolSignature}
              onChange={(e) => setToolSignature(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
              placeholder="transfer(address,uint256)"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">
              Arguments (comma separated)
            </label>
            <textarea
              value={toolArgs}
              onChange={(e) => setToolArgs(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
              placeholder="0x123..., 1000000000"
            />
          </div>
          <button
            onClick={handleToolEncode}
            className="w-full py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
          >
            Encode
          </button>
        </div>
      )}

      {toolResult && (
        <div className="mt-4">
          <label className="block text-xs font-medium mb-1 text-gray-500">
            Result
          </label>
          <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 text-xs font-mono whitespace-pre-wrap overflow-x-auto break-all">
            {toolResult}
          </div>
          {toolMode === "encode" && !toolResult.startsWith("Error") && (
            <button
              onClick={() => {
                setTxData(toolResult);
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Use in Transaction
            </button>
          )}
        </div>
      )}
    </div>
  );
};
