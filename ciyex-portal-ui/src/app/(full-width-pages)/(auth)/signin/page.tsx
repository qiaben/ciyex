"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { signIn } from "next-auth/react";

interface Org {
  orgId: number;
  orgName: string;
  role: string;
}

interface PortalLoginResponse {
  token: string;
  userId: number;
  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  orgs: Org[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/portal/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data: ApiResponse<PortalLoginResponse> = await res.json();
      if (!data.success || !data.data) throw new Error(data.message);

      const user = data.data;

      localStorage.setItem("token", user.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("orgs", JSON.stringify(user.orgs));

      if (user.orgs?.length === 1) {
        localStorage.setItem("orgId", user.orgs[0].orgId.toString());
        localStorage.setItem("orgName", user.orgs[0].orgName);
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/patient-portal-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/70"></div>

      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        
        {/* Left Panel */}
        <div className="flex flex-col justify-center px-10 py-12 text-white bg-gradient-to-br from-purple-900 via-blue-700 to-cyan-500 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-blue-800/80 to-cyan-600/70"></div>
          <div className="relative z-10 space-y-8">
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
              ✨ Ciyex Connect
            </h1>
            <p className="text-xl font-semibold leading-snug">
              Your Health. <span className="font-extrabold">Your Control.</span>
            </p>
            <ul className="space-y-4 text-lg font-medium">
              <li className="flex items-center gap-3">
                <span className="text-3xl">🩺</span>
                <span>Access your medical history</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-3xl">📊</span>
                <span>Track labs & vitals</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-3xl">💊</span>
                <span>Manage prescriptions</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-3xl">📅</span>
                <span>Book appointments</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-3xl">🔒</span>
                <span>Secure messaging</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col justify-center p-10">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Sign In
            </h2>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-xs text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <a
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded mt-3 hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.2 3-7.2 0-.6 0-1.1-.1-1.6H12z"/>
                <path fill="#34A853" d="M6.5 14.7c-.4-1.2-.4-2.4 0-3.6L3.3 8.6c-1 2-1 4.8 0 6.8l3.2-0.7z"/>
                <path fill="#4285F4" d="M12 4.8c1.1 0 2.1.4 2.9 1.2l2.6-2.6C15.5 1.7 13.8 1 12 1 7.6 1 3.8 3.9 2.3 8.2l3.2 2.5C6.6 7.3 9.1 4.8 12 4.8z"/>
                <path fill="#FBBC05" d="M12 22c2.8 0 5.2-1 7-2.6l-3.2-2.5c-.9.6-2 1-3.2 1-2.9 0-5.4-2.4-6.5-5.7L2.3 15.8C3.8 20.1 7.6 22 12 22z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <a href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
