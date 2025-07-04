"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Geist_Mono, Geist } from "next/font/google";
import { motion } from "framer-motion";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const router = useRouter();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setAlertType("error");
      setAlertMessage("Please complete all fields.");
      return;
    }

    const endpoint = isLogin ? "login" : "register";
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: trimmedUsername,
        password: trimmedPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setAlertType("error");
      setAlertMessage(data.detail);
      return;
    }

    if (isLogin) {
      localStorage.setItem("token", data.access_token);
      router.push("/");
    } else {
      setAlertType("success");
      setAlertMessage("Registration successful! You can now log in.");
      setIsLogin(true);
      setUsername("");
      setPassword("");
    }
  };

  return (
    <main
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex items-center justify-center bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-700 px-4 sm:px-6 md:px-8`}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20"
      >
        <h2 className="text-3xl text-white text-center mb-6 font-extrabold">
          {isLogin ? "Login" : "Register"}
        </h2>

        <form
          key={isLogin ? "login" : "register"}
          onSubmit={handle}
          autoComplete="off"
          className="flex flex-col gap-4"
        >
          <input
            name={isLogin ? "login-user" : "register-user"}
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="User"
            className="px-5 py-3 rounded-xl bg-white/90 text-gray-900 font-medium placeholder-gray-500 shadow focus:outline-none focus:ring-4 focus:ring-cyan-400"
          />
          <input
            name={isLogin ? "login-pass" : "register-pass"}
            autoComplete="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="px-5 py-3 rounded-xl bg-white/90 text-gray-900 font-medium placeholder-gray-500 shadow focus:outline-none focus:ring-4 focus:ring-cyan-400"
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl font-semibold transition active:scale-95 shadow"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center text-cyan-200 mt-4">
          {isLogin ? "¿Don't have an account?" : "¿Already have an account?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setUsername("");
              setPassword("");
            }}
            className="underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>

      {alertMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white rounded-xl p-6 max-w-sm mx-4 text-center shadow-lg"
          >
            <div className="mb-4 flex justify-center text-4xl">
              {alertType === "error" ? (
                <span className="text-red-500">❗</span>
              ) : (
                <span className="text-green-500">✅</span>
              )}
            </div>
            <p className="mb-6 text-gray-900 font-semibold text-lg">
              {alertMessage}
            </p>
            <button
              onClick={() => setAlertMessage("")}
              className={`px-6 py-2 rounded-lg shadow transition ${
                alertType === "error"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              OK
            </button>
          </motion.div>
        </div>
      )}
    </main>
  );
}








