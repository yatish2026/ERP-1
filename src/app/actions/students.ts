"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { canManageClass } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function createStudentServer(
  actingUid: string, 
  studentData: {
    name: string,
    email: string,
    dateOfBirth?: string,
    gender?: string,
    admissionNumber?: string,
    rollNumber?: string,
    parentName?: string,
    parentPhone?: string,
    classId: string,
  }
) {
  try {
    const isAuthorized = await canManageClass(actingUid, studentData.classId);
    
    if (!isAuthorized) {
      return { success: false, error: "SECURITY ALERT: You are not authorized to add students to this class." };
    }

    // Generate random 8-character password
    const randomPassword = Math.random().toString(36).slice(-8);

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: studentData.email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: { name: studentData.name, role: "student" }
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already") || authError.code === "email_exists") {
        return { success: false, error: "A user with this email already exists." };
      }
      return { success: false, error: authError.message };
    }

    const uid = authData.user.id;

    // Create the `users` profile
    await supabaseAdmin.from("users").upsert({
      id: uid,
      name: studentData.name,
      email: studentData.email,
      role: "student",
      class_id: studentData.classId,
      created_at: Date.now(),
    });

    // Create the detailed `students` profile
    await supabaseAdmin.from("students").upsert({
      id: uid,
      uid: uid,
      name: studentData.name,
      email: studentData.email,
      class_id: studentData.classId,
      admission_number: studentData.admissionNumber || "",
      roll_number: studentData.rollNumber || "",
      date_of_birth: studentData.dateOfBirth || "",
      gender: studentData.gender || "Not Specified",
      parent_name: studentData.parentName || "",
      parent_phone: studentData.parentPhone || "",
      added_by: actingUid,
      added_at: Date.now(),
    });

    revalidatePath("/teacher/students");
    revalidatePath("/principal/students");
    
    return { success: true, uid, password: randomPassword };
  } catch (error: any) {
    console.error("Error creating student:", error);
    return { success: false, error: error.message || "Failed to create student." };
  }
}

export async function getStudentsServer(classId?: string) {
  try {
    let query = supabaseAdmin.from("students").select("*");
    if (classId) {
      query = query.eq("class_id", classId);
    }
    
    const { data, error } = await query;
    if (error) throw error;

    return {
      success: true,
      data: (data || []).map((s: any) => ({
        uid: s.id || s.uid,
        id: s.id || s.uid,
        name: s.name,
        email: s.email,
        classId: s.class_id,
        admissionNumber: s.admission_number,
        rollNumber: s.roll_number,
        dateOfBirth: s.date_of_birth,
        gender: s.gender,
        parentName: s.parent_name,
        parentPhone: s.parent_phone,
        addedBy: s.added_by,
        addedAt: s.added_at,
      }))
    };
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return { success: false, error: "Failed to fetch students." };
  }
}
