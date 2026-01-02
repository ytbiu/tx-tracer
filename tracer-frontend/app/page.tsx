"use client";

import { useState } from "react";
import { Header } from "../components/Header";
import { InputForm } from "../components/InputForm";
import { ABITool } from "../components/ABITool";
import { TraceResult } from "../components/TraceResult";
import { api, DebugPayload } from "../services/api";
import { DebugResponse, DecodedModel } from "../types";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResponse | null>(null);

  // Form State
  const [rpcUrl, setRpcUrl] = useState("");
  const [block, setBlock] = useState("latest");
  const [txFrom, setTxFrom] = useState("");
  const [txTo, setTxTo] = useState("");
  const [txValue, setTxValue] = useState("0");
  const [txData, setTxData] = useState("");

  const [decodedInput, setDecodedInput] = useState<string | null>(null);

  // Input Mode
  const [inputMode, setInputMode] = useState<"custom" | "hash">("custom");
  const [txHash, setTxHash] = useState("");

  // Tool State
  const [toolMode, setToolMode] = useState<"decode" | "encode">("decode");
  const [toolInputHex, setToolInputHex] = useState("");
  const [toolSignature, setToolSignature] = useState("");
  const [toolArgs, setToolArgs] = useState("");
  const [toolResult, setToolResult] = useState("");

  const handleToolDecode = async () => {
    if (!toolInputHex) return;
    try {
      const data = await api.decode(toolInputHex);
      setToolResult(data.decoded || "Failed to decode");
    } catch (e) {
      setToolResult("Error: " + e);
    }
  };

  const handleToolEncode = async () => {
    if (!toolSignature) return;
    try {
      // Parse args from CSV string (naive)
      const args = toolArgs
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");

      const data = await api.encode(toolSignature, args);
      if (data.encoded) {
        setToolResult(data.encoded);
      } else {
        setToolResult("Error: " + JSON.stringify(data));
      }
    } catch (e) {
      setToolResult("Error: " + e);
    }
  };

  const loadIntoEncoder = (model: DecodedModel) => {
    setToolMode("encode");
    const sig = `${model.name}(${model.params.map((p) => p.type).join(",")})`;
    setToolSignature(sig);
    setToolArgs(model.params.map((p) => p.value).join(", "));
    setToolResult("");
    // Scroll to tool
    document
      .getElementById("tools-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDecode = async () => {
    if (!txData) return;
    try {
      const data = await api.decode(txData);
      setDecodedInput(data.decoded);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDebug = async () => {
    setLoading(true);
    setResult(null);
    setDecodedInput(null);

    try {
      const payload: DebugPayload = {
        rpc_url: rpcUrl,
      };

      if (inputMode === "hash") {
        payload.tx_hash = txHash;
      } else {
        payload.data = {
          from: txFrom,
          to: txTo,
          data: txData,
          value: txValue,
        };
      }

      const data = await api.debug(payload, block);
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({
        success: false,
        message:
          "Failed to connect to backend server. Ensure backend is running on port 8080.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Input Form & Tools */}
          <div className="lg:col-span-1 space-y-6">
            <InputForm
              rpcUrl={rpcUrl}
              setRpcUrl={setRpcUrl}
              block={block}
              setBlock={setBlock}
              inputMode={inputMode}
              setInputMode={setInputMode}
              txHash={txHash}
              setTxHash={setTxHash}
              txFrom={txFrom}
              setTxFrom={setTxFrom}
              txTo={txTo}
              setTxTo={setTxTo}
              txValue={txValue}
              setTxValue={setTxValue}
              txData={txData}
              setTxData={setTxData}
              decodedInput={decodedInput}
              handleDecode={handleDecode}
              loading={loading}
              handleDebug={handleDebug}
            />

            <ABITool
              toolMode={toolMode}
              setToolMode={setToolMode}
              toolInputHex={toolInputHex}
              setToolInputHex={setToolInputHex}
              toolSignature={toolSignature}
              setToolSignature={setToolSignature}
              toolArgs={toolArgs}
              setToolArgs={setToolArgs}
              toolResult={toolResult}
              handleToolDecode={handleToolDecode}
              handleToolEncode={handleToolEncode}
              setTxData={setTxData}
            />
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2 space-y-6">
            <TraceResult
              result={result}
              loading={loading}
              loadIntoEncoder={loadIntoEncoder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
