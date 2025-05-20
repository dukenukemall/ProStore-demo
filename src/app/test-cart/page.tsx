"use client";

import { useEffect, useState } from "react";

export default function TestCartPage() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCartId() {
      try {
        const response = await fetch("/api/session-cart");
        const data = await response.json();
        setCartId(data.sessionCartId);
      } catch (error) {
        console.error("Error fetching session cart ID:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCartId();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Cart ID Test</h1>

      {loading ? (
        <div>Loading session cart ID...</div>
      ) : (
        <div>
          <p className="mb-2">
            <strong>Your Session Cart ID:</strong>
          </p>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            {cartId || "No session cart ID found"}
          </pre>
          <p className="mt-4 text-sm text-gray-600">
            This ID will be persistent across page reloads and browser sessions,
            allowing you to maintain a cart even when not logged in.
          </p>
        </div>
      )}
    </div>
  );
}
