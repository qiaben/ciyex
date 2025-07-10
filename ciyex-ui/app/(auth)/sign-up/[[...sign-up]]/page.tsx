"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Pull AUTH_URL from your .env.local
const AUTH_URL = process.env.AUTH_URL!; // The ! assumes it's always defined

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams?.get('role') || '';

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: role,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect after successful signup
  const handleRedirect = () => {
    if (form.role === 'doctor') {
      router.push('/doctor-registration');
    } else {
      router.push('/patient/registration');
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to sign up.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      // Save JWT if present (modify as needed for your app)
      if (data.token) {
        localStorage.setItem("jwt", data.token);
      }
      setLoading(false);
      handleRedirect();
    } catch (err: any) {
      setError("Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md">
          <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-900/95 shadow-2xl rounded-lg p-8 space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">Sign Up</h2>
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
            <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
            />
            <input
                type="hidden"
                name="role"
                value={form.role}
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10b981] hover:bg-[#0e9e6e] text-white font-bold py-2 px-4 rounded"
            >
              {loading ? "Registering..." : "Sign Up"}
            </button>
          </form>
        </div>
        {/* Loading Overlay */}
        {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">Setting up your account...</div>
              </div>
            </div>
        )}
        {/* Error Overlay */}
        {error && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <div className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Sign Up Error</div>
                <div className="text-gray-700 dark:text-gray-200 mb-4">{error}</div>
                <button
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-600"
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
