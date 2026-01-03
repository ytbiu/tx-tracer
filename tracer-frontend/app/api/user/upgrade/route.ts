import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyAndRedeemCode } from "@/lib/invites";
import { upgradeUserToVip } from "@/lib/usage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const isValid = verifyAndRedeemCode(code, session.user.email);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid invitation code" },
        { status: 400 }
      );
    }

    upgradeUserToVip(session.user.email, code);

    return NextResponse.json({
      success: true,
      message: "User upgraded to VIP",
    });
  } catch (error) {
    console.error("Error upgrading user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
