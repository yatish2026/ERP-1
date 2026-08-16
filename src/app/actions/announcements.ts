"use server";

import { adminDb } from "@/lib/firebase/admin";
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
    const docRef = adminDb.collection("announcements").doc();
    const announcement: Announcement = {
      id: docRef.id,
      title: data.title,
      content: data.content,
      authorId,
      authorName,
      authorRole,
      timestamp: Date.now(),
      targetAudience: data.targetAudience
    };
    
    await docRef.set(announcement);
    
    // Revalidate multiple paths where announcements might be shown
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
    let query: any = adminDb.collection("announcements").orderBy("timestamp", "desc");
    
    const snapshot = await query.get();
    
    // Filter in memory for role access
    // Principal sees all
    // Teachers see 'all' and 'teachers'
    // Students see 'all' and 'students'
    const allDocs = snapshot.docs.map((doc: any) => doc.data() as Announcement);
    
    let filtered = allDocs;
    if (role === "teacher" || role === "class_teacher") {
      filtered = allDocs.filter((a: Announcement) => a.targetAudience === "all" || a.targetAudience === "teachers" || a.authorId === "teacher"); 
      // wait, authorId check isn't strictly needed for reading, they see what they are meant to see.
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
    const docRef = adminDb.collection("announcements").doc(announcementId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return { success: false, error: "Announcement not found" };
    }
    
    const data = doc.data() as Announcement;
    
    // Only principals can delete any announcement, teachers can only delete their own
    if (role !== "principal" && data.authorId !== uid) {
      return { success: false, error: "Unauthorized to delete this announcement" };
    }
    
    await docRef.delete();
    
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
