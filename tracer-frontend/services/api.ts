import { DebugPayload } from "../types";

const API_BASE_URL = "http://localhost:8080";

export const api = {
  decode: async (input: string) => {
    const res = await fetch(`${API_BASE_URL}/decode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });
    return res.json();
  },

  encode: async (signature: string, args: string[]) => {
    const res = await fetch(`${API_BASE_URL}/encode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature, args }),
    });
    return res.json();
  },

  debug: async (payload: DebugPayload, block: string) => {
    const res = await fetch(`${API_BASE_URL}/debug?block=${block}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
