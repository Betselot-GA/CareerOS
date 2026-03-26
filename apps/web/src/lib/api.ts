const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  async post<T>(path: string, body: unknown, withAuth = false): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(withAuth ? authHeaders() : {})
      },
      credentials: "include",
      body: JSON.stringify(body)
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message ?? "Request failed");
    return payload;
  },
  async patch<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      credentials: "include",
      body: JSON.stringify(body)
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message ?? "Request failed");
    return payload;
  },
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        ...authHeaders()
      },
      credentials: "include"
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message ?? "Request failed");
    return payload;
  }
};
