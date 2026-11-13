"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type Announcement = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  timestamp: number;
  targetAudience: "all" | "teachers" | "students";
};

export async function createAnnouncementServer(
  authorId: string,
  authorName: string,
  authorRole: string,
  data: { title: string; content: string; targetAudience: "all" | "teachers" | "students" }
) {
  try {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const announcement: Announcement = {
      id,
      title: data.title,
      content: data.content,
      authorId,
      authorName,
      authorRole,
      timestamp,
      targetAudience: data.targetAudience
    };
    
    const { error } = await supabaseAdmin.from("announcements").insert({
      id,
      title: data.title,
      content: data.content,
      author_id: authorId,
      author_name: authorName,
      author_role: authorRole,
      target_audience: data.targetAudience,
      timestamp
    });

    if (error) throw error;
    
    revalidatePath("/principal/dashboard");
    revalidatePath("/teacher/dashboard");
    revalidatePath("/student/dashboard");
    revalidatePath("/principal/announcements");
    revalidatePath("/teacher/announcements");
    revalidatePath("/student/announcements");
    
    return { success: true, data: announcement };
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    return { success: false, error: "Failed to create announcement" };
  }
}

export async function getAnnouncementsServer(role: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) throw error;
    
    const allDocs: Announcement[] = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      authorId: row.author_id,
      authorName: row.author_name,
      authorRole: row.author_role,
      targetAudience: row.target_audience,
      timestamp: row.timestamp
    }));
    
    let filtered = allDocs;
    if (role === "teacher" || role === "class_teacher") {
      filtered = allDocs.filter((a: Announcement) => a.targetAudience === "all" || a.targetAudience === "teachers"); 
    } else if (role === "student") {
      filtered = allDocs.filter((a: Announcement) => a.targetAudience === "all" || a.targetAudience === "students");
    }
    
    return { success: true, data: filtered };
  } catch (error: any) {
    console.error("Error fetching announcements:", error);
    return { success: false, error: "Failed to fetch announcements" };
  }
}

export async function deleteAnnouncementServer(uid: string, announcementId: string, role: string) {
  try {
    const { data: doc, error: fetchError } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .eq("id", announcementId)
      .maybeSingle();
    
    if (fetchError || !doc) {
      return { success: false, error: "Announcement not found" };
    }
    
    if (role !== "principal" && doc.author_id !== uid) {
      return { success: false, error: "Unauthorized to delete this announcement" };
    }
    
    const { error: deleteError } = await supabaseAdmin
      .from("announcements")
      .delete()
      .eq("id", announcementId);

    if (deleteError) throw deleteError;
    
    revalidatePath("/principal/dashboard");
    revalidatePath("/teacher/dashboard");
    revalidatePath("/student/dashboard");
    revalidatePath("/principal/announcements");
    revalidatePath("/teacher/announcements");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: "Failed to delete announcement" };
  }
}
