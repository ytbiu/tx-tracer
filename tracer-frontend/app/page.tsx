"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Header } from "../components/Header";
import { InputForm } from "../components/InputForm";
import { ABITool } from "../components/ABITool";
import { TraceResult } from "../components/TraceResult";
import { api } from "../services/api";
import { DebugResponse, DecodedModel, DebugPayload } from "../types";

export default function Home() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  // Removed invite code auth logic

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResponse | null>(null);

  // Form State
  const [chainType, setChainType] = useState<"evm" | "solana">("evm");
  const [chainId, setChainId] = useState(56);
  const [block, setBlock] = useState("latest");
  const [txFrom, setTxFrom] = useState("");
  const [txTo, setTxTo] = useState("");
  const [txValue, setTxValue] = useState("0");
  const [txData, setTxData] = useState("");

  const [decodedInput, setDecodedInput] = useState<string | null>(null);

  // Input Mode
  const [inputMode, setInputMode] = useState<"custom" | "hash">("custom");
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    const chain = searchParams.get("chain");
    const tx = searchParams.get("tx") || searchParams.get("hash");

    if (chain) {
      const type = chain as "evm" | "solana";
      setChainType(type);

      if (type === "solana") {
        setChainId(-1); // Use -1 or other indicator for Solana
      } else {
        setChainId(56); // Default to BNB
      }
    }

    if (tx) {
      setTxHash(tx);
      setInputMode("hash");
    }
  }, [searchParams]);

  // Tool State
  const [toolMode, setToolMode] = useState<"decode" | "encode">("decode");
  const [toolInputHex, setToolInputHex] = useState("");
  const [toolSignature, setToolSignature] = useState("");
  const [toolArgs, setToolArgs] = useState("");
  const [toolResult, setToolResult] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleInviteSubmit = async () => {
    if (!inviteCode) return;
    setIsUpgrading(true);
    setInviteError("");

    try {
      const res = await fetch("/api/user/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowInviteModal(false);
        setInviteCode("");
        // Retry the debug operation if possible, or just let user click again
        alert(
          "Upgrade successful! You can now use the tool without daily limits."
        );
      } else {
        setInviteError(data.error || "Invalid invitation code");
      }
    } catch (e) {
      setInviteError("Failed to verify code");
    } finally {
      setIsUpgrading(false);
    }
  };

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

  const openInviteModal = () => {
    setShowInviteModal(true);
  };

  const handleDebug = async () => {
    setLoading(true);
    setResult(null);
    setDecodedInput(null);

    try {
      if (inputMode === "hash") {
        if (!txHash) {
          setResult({
            success: false,
            message: "Please enter a transaction hash.",
          });
          setLoading(false);
          return;
        }

        // Format validation
        if (chainType === "evm") {
          if (!txHash.startsWith("0x")) {
            // Try to be helpful: if it's hex but missing 0x, add it.
            // But if it looks like Solana (Base58), show error.
            const isHex = /^[0-9A-Fa-f]+$/.test(txHash);
            if (isHex && txHash.length === 64) {
              setTxHash("0x" + txHash);
              // Proceed with 0x added
            } else {
              setResult({
                success: false,
                message:
                  "Invalid EVM transaction hash. Must start with '0x' and be 66 characters long.",
              });
              setLoading(false);
              return;
            }
          } else if (txHash.length !== 66) {
            setResult({
              success: false,
              message: `Invalid EVM transaction hash length (${txHash.length}). Expected 66 characters.`,
            });
            setLoading(false);
            return;
          }
        } else if (chainType === "solana") {
          // Basic Base58 check (alphanumeric, no 0, O, I, l) - but just length check is usually enough for UX
          if (txHash.length < 30 || txHash.length > 100) {
            setResult({
              success: false,
              message: "Invalid Solana transaction signature length.",
            });
            setLoading(false);
            return;
          }
        }
      }

      const payload: DebugPayload = {
        chain_type: chainType,
        chain_id: chainId,
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

      // Check for rate limit error
      if (
        data &&
        data.success === false &&
        data.message &&
        data.message.includes("Daily limit exceeded")
      ) {
        setShowInviteModal(true);
        setResult({
          success: false,
          message: data.message,
        });
        return;
      }

      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({
        success: false,
        message: "Failed to connect to backend server or API error.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8 flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Header showLoginAction={false} />
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Authentication Required</h2>
              <p className="text-gray-500">
                Please sign in with GitHub to access the Transaction Tracer.
              </p>
            </div>
            <button
              onClick={() => signIn("github")}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              Sign in with GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Header onOpenInviteModal={openInviteModal} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invite Code Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-red-600">
                    Daily Limit Exceeded
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    You have reached the daily limit of 3 trace calls. Please
                    enter an invitation code to upgrade your account and
                    continue using the tool.
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter invitation code"
                    className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                  {inviteError && (
                    <p className="text-sm text-red-500">{inviteError}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteSubmit}
                    disabled={isUpgrading || !inviteCode}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors"
                  >
                    {isUpgrading ? "Verifying..." : "Upgrade Account"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Left Column: Input Form & Tools */}
          <div className="lg:col-span-1 space-y-6">
            <InputForm
              chainType={chainType}
              setChainType={setChainType}
              chainId={chainId}
              setChainId={setChainId}
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
            {result && result.success === false ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-900/50 p-6 space-y-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-red-600">Error</h3>
                  {result.message?.includes("Daily limit") && (
                    <button
                      onClick={openInviteModal}
                      className="text-sm text-blue-600 hover:underline cursor-pointer ml-2"
                    >
                      (Enter Invite Code)
                    </button>
                  )}
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-red-600 whitespace-pre-wrap">
                    {result.message}
                  </pre>
                </div>
              </div>
            ) : (
              <TraceResult
                result={result}
                loading={loading}
                loadIntoEncoder={loadIntoEncoder}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
