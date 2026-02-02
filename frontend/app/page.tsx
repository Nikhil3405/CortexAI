"use client";

import { useState } from "react";
import { apiRequest } from "./lib/api"; // Updated path to match standard project structure
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // 🔹 Added Email Validation Helper
  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // 🔹 Improved Validation Logic
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address (e.g., name@example.com)");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (!isLogin && !acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy");
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? "/login" : "/register";
    try {
      // 🔹 Sending validated data to backend
      const response = await apiRequest(endpoint, "POST", { 
        email: email.toLowerCase().trim(), // Normalize email
        password: password 
      });
      
      if (isLogin) {
        router.push("/chat");
      } else {
        setIsLogin(true);
        setError("Account created! Please log in.");
        setEmail("");
        setPassword("");
        setAcceptedTerms(false);
      }
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || "Authentication failed";
      
      if (errorMessage.includes("already exists")) {
        setError("This email is already registered. Please log in instead.");
      } else if (errorMessage.includes("401") || errorMessage.includes("credentials")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // ... Rest of your UI remains exactly the same
  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white border-2 border-neutral-200 p-6 sm:p-8 rounded-3xl shadow-2xl">
        
        {/* CortexAI Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-4xl flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-lg">
            <Image 
              src="/favicon.ico" 
              alt="CortexAI" 
              width={56} 
              height={56}
              className="w-14 h-14 sm:w-16 sm:h-16"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            {isLogin ? "Welcome back" : "Create Account"}
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm px-4">
            {isLogin ? "Enter your credentials to access CortexAI" : "Join the future of document intelligence"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`p-3 rounded-xl text-sm ${
              error.includes("created") || error.includes("success")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              <div className="flex items-start gap-2">
                <span className="text-base">
                 {error.includes("created") || error.includes("success") ? (
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V6h2z" />
                    </svg>
)}

                </span>
                <p className="flex-1">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-100 outline-none transition-all text-sm sm:text-base"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              className="w-full bg-neutral-50 border-2 border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-100 outline-none transition-all text-sm sm:text-base"
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {!isLogin && (
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={loading}
                className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 text-neutral-900 bg-white border-2 border-neutral-300 rounded focus:ring-2 focus:ring-neutral-400 focus:ring-offset-0 cursor-pointer disabled:opacity-50"
                required
              />
              <label htmlFor="terms" className="text-xs sm:text-sm text-neutral-700 cursor-pointer select-none">
                I agree to the{" "}
                <button type="button" className="text-neutral-900 font-semibold hover:underline" onClick={()=>router.push("/terms")}>Terms of Service</button>
                {" "}and{" "}
                <button type="button" className="text-neutral-900 font-semibold hover:underline" onClick={()=>router.push("/privacy")}>Privacy Policy</button>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-neutral-900 to-black text-white font-semibold py-3 sm:py-3.5 rounded-xl hover:from-neutral-800 hover:to-neutral-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              isLogin ? "Log In" : "Sign Up"
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setEmail("");
              setPassword("");
              setAcceptedTerms(false);
            }}
            type="button"
            disabled={loading}
            className="text-neutral-600 hover:text-neutral-900 text-xs sm:text-sm transition-colors font-medium disabled:opacity-50"
          >
            {isLogin ? "New to CortexAI? Create an account" : "Already have an account? Log in"}
          </button>
        </div>

        {isLogin && (
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-center text-xs text-neutral-400">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        )}
      </div>
    </div>
  );
}