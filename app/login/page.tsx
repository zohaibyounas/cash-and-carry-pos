"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShoppingCart, LogIn, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log(res);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      if (res.data.role === "admin") {
        router.push("/dashboard/select-store");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">

      {/* Overlay gradient for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-blue-50/70 to-slate-100/80 dark:from-slate-950/90 dark:via-slate-900/85 dark:to-slate-950/90" style={{ zIndex: 1 }}></div>

      {/* Top bar: theme toggle — matches dashboard header area */}
      <header className="flex shrink-0 items-center justify-end border-b border-slate-200/50 bg-white/50 backdrop-blur-md px-4 py-3 dark:border-slate-800/50 dark:bg-slate-900/50 md:px-8 relative" style={{ zIndex: 10 }}>
        <ThemeToggle />
      </header>

      {/* Centered login card */}
      <div className="flex flex-1 items-center justify-center p-6 relative" style={{ zIndex: 10 }}>
        <Card className="w-full max-w-[400px] border-slate-200 bg-white/90 backdrop-blur-xl shadow-2xl dark:border-slate-800 dark:bg-slate-900/90">
          {/* Blue accent bar — same as dashboard primary */}
          <div className="h-1 rounded-t-xl bg-blue-600" />

          <CardHeader className="space-y-2 pb-3 pt-4">
            <div className="flex items-center justify-center">
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Sign in
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter your credentials to access the system.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="dark:bg-slate-800/50 dark:border-slate-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-600 font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
