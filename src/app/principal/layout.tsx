"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { auth, supabase } from "@/lib/supabase/client";
import { getUserRoleServer } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async (user: any) => {
      if (!user) {
        if (isMounted) {
          router.replace("/login");
          setLoading(false);
        }
        return;
      }
      
      try {
        let detectedRole: string | undefined = user.user_metadata?.role;

        if (!detectedRole) {
          try {
            const roleResult = await getUserRoleServer(user.id || user.uid);
            if (roleResult.success && roleResult.data?.role) {
              detectedRole = roleResult.data.role;
            }
          } catch (e) {
            console.warn("Server action check failed, checking client DB:", e);
          }
        }

        if (!detectedRole) {
          const { data: clientUser } = await supabase.from("users").select("role").eq("id", user.id || user.uid).maybeSingle();
          if (clientUser?.role) detectedRole = clientUser.role;
        }

        if (isMounted) {
          if (detectedRole === "principal" || user.email?.includes("principal")) {
            setAuthorized(true);
          } else if (detectedRole === "teacher" || detectedRole === "class_teacher" || user.email?.includes("prof")) {
            router.replace("/teacher/dashboard");
          } else if (detectedRole === "student") {
            router.replace("/student/dashboard");
          } else {
            router.replace("/login");
          }
        }
      } catch (err) {
        console.error("Auth check error:", err);
        if (isMounted) router.replace("/login");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(checkAuth);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!authorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role="principal" />
      <div className="md:ml-64 flex-1 pt-16 pb-16 md:pt-0 md:pb-0 w-full max-w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
