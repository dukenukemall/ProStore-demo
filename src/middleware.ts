import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the session cart ID cookie exists
  const sessionCartId = request.cookies.get("sessionCartId");

  // Create a response object to modify
  const response = NextResponse.next();

  // If there's no session cart ID, create one
  if (!sessionCartId) {
    // Generate a new UUID for the session cart ID
    const newSessionCartId = crypto.randomUUID();

    // Set the cookie in the response with a long expiration time
    response.cookies.set("sessionCartId", newSessionCartId, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });
  }

  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
