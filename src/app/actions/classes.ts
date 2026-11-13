"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createClassServer(grade: string, section: string, principalUid: string) {
  try {
    const { data: userDoc } = await supabaseAdmin.from("users").select("role").eq("id", principalUid).maybeSingle();
    if (!userDoc || userDoc.role !== "principal") {
      return { success: false, error: "Unauthorized. Only Principals can create classes." };
    }

    if (!grade || !section) {
      return { success: false, error: "Grade and Section are required." };
    }

    const classId = `${grade.toLowerCase()}-${section.toLowerCase()}`;

    const { data: existingClass } = await supabaseAdmin.from("classes").select("id").eq("id", classId).maybeSingle();
    if (existingClass) {
      return { success: false, error: `Class ${grade}-${section} already exists.` };
    }

    const { error: insertError } = await supabaseAdmin.from("classes").insert({
      id: classId,
      grade,
      section,
      created_at: Date.now(),
    });

    if (insertError) throw insertError;

    revalidatePath("/principal/classes");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating class:", error);
    return { success: false, error: error.message || "Failed to create class" };
  }
}

export async function getClassesServer() {
  try {
    const { data, error } = await supabaseAdmin.from("classes").select("*").order("grade", { ascending: true });
    if (error) throw error;
    return { 
      success: true, 
      data: (data || []).map((c: any) => ({
        id: c.id,
        grade: c.grade,
        section: c.section,
        createdAt: c.created_at
      }))
    };
  } catch (error: any) {
    return { success: false, error: "Failed to fetch classes" };
  }
}

export async function getTeacherClassesServer(teacherUid: string) {
  try {
    const { data: assignments, error } = await supabaseAdmin
      .from("teacher_class_assignments")
      .select("class_id")
      .eq("teacher_id", teacherUid)
      .eq("is_class_teacher", true);
      
    if (error) throw error;
    const classIds = (assignments || []).map((a: any) => a.class_id);
    
    if (classIds.length === 0) return { success: true, data: [] };

    const { data: classDocs, error: classError } = await supabaseAdmin
      .from("classes")
      .select("*")
      .in("id", classIds);

    if (classError) throw classError;

    return {
      success: true,
      data: (classDocs || []).map((c: any) => ({
        id: c.id,
        grade: c.grade,
        section: c.section,
        createdAt: c.created_at
      }))
    };
  } catch (error: any) {
    console.error("Error fetching teacher classes:", error);
    return { success: false, error: "Failed to fetch assigned classes" };
  }
}
