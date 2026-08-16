"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          // Allow class_teacher or teacher for teacher role
          const isAuth = "teacher" === "teacher" 
            ? (data.role === "teacher" || data.role === "class_teacher") 
            : data.role === "teacher";
            
          if (!isAuth) {
            router.push("/login");
          } else {
            setAuthorized(true);
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Firestore Error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role="teacher" />
      <div className="md:ml-64 flex-1 pt-16 pb-16 md:pt-0 md:pb-0 w-full max-w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
