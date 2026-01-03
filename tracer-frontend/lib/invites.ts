import fs from "fs";
import path from "path";

interface InviteCode {
  used: boolean;
  disabled?: boolean;
  usedBy?: string; // email
  usedAt?: string; // date
}

interface CodesData {
  [code: string]: InviteCode;
}

const DATA_DIR =
  process.env.NODE_ENV === "production"
    ? "/tmp/data"
    : path.join(process.cwd(), "data");
const CODES_FILE = path.join(DATA_DIR, "invites.json");

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    console.warn(
      "Failed to create data directory, invites persistence may fail:",
      error
    );
  }
}

function getInitialCodes(): CodesData {
  const initialCodes: CodesData = {};
  // Load codes from environment variable if available
  // Format: INVITE_CODES=CODE1,CODE2,CODE3
  const envCodes = process.env.INVITE_CODES?.split(",") || [];
  envCodes.forEach((code) => {
    const trimmedCode = code.trim();
    if (trimmedCode) {
      initialCodes[trimmedCode] = { used: false };
    }
  });
  return initialCodes;
}

function readCodesData(): CodesData {
  ensureDataDir();
  if (!fs.existsSync(CODES_FILE)) {
    // Return initial codes from ENV if file doesn't exist
    return getInitialCodes();
  }
  try {
    const data = fs.readFileSync(CODES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading invites file:", error);
    return getInitialCodes();
  }
}

function writeCodesData(data: CodesData): void {
  ensureDataDir();
  try {
    fs.writeFileSync(CODES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing invites file:", error);
  }
}

export function verifyAndRedeemCode(code: string, email: string): boolean {
  // 1. Check against environment variables (Source of Truth for existence)
  // If INVITE_CODES is set, the code MUST be in it to be valid.
  const envCodesStr = process.env.INVITE_CODES;
  if (envCodesStr) {
    const allowedCodes = envCodesStr.split(",").map((c) => c.trim());
    if (!allowedCodes.includes(code)) {
      return false; // Code removed from env or not exists
    }
  }

  // 2. Check/Sync with local data store (Source of Truth for state)
  const codesData = readCodesData();
  let codeEntry = codesData[code];

  // If in env but not in file (newly added via env), initialize it
  if (!codeEntry) {
    codeEntry = { used: false };
    // Optionally persist it immediately
    codesData[code] = codeEntry;
    writeCodesData(codesData);
  }

  if (codeEntry.disabled) {
    return false;
  }

  // We can decide if codes are single-use or multi-use.
  // For now, allow reuse as per original logic comments.
  // if (codeEntry.used) return false;

  // Log usage (best effort persistence)
  // codeEntry.used = true;
  // codeEntry.usedBy = email;
  // codeEntry.usedAt = new Date().toISOString();
  // writeCodesData(codesData);

  return true;
}
