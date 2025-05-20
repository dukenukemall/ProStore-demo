import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  // Get the cookies
  const cookieStore = await cookies();
  const sessionCartId = cookieStore.get("sessionCartId");

  return NextResponse.json({
    sessionCartId: sessionCartId?.value || "No session cart ID found",
    timestamp: new Date().toISOString(),
  });
}
