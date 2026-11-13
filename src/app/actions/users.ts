"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getTeachersServer() {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .in("role", ["teacher", "class_teacher"]);
      
    if (error) throw error;

    return {
      success: true,
      data: (data || []).map((doc: any) => ({
        uid: doc.id,
        name: doc.name,
        email: doc.email,
        role: doc.role,
        assignedSubjects: doc.assigned_subjects || [],
      }))
    };
  } catch (error: any) {
    console.error("Error fetching teachers:", error);
    return { success: false, error: "Failed to fetch teachers." };
  }
}

export async function getTeacherProfileServer(uid: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", uid)
      .maybeSingle();

    if (error || !data) return { success: false, error: "Teacher not found" };
    return {
      success: true,
      data: {
        uid: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        assignedSubjects: data.assigned_subjects || [],
        ...data
      }
    };
  } catch (error: any) {
    console.error("Error fetching teacher profile:", error);
    return { success: false, error: "Failed to fetch profile." };
  }
}

export async function createTeacherServer(
  principalUid: string, 
  data: { name: string, email: string, assignedSubjects?: string[] }
) {
  try {
    const { data: principalDoc } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", principalUid)
      .maybeSingle();

    if (!principalDoc || principalDoc.role !== "principal") {
      return { success: false, error: "Unauthorized. Only Principals can create teachers." };
    }

    // Generate random 8-character password
    const randomPassword = Math.random().toString(36).slice(-8);

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: { name: data.name, role: "teacher" }
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already") || authError.code === "email_exists") {
        return { success: false, error: "A user with this email already exists." };
      }
      return { success: false, error: authError.message };
    }

    const uid = authData.user.id;

    const { error: dbError } = await supabaseAdmin
      .from("users")
      .upsert({
        id: uid,
        name: data.name,
        email: data.email,
        role: "teacher",
        assigned_subjects: data.assignedSubjects || [],
        created_at: Date.now()
      });

    if (dbError) throw dbError;

    revalidatePath("/principal/teachers");
    return { success: true, password: randomPassword };
  } catch (error: any) {
    console.error("Error creating teacher:", error);
    return { success: false, error: error.message || "Failed to create teacher." };
  }
}

export async function deleteUserServer(principalUid: string, targetUid: string, role: "teacher" | "student") {
  try {
    const { data: principalDoc } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", principalUid)
      .maybeSingle();

    if (!principalDoc || principalDoc.role !== "principal") {
      return { success: false, error: "Unauthorized. Only Principals can delete users." };
    }

    // Delete from Supabase Auth
    await supabaseAdmin.auth.admin.deleteUser(targetUid);

    // Delete from main users table
    await supabaseAdmin.from("users").delete().eq("id", targetUid);

    // Delete from role-specific table
    if (role === "student") {
      await supabaseAdmin.from("students").delete().eq("id", targetUid);
    } else {
      await supabaseAdmin.from("teacher_class_assignments").delete().eq("teacher_id", targetUid);
    }

    revalidatePath("/principal/students");
    revalidatePath("/principal/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user." };
  }
}

export async function updateUserServer(
  principalUid: string, 
  targetUid: string, 
  role: "teacher" | "student", 
  data: { name?: string, email?: string, assignedSubjects?: string[] }
) {
  try {
    const { data: principalDoc } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", principalUid)
      .maybeSingle();

    if (!principalDoc || principalDoc.role !== "principal") {
      return { success: false, error: "Unauthorized. Only Principals can update users." };
    }

    // Update Auth
    const updateAuthPayload: any = {};
    if (data.email) updateAuthPayload.email = data.email;
    if (data.name) updateAuthPayload.user_metadata = { name: data.name };
    
    if (Object.keys(updateAuthPayload).length > 0) {
      await supabaseAdmin.auth.admin.updateUserById(targetUid, updateAuthPayload);
    }

    // Update Users Table
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.assignedSubjects) updateData.assigned_subjects = data.assignedSubjects;
    
    if (Object.keys(updateData).length > 0) {
      await supabaseAdmin.from("users").update(updateData).eq("id", targetUid);
    }

    // Update Role-Specific Table
    if (role === "student") {
      const studentUpdateData: any = {};
      if (data.name) studentUpdateData.name = data.name;
      if (data.email) studentUpdateData.email = data.email;
      if (Object.keys(studentUpdateData).length > 0) {
        await supabaseAdmin.from("students").update(studentUpdateData).eq("id", targetUid);
      }
    }

    revalidatePath("/principal/students");
    revalidatePath("/principal/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message || "Failed to update user." };
  }
}
