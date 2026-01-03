import React from "react";

interface InputFormProps {
  chainType: "evm" | "solana";
  setChainType: (val: "evm" | "solana") => void;
  rpcUrl: string;
  setRpcUrl: (val: string) => void;
  block: string;
  setBlock: (val: string) => void;
  inputMode: "custom" | "hash";
  setInputMode: (mode: "custom" | "hash") => void;
  txHash: string;
  setTxHash: (val: string) => void;
  txFrom: string;
  setTxFrom: (val: string) => void;
  txTo: string;
  setTxTo: (val: string) => void;
  txValue: string;
  setTxValue: (val: string) => void;
  txData: string;
  setTxData: (val: string) => void;
  decodedInput: string | null;
  handleDecode: () => void;
  loading: boolean;
  handleDebug: () => void;
}

export const InputForm: React.FC<InputFormProps> = ({
  chainType,
  setChainType,
  rpcUrl,
  setRpcUrl,
  block,
  setBlock,
  inputMode,
  setInputMode,
  txHash,
  setTxHash,
  txFrom,
  setTxFrom,
  txTo,
  setTxTo,
  txValue,
  setTxValue,
  txData,
  setTxData,
  decodedInput,
  handleDecode,
  loading,
  handleDebug,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
      <h2 className="text-xl font-semibold mb-4">Configuration</h2>

      <div className="flex space-x-2 mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        <button
          onClick={() => setChainType("evm")}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
            chainType === "evm"
              ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
          }`}
        >
          EVM (Ethereum)
        </button>
        <button
          onClick={() => {
            setChainType("solana");
            setInputMode("hash"); // Force hash mode for Solana initially
          }}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
            chainType === "solana"
              ? "bg-white dark:bg-gray-600 shadow-sm text-purple-600 dark:text-purple-300"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
          }`}
        >
          Solana
        </button>
      </div>

      <div className="flex space-x-2 mb-6">
        {chainType === "evm" && (
          <button
            onClick={() => setInputMode("custom")}
            className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors ${
              inputMode === "custom"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            Custom Simulation
          </button>
        )}
        <button
          onClick={() => setInputMode("hash")}
          className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors ${
            inputMode === "hash"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          }`}
        >
          Existing Transaction
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">RPC URL</label>
          <input
            type="text"
            value={rpcUrl}
            onChange={(e) => setRpcUrl(e.target.value)}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            placeholder={
              chainType === "solana"
                ? "https://api.mainnet-beta.solana.com"
                : "Default (from server environment)"
            }
          />
        </div>

        {inputMode === "custom" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Block Number
            </label>
            <input
              type="text"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="latest or 123456"
            />
          </div>
        )}

        <hr className="border-gray-200 dark:border-gray-700" />

        {inputMode === "custom" && chainType === "evm" ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">From</label>
              <input
                type="text"
                value={txFrom}
                onChange={(e) => setTxFrom(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                placeholder="0x..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">To</label>
              <input
                type="text"
                value={txTo}
                onChange={(e) => setTxTo(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                placeholder="0x..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Value (Wei)
              </label>
              <input
                type="text"
                value={txValue}
                onChange={(e) => setTxValue(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Data (Calldata)
              </label>
              <textarea
                value={txData}
                onChange={(e) => setTxData(e.target.value)}
                rows={6}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono break-all"
                placeholder="0x..."
              />
              <button
                onClick={handleDecode}
                disabled={!txData}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Try Decode Input
              </button>
              {decodedInput && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                  {decodedInput}
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">
              Transaction Hash
            </label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
              placeholder={
                chainType === "solana" ? "Base58 Signature..." : "0x..."
              }
            />
          </div>
        )}

        <button
          onClick={handleDebug}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading
            ? "Processing..."
            : inputMode === "hash"
            ? "Trace Transaction"
            : "Simulate Transaction"}
        </button>
      </div>
    </div>
  );
};
