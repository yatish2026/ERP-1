"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Eye, EyeOff, GraduationCap, Loader2, Sparkles, User, UserCheck, Shield } from "lucide-react";
import { getUserRoleServer } from "@/app/actions/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState("");

  const normalizeEmail = (raw: string) => {
    let e = raw.trim().toLowerCase();
    if (e.includes("prinicipla") || e.includes("principla") || e.includes("princpal")) {
      e = e.replace(/prinicipla|principla|princpal/, "principal");
    }
    if (e.endsWith("@school.com")) {
      e = e.replace("@school.com", "@college.edu");
    }
    return e;
  };

  const performSignIn = async (targetEmail: string, targetPass: string) => {
    setLoading(true);
    setError("");

    try {
      const cleanEmail = normalizeEmail(targetEmail);
      const cleanPass = targetPass;

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (signInError) {
        if (signInError.message.toLowerCase().includes("invalid login credentials")) {
          setError("Invalid email or password. Please use password123");
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        setLoadingRole(null);
        return;
      }

      const user = data.user;
      if (!user) {
        setError("Sign in failed. No user returned.");
        setLoading(false);
        setLoadingRole(null);
        return;
      }

      // Multi-layer role resolution (metadata -> client query -> server action)
      let detectedRole = user.user_metadata?.role;

      if (!detectedRole) {
        try {
          const { data: clientUser } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          if (clientUser?.role) {
            detectedRole = clientUser.role;
          }
        } catch (e) {
          console.warn("Client role query error:", e);
        }
      }

      if (!detectedRole) {
        try {
          const roleResult = await getUserRoleServer(user.id);
          if (roleResult.success && roleResult.data?.role) {
            detectedRole = roleResult.data.role;
          }
        } catch (e) {
          console.warn("Server action role query error:", e);
        }
      }

      // Default fallback if principal email
      if (!detectedRole) {
        if (cleanEmail.includes("principal")) detectedRole = "principal";
        else if (cleanEmail.includes("prof")) detectedRole = "teacher";
        else detectedRole = "student";
      }

      // Redirect based on resolved role
      if (detectedRole === "principal") {
        window.location.href = "/principal/dashboard";
      } else if (detectedRole === "teacher" || detectedRole === "class_teacher") {
        window.location.href = "/teacher/dashboard";
      } else if (detectedRole === "student") {
        window.location.href = "/student/dashboard";
      } else if (detectedRole === "parent") {
        window.location.href = "/parent/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error("Login fatal error:", err);
      setError(`Login Error: ${err.message || "Network issue"}`);
      setLoading(false);
      setLoadingRole(null);
    }
  };

  // Auto-recovery if browser submitted as GET query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryEmail = params.get("email");
      const queryPass = params.get("password");
      if (queryEmail && queryPass) {
        setEmail(queryEmail);
        setPassword(queryPass);
        performSignIn(queryEmail, queryPass);
      }
    }
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await performSignIn(email, password);
  };

  const handleQuickDemoClick = async (demoEmail: string, roleName: string, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEmail(demoEmail);
    setPassword("password123");
    setLoadingRole(roleName);
    await performSignIn(demoEmail, "password123");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          College ERP
        </h2>
        <p className="mt-1 text-center text-sm text-gray-600">
          Sign in to access your college portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-blue-900/5 rounded-3xl sm:px-10 border border-gray-100" suppressHydrationWarning>
          
          {/* Quick Demo 1-Click Login Buttons */}
          <div className="mb-6 p-4 bg-blue-50/70 border border-blue-100 rounded-2xl">
            <p className="text-xs font-bold text-blue-900 mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> 1-Tap Demo Logins:
              </span>
              <span className="text-[10px] text-blue-600 font-normal">Tap to enter</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={(e) => handleQuickDemoClick("principal@college.edu", "Principal", e)}
                onTouchEnd={(e) => handleQuickDemoClick("principal@college.edu", "Principal", e)}
                className="px-2 py-2.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 rounded-xl text-xs font-bold text-blue-800 transition-all text-center shadow-sm disabled:opacity-50 active:scale-95 flex flex-col items-center gap-1 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-blue-600 group-hover:text-white" />
                <span>{loadingRole === "Principal" ? "Entering..." : "Principal"}</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={(e) => handleQuickDemoClick("prof.sharma@college.edu", "Professor", e)}
                onTouchEnd={(e) => handleQuickDemoClick("prof.sharma@college.edu", "Professor", e)}
                className="px-2 py-2.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 rounded-xl text-xs font-bold text-blue-800 transition-all text-center shadow-sm disabled:opacity-50 active:scale-95 flex flex-col items-center gap-1 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-indigo-600 group-hover:text-white" />
                <span>{loadingRole === "Professor" ? "Entering..." : "Professor"}</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={(e) => handleQuickDemoClick("aarav.sharma@college.edu", "Student", e)}
                onTouchEnd={(e) => handleQuickDemoClick("aarav.sharma@college.edu", "Student", e)}
                className="px-2 py-2.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 rounded-xl text-xs font-bold text-blue-800 transition-all text-center shadow-sm disabled:opacity-50 active:scale-95 flex flex-col items-center gap-1 cursor-pointer"
              >
                <User className="w-4 h-4 text-emerald-600 group-hover:text-white" />
                <span>{loadingRole === "Student" ? "Entering..." : "Student"}</span>
              </button>
            </div>
          </div>

          <form action="#" method="post" className="space-y-4" onSubmit={handleFormSubmit} suppressHydrationWarning>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  suppressHydrationWarning
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="name@college.edu"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  suppressHydrationWarning
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <p>Default Password: <span className="font-mono font-bold text-gray-700">password123</span></p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 py-2.5 px-3 rounded-xl border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 cursor-pointer active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign in to Portal"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
