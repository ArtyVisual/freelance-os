"use client";

import Loader from "@/components/Loader";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });

    // no need to setLoading(false)
    // because page will redirect
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">
      <div className="w-full max-w-md mb-6 p-5 rounded-xl bg-gray-900 border border-blue-800 text-center">

        <p className="text-sm text-blue-400 mb-2">
          Demo Access for House of EdTech
        </p>

        <p className="text-xs text-gray-400 mb-4">
          Click below to autofill credentials and explore the system
        </p>

        <button
          onClick={() => {
            setEmail("test@gmail.com");
            setPassword("123456");
          }}
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-sm"
        >
          Use Demo Account
        </button>

        <button
          onClick={() =>
            signIn("credentials", {
              email: "test@gmail.com",
              password: "123456",
              callbackUrl: "/dashboard",
            })
          }
          className="w-full mt-2 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition text-sm"
        >
          Explore Instantly
        </button>

      </div>
      <div className="w-full max-w-md p-8 rounded-2xl bg-gray-900 shadow-lg border border-gray-800">

        <h2 className="text-2xl font-semibold mb-2 text-center">
          Welcome, House of EdTech
        </h2>

        <p className="text-xs text-gray-400 text-center mb-6">
          Explore the Freelance Intelligence System built for your evaluation
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
        />

        <div className="relative mb-6">

          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 pr-10 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
          />

          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>

        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2
            ${loading ? "bg-gray-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
          `}
        >
          {loading ? (
            <>
              <Loader />
              Please wait...
            </>
          ) : (
            "Login"
          )}
        </button>

      </div>
    </div>
  );
}