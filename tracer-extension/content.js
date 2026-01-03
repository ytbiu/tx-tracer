// content.js

function getChainType() {
  const hostname = window.location.hostname;
  if (hostname.includes("etherscan")) return "evm";
  if (hostname.includes("bscscan")) return "evm";
  if (hostname.includes("solscan")) return "solana";
  return "evm"; // default
}

function getTxHash() {
  const path = window.location.pathname;
  // Matches /tx/0x... or /tx/5... (solana)
  const match = path.match(/\/tx\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

function createButton(txHash, chainType) {
  const button = document.createElement("a");
  button.href = `https://tx-tracer.vercel.app/?chain=${chainType}&tx=${txHash}`;
  button.target = "_blank";
  button.innerText = "Trace with Tx-Tracer";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.backgroundColor = "#000"; // Black background
  button.style.color = "#fff"; // White text
  button.style.padding = "6px 12px";
  button.style.borderRadius = "6px";
  button.style.fontSize = "13px";
  button.style.fontWeight = "500";
  button.style.marginLeft = "8px";
  button.style.textDecoration = "none";
  button.style.border = "1px solid #333";
  button.style.cursor = "pointer";
  button.style.transition = "opacity 0.2s";

  // Hover effect
  button.onmouseover = () => {
    button.style.opacity = "0.8";
  };
  button.onmouseout = () => {
    button.style.opacity = "1";
  };

  return button;
}

function injectButton() {
  const txHash = getTxHash();
  if (!txHash) return;

  const chainType = getChainType();
  const button = createButton(txHash, chainType);

  // Etherscan / BscScan injection logic
  // Target the element usually containing other tools or the copy button area
  // Etherscan typically has a span with id="spanTxHash" or similar containers.
  // We'll try to find a generic location near the Tx Hash.

  // Method 1: Try to find the "Sponsored" or "Tools" section, or just append after the Tx Hash
  // This varies by explorer version, so we try a few selectors.

  // Selector for Etherscan/BscScan (usually right after the hash or in the same row)
  const hashElement = document.querySelector("#spanTxHash");
  if (hashElement && hashElement.parentNode) {
    // Append next to the copy icon
    hashElement.parentNode.appendChild(button);
    return;
  }

  // Fallback: Try finding by text "Transaction Hash:"
  // This is more robust but heavier.
  const labels = Array.from(document.querySelectorAll("div, span, h6"));
  const txLabel = labels.find(
    (el) => el.innerText && el.innerText.trim() === "Transaction Hash:"
  );
  if (txLabel && txLabel.nextElementSibling) {
    txLabel.nextElementSibling.appendChild(button);
  }
}

// Run injection
// Wait a bit for dynamic content if needed, though run_at document_end helps.
setTimeout(injectButton, 1000);
