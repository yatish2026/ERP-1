"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type GroupPost = {
  id: string;
  classId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  timestamp: number;
};

export async function getTeacherGroupsServer(teacherId: string) {
  try {
    const classIds = new Set<string>();

    const { data: ctAssignments } = await supabaseAdmin
      .from("teacher_class_assignments")
      .select("class_id")
      .eq("teacher_id", teacherId);

    (ctAssignments || []).forEach((a: any) => {
      if (a.class_id) classIds.add(a.class_id);
    });

    const { data: timetables } = await supabaseAdmin
      .from("timetables")
      .select("class_id, periods");

    (timetables || []).forEach((doc: any) => {
      const periods = doc.periods || [];
      const hasTeacher = periods.some((p: any) => p.teacherId === teacherId);
      if (hasTeacher && doc.class_id) {
        classIds.add(doc.class_id);
      }
    });

    return { success: true, data: Array.from(classIds) };
  } catch (error: any) {
    console.error("Error fetching teacher groups:", error);
    return { success: false, error: "Failed to fetch groups." };
  }
}

export async function getGroupPostsServer(classId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("class_posts")
      .select("*")
      .eq("class_id", classId)
      .order("timestamp", { ascending: false });

    if (error) throw error;
      
    const posts: GroupPost[] = (data || []).map((row: any) => ({
      id: row.id,
      classId: row.class_id,
      authorId: row.author_id,
      authorName: row.author_name,
      title: row.title,
      content: row.content,
      timestamp: row.timestamp
    }));

    return { success: true, data: posts };
  } catch (error: any) {
    console.error("Error fetching group posts:", error);
    return { success: false, error: "Failed to fetch posts." };
  }
}

export async function createGroupPostServer(teacherId: string, data: Omit<GroupPost, "id" | "timestamp">) {
  try {
    const { data: userDoc } = await supabaseAdmin.from("users").select("role").eq("id", teacherId).maybeSingle();
    if (!userDoc || !["teacher", "class_teacher", "principal"].includes(userDoc.role)) {
      return { success: false, error: "Unauthorized. Only teachers can post." };
    }

    const newPost: GroupPost = {
      id: crypto.randomUUID(),
      classId: data.classId,
      authorId: data.authorId,
      authorName: data.authorName,
      title: data.title,
      content: data.content,
      timestamp: Date.now()
    };

    const { error: insertError } = await supabaseAdmin
      .from("class_posts")
      .insert({
        id: newPost.id,
        class_id: newPost.classId,
        author_id: newPost.authorId,
        author_name: newPost.authorName,
        title: newPost.title,
        content: newPost.content,
        timestamp: newPost.timestamp
      });

    if (insertError) throw insertError;

    revalidatePath("/teacher/groups");
    revalidatePath("/student/group");
    return { success: true, data: newPost };
  } catch (error: any) {
    console.error("Error creating group post:", error);
    return { success: false, error: "Failed to create post." };
  }
}

export async function deleteGroupPostServer(teacherId: string, postId: string) {
  try {
    const { data: postData, error: fetchError } = await supabaseAdmin
      .from("class_posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();
    
    if (fetchError || !postData) {
      return { success: false, error: "Post not found." };
    }

    const { data: userDoc } = await supabaseAdmin.from("users").select("role").eq("id", teacherId).maybeSingle();
    const role = userDoc?.role;
    
    if (postData.author_id !== teacherId && role !== "principal") {
      return { success: false, error: "Unauthorized to delete this post." };
    }

    await supabaseAdmin.from("class_posts").delete().eq("id", postId);
    revalidatePath("/teacher/groups");
    revalidatePath("/student/group");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting group post:", error);
    return { success: false, error: "Failed to delete post." };
  }
}
