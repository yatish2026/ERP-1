"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getUserRoleServer(uid: string) {
  try {
    const { data: userDoc, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", uid)
      .maybeSingle();
    
    if (error) {
      console.error("Server Action Error fetching role:", error);
      return { success: false, error: error.message };
    }

    if (userDoc) {
      return { 
        success: true, 
        data: {
          role: userDoc.role,
          name: userDoc.name,
          email: userDoc.email,
          createdAt: userDoc.created_at
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
