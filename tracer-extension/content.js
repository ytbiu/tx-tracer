// content.js

let currentUrl = location.href;

function getChainType() {
  const hostname = window.location.hostname;
  if (hostname.includes("etherscan")) return "evm";
  if (hostname.includes("bscscan")) return "evm";
  if (hostname.includes("basescan")) return "evm";
  if (hostname.includes("solscan")) return "solana";
  if (hostname.includes("solana.com")) return "solana";
  return "evm"; // default
}

function getTxHash() {
  const path = window.location.pathname;
  // Solana signatures are base58 (alphanumeric), usually longer than EVM hashes
  // EVM: 0x... (66 chars)
  // Solana: ... (88 chars approx)
  // Use a broader match but exclude typical non-hash paths
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
  button.id = "tx-tracer-button"; // Set ID directly here

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
  // Prevent duplicate injection
  if (document.getElementById("tx-tracer-button")) return;

  const txHash = getTxHash();
  if (!txHash) return;

  const chainType = getChainType();
  const button = createButton(txHash, chainType);
  const hostname = window.location.hostname;

  // --- Etherscan / BscScan / BaseScan (EVM) ---
  if (chainType === "evm") {
    // 1. Try standard #spanTxHash (most reliable for Etherscan clones)
    const hashElement = document.querySelector("#spanTxHash");
    if (hashElement && hashElement.parentNode) {
      hashElement.parentNode.appendChild(button);
      return;
    }

    // 2. Fallback: Search for "Transaction Hash:" label
    const labels = Array.from(document.querySelectorAll("div, span, h6"));
    const txLabel = labels.find(
      (el) => el.innerText && el.innerText.trim() === "Transaction Hash:"
    );
    if (txLabel && txLabel.nextElementSibling) {
      txLabel.nextElementSibling.appendChild(button);
      return;
    }
  }

  // --- Solana Explorer (explorer.solana.com) ---
  if (hostname.includes("solana.com")) {
    // Look for table rows
    const rows = Array.from(document.querySelectorAll("tr"));
    // Find row with "Signature"
    const sigRow = rows.find(
      (row) => row.innerText && row.innerText.includes("Signature")
    );

    if (sigRow) {
      // Usually 1st cell is label, 2nd is value
      const valCell = sigRow.querySelector("td:nth-child(2)");
      if (valCell) {
        // Append to the cell, but check for flex container
        const flex = valCell.querySelector("div.d-flex, div.flex");
        if (flex) {
          flex.appendChild(button);
        } else {
          valCell.appendChild(button);
        }
        return;
      }
    }

    // Fallback: Look for any header/label "Signature"
    const labels = Array.from(
      document.querySelectorAll("td, th, div, span, h2, h3")
    );
    const sigLabel = labels.find(
      (el) => el.innerText && el.innerText.trim() === "Signature"
    );
    if (sigLabel && sigLabel.nextElementSibling) {
      sigLabel.nextElementSibling.appendChild(button);
      return;
    }
  }

  // --- Solscan (solscan.io) ---
  if (hostname.includes("solscan")) {
    // Solscan 2.0 (new UI) and old UI differ.
    // Try to find "Signature" label or "Transaction Hash"

    // Search for "Signature" label
    const labels = Array.from(document.querySelectorAll("div"));
    const sigLabel = labels.find(
      (el) =>
        el.innerText &&
        (el.innerText.trim() === "Signature" ||
          el.innerText.trim() === "Transaction Hash")
    );

    if (sigLabel && sigLabel.parentElement) {
      const parent = sigLabel.parentElement;
      // In grid layout, it might be next sibling
      if (parent.nextElementSibling) {
        parent.nextElementSibling.appendChild(button);
        return;
      }
      // Sometimes label and value are in the same parent flex container
      parent.appendChild(button);
      return;
    }
  }
}

// Observer for SPA changes and dynamic loading
const observer = new MutationObserver((mutations) => {
  // Check if URL changed (SPA navigation)
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    // Remove old button if exists (though it might be gone with DOM change)
    const oldBtn = document.getElementById("tx-tracer-button");
    if (oldBtn) oldBtn.remove();
    // Force re-injection
    injectButton();
  } else {
    // URL same, but DOM changed. Try to inject if not present.
    injectButton();
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Initial run
injectButton();
