"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type Subject = {
  id: string;
  name: string;
  classId: string;
  createdAt: number;
};

export async function createSubjectServer(name: string, classId: string) {
  try {
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    const subject: Subject = {
      id,
      name,
      classId,
      createdAt
    };
    
    const { error } = await supabaseAdmin.from("subjects").insert({
      id,
      name,
      class_id: classId,
      created_at: createdAt
    });

    if (error) throw error;

    revalidatePath("/principal/subjects");
    return { success: true, data: subject };
  } catch (error: any) {
    console.error("Error creating subject:", error);
    return { success: false, error: "Failed to create subject" };
  }
}

export async function getSubjectsServer() {
  try {
    const { data, error } = await supabaseAdmin
      .from("subjects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    const subjects: Subject[] = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      classId: row.class_id,
      createdAt: row.created_at
    }));

    return { success: true, data: subjects };
  } catch (error: any) {
    console.error("Error fetching subjects:", error);
    return { success: false, error: "Failed to fetch subjects" };
  }
}

export async function deleteSubjectServer(id: string) {
  try {
    const { error } = await supabaseAdmin.from("subjects").delete().eq("id", id);
    if (error) throw error;
    
    revalidatePath("/principal/subjects");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting subject:", error);
    return { success: false, error: "Failed to delete subject" };
  }
}
