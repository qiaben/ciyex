"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const LOGIN_PATH = "/api/auth/login";
const LOGIN_URL = `${API_URL}${LOGIN_PATH}`;

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRole = (searchParams.get("role") || "").toLowerCase();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("[SignIn] Submitting credentials:", form);

      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("[SignIn] Error parsing JSON:", jsonErr);
        setError("Invalid server response.");
        setLoading(false);
        return;
      }

      console.log("[SignIn] API response:", data);

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (data.data?.token) {
        localStorage.setItem("jwt", data.data.token);
        console.log("[SignIn] Token stored in localStorage");
      } else {
        console.warn("[SignIn] No token in response");
      }

      const rawRoles = data.data?.roles || [];
      console.log("[SignIn] Raw roles from API:", rawRoles);

      // Convert all roles to lowercase for safe comparison
      const userRoles: string[] = rawRoles
          .map((r: string) => r && r.toLowerCase())
          .filter(Boolean);

      console.log("[SignIn] userRoles (lowercased and filtered):", userRoles);
      console.log("[SignIn] urlRole from query string:", urlRole);

      if (urlRole && userRoles.includes(urlRole)) {
        console.log(`[SignIn] Redirecting to /${urlRole} (user has role)`);
        router.push(`/${urlRole}`);
      } else if (urlRole && !userRoles.includes(urlRole)) {
        console.warn(`[SignIn] User does NOT have urlRole: ${urlRole}`);
        setError(`You do not have access as ${urlRole}.`);
        setLoading(false);
        return;
      } else if (userRoles.length > 0 && !!userRoles[0]) {
        console.log(`[SignIn] Redirecting to /${userRoles[0]} (first user role)`);
        router.push(`/${userRoles[0]}`);
      } else {
        console.warn("[SignIn] No valid roles found. Redirecting to /dashboard");
        router.push("/dashboard");
      }
      setLoading(false);
    } catch (err) {
      console.error("[SignIn] Unexpected error during login:", err);
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-900/95 shadow-2xl rounded-lg p-8 space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">Sign In</h2>
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10b981] hover:bg-[#0e9e6e] text-white font-bold py-2 px-4 rounded"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        {/* Loading Overlay */}
        {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">Logging in...</div>
              </div>
            </div>
        )}

        {/* Error Overlay */}
        {error && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <div className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Sign In Error</div>
                <div className="text-gray-700 dark:text-gray-200 mb-4">{error}</div>
                <button
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    onClick={() => setError(null)}
                >
                  Try Again
                </button>
              </div>
            </div>
        )}
      </div>
  );
}
