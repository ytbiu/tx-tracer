import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USAGE_FILE = path.join(DATA_DIR, "usage.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface UserUsage {
  count: number;
  date: string; // YYYY-MM-DD
  is_vip?: boolean;
  invite_code?: string; // The code used to become VIP
}

interface UsageData {
  [email: string]: UserUsage;
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function readUsageData(): UsageData {
  if (!fs.existsSync(USAGE_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(USAGE_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading usage file:", error);
    return {};
  }
}

function writeUsageData(data: UsageData): void {
  try {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing usage file:", error);
  }
}

export function checkUsageLimit(email: string): {
  allowed: boolean;
  remaining: number;
  is_vip?: boolean;
} {
  const usageData = readUsageData();
  const today = getTodayDate();
  const userUsage = usageData[email] || { count: 0, date: today };

  // If VIP, check if invite code is still valid
  if (userUsage.is_vip) {
    // If we have an invite code stored, check its validity against ENV
    // If no invite code stored (legacy VIP), we might want to allow or disallow.
    // Let's assume strict mode: must have valid invite code.
    // BUT for backward compatibility or manual VIPs, we might need a flag.
    // For now, let's just check if the code exists in ENV if it was recorded.

    if (userUsage.invite_code) {
      const envCodesStr = process.env.INVITE_CODES;
      if (envCodesStr) {
        const allowedCodes = envCodesStr.split(",").map((c) => c.trim());
        if (!allowedCodes.includes(userUsage.invite_code)) {
          // Code is no longer valid, downgrade user
          userUsage.is_vip = false;
          // Don't save immediately to avoid disk IO on every read,
          // but here we are returning status, so maybe we should save to persist downgrade?
          // Let's NOT save automatically here to avoid side effects in a "check" function,
          // but effectively they are blocked.
          // Actually, if we don't save, they will be checked every time. That's fine.
          return { allowed: false, remaining: 0, is_vip: false };
        }
      }
    }

    return { allowed: true, remaining: 999999, is_vip: true };
  }

  // Reset if it's a new day
  if (userUsage.date !== today) {
    userUsage.count = 0;
    userUsage.date = today;
  }

  if (userUsage.count >= 3) {
    return { allowed: false, remaining: 0, is_vip: false };
  }

  return { allowed: true, remaining: 3 - userUsage.count, is_vip: false };
}

export function incrementUsage(email: string): { remaining: number } {
  const usageData = readUsageData();
  const today = getTodayDate();
  const userUsage = usageData[email] || { count: 0, date: today };

  // If VIP, do nothing or just return max remaining
  if (userUsage.is_vip) {
    return { remaining: 999999 };
  }

  // Reset if it's a new day
  if (userUsage.date !== today) {
    userUsage.count = 0;
    userUsage.date = today;
  }

  userUsage.count += 1;
  usageData[email] = userUsage;
  writeUsageData(usageData);

  return { remaining: 3 - userUsage.count };
}

export function upgradeUserToVip(email: string, inviteCode: string): void {
  const usageData = readUsageData();
  const today = getTodayDate();
  const userUsage = usageData[email] || { count: 0, date: today };

  userUsage.is_vip = true;
  userUsage.invite_code = inviteCode;
  usageData[email] = userUsage;
  writeUsageData(usageData);
}

export function checkAndIncrementUsage(email: string): {
  allowed: boolean;
  remaining: number;
} {
  const check = checkUsageLimit(email);
  if (!check.allowed) return check;

  const inc = incrementUsage(email);
  return { allowed: true, remaining: inc.remaining };
}

export function getUsage(email: string): { count: number; date: string } {
  const usageData = readUsageData();
  const today = getTodayDate();
  const userUsage = usageData[email] || { count: 0, date: today };

  if (userUsage.date !== today) {
    return { count: 0, date: today };
  }

  return userUsage;
}
