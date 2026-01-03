import { DebugPayload } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = {
  decode: async (input: string) => {
    const res = await fetch(`/api/trace/decode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });
    return res.json();
  },

  encode: async (signature: string, args: string[]) => {
    const res = await fetch(`/api/trace/encode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature, args }),
    });
    return res.json();
  },

  debug: async (payload: DebugPayload, block: string) => {
    const res = await fetch(`/api/trace/debug?block=${block}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
