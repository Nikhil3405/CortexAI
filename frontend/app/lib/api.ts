export async function apiRequest(
  url: string,
  method: string,
  body?: any
) {
  const headers: HeadersInit = {};

  // ❌ DO NOT set Content-Type for FormData
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${url}`,
    {
      method,
      headers,
      body: body instanceof FormData ? body : JSON.stringify(body),
      credentials: "include", // 🔥 REQUIRED
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || err.message || "Request failed");
  }

  return res.json();
}
