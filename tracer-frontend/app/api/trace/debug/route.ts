import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkUsageLimit, incrementUsage } from "@/lib/usage";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check limit BEFORE calling backend
  const check = checkUsageLimit(session.user.email);

  if (!check.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Daily limit exceeded (3 calls per day for free plan)",
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const url = new URL(request.url);
    const block = url.searchParams.get("block");

    // Resolve RPC URL from chain_id if provided
    if (body.chain_id) {
      // Map chain_id to RPC URL env var
      const envKey = `RPC_URL_${body.chain_id}`;
      const rpcUrl = process.env[envKey];

      if (rpcUrl) {
        body.rpc_url = rpcUrl;
      } else if (body.chain_id === 56) {
        // Fallback for BNB Chain (56) using default env or hardcoded public RPC
        body.rpc_url =
          process.env.NEXT_PUBLIC_DEFAULT_RPC_URL ||
          "https://binance.llamarpc.com";
      }
    }

    const backendUrl = `${API_BASE_URL}/debug${block ? `?block=${block}` : ""}`;

    const authUser = process.env.BASIC_AUTH_USER;
    const authPass = process.env.BASIC_AUTH_PASS;

    if (!authUser || !authPass) {
      console.error("Missing Basic Auth credentials in environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const authString = Buffer.from(`${authUser}:${authPass}`).toString(
      "base64"
    );

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      // Pass through backend errors (do NOT increment usage)
      const errorText = await res.text();
      return NextResponse.json(
        { error: errorText || "Backend error" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Only increment usage if backend explicitly says success (or if we decide HTTP 200 is enough)
    // Here we check data.success if available, otherwise assume success on HTTP 200
    // Based on user request "fail doesn't count", if backend returns { success: false }, we shouldn't count it.
    let remaining = check.remaining;
    if (data.success !== false) {
      const inc = incrementUsage(session.user.email);
      remaining = inc.remaining;
    }

    const response = NextResponse.json(data);
    response.headers.set("X-RateLimit-Remaining", remaining.toString());

    return response;
  } catch (error) {
    console.error("Error forwarding to backend:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to connect to backend server: ${errorMessage}` },
      { status: 500 }
    );
  }
}
