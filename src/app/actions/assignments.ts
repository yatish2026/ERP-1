"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function assignClassTeacherServer(principalUid: string, teacherId: string, classId: string) {
  try {
    const { data: principalDoc } = await supabaseAdmin.from("users").select("role").eq("id", principalUid).maybeSingle();
    if (!principalDoc || principalDoc.role !== "principal") {
      return { success: false, error: "Unauthorized. Only Principals can assign Class Teachers." };
    }

    const { data: teacherDoc } = await supabaseAdmin.from("users").select("*").eq("id", teacherId).maybeSingle();
    if (!teacherDoc) {
      return { success: false, error: "Teacher not found." };
    }
    if (teacherDoc.role !== "teacher" && teacherDoc.role !== "class_teacher") {
      return { success: false, error: "User is not a teacher." };
    }

    const { data: classDoc } = await supabaseAdmin.from("classes").select("id").eq("id", classId).maybeSingle();
    if (!classDoc) {
      return { success: false, error: "Class not found." };
    }

    const assignmentId = crypto.randomUUID();
    const { error: assignError } = await supabaseAdmin.from("teacher_class_assignments").insert({
      id: assignmentId,
      teacher_id: teacherId,
      class_id: classId,
      is_class_teacher: true,
      assigned_at: Date.now(),
      assigned_by: principalUid
    });

    if (assignError) throw assignError;

    if (teacherDoc.role === "teacher") {
      await supabaseAdmin.from("users").update({
        role: "class_teacher"
      }).eq("id", teacherId);
    }

    revalidatePath("/principal/classes");
    revalidatePath("/principal/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("Error assigning class teacher:", error);
    return { success: false, error: error.message || "Failed to assign Class Teacher" };
  }
}
