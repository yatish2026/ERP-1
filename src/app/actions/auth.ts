"use server";

import { adminDb } from "@/lib/firebase/admin";

export async function getUserRoleServer(uid: string) {
  try {
    const userDoc = await adminDb.collection("users").doc(uid).get();
    
    if (userDoc.exists) {
      const data = userDoc.data();
      return { 
        success: true, 
        data: {
          role: data?.role,
          name: data?.name,
          email: data?.email,
          createdAt: data?.createdAt?.toMillis ? data.createdAt.toMillis() : null
        } 
      };
    } else {
      return { success: false, error: "User profile not found. Please contact administration." };
    }
  } catch (error: any) {
    console.error("Server Action Error fetching role:", error);
    return { success: false, error: error.message || "Failed to fetch user role on server." };
  }
}
