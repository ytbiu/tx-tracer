import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CODES_FILE = path.join(DATA_DIR, "invites.json");

// Initialize with some codes if not exists
if (!fs.existsSync(CODES_FILE)) {
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

  // Ensure data dir exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(CODES_FILE, JSON.stringify(initialCodes, null, 2));
}

interface InviteCode {
  used: boolean;
  disabled?: boolean;
  usedBy?: string; // email
  usedAt?: string; // date
}

interface CodesData {
  [code: string]: InviteCode;
}

function readCodesData(): CodesData {
  if (!fs.existsSync(CODES_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(CODES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading invites file:", error);
    return {};
  }
}

function writeCodesData(data: CodesData): void {
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
    // Optionally persist it immediately, or just use it in memory for this check
    // Persisting is better to track usage later
    codesData[code] = codeEntry;
    writeCodesData(codesData);
  }

  if (codeEntry.disabled) {
    return false;
  }

  // We can decide if codes are single-use or multi-use.
  // For simplicity, let's say they are multi-use for now unless we want strict single-use.
  // The user prompt said "If filled correctly, can continue to use", didn't specify single-use.
  // But usually invite codes are one-time or limited.
  // Let's assume these specific hardcoded ones are multi-use for now to make testing easier,
  // or we can make them single-use but provide many.
  // Let's make them reusable for now since I only added 3.

  // If we wanted single use:
  // if (codeEntry.used) return false;

  // Log usage
  // codeEntry.used = true;
  // codeEntry.usedBy = email;
  // codeEntry.usedAt = new Date().toISOString();
  // writeCodesData(codesData);

  return true;
}
