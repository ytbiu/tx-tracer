import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const authUser = process.env.BASIC_AUTH_USER;
    const authPass = process.env.BASIC_AUTH_PASS;

    if (!authUser || !authPass) {
      console.error("Missing Basic Auth credentials");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const authString = Buffer.from(`${authUser}:${authPass}`).toString("base64");

    const res = await fetch(`${API_BASE_URL}/encode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Encode proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
