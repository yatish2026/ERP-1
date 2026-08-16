"use server";

import { adminDb } from "@/lib/firebase/admin";
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

// 1. Get all unique classes a teacher is involved with (either as class teacher or subject teacher)
export async function getTeacherGroupsServer(teacherId: string) {
  try {
    const classIds = new Set<string>();

    // Check Class Teacher Assignments
    const ctAssignments = await adminDb.collection("teacher_class_assignments")
      .where("teacherId", "==", teacherId)
      .get();
    ctAssignments.docs.forEach(doc => {
      classIds.add(doc.data().classId);
    });

    // Scan Timetables for subject teacher assignments
    // Note: In a huge school, this could be slow, but it's fine for our scale. 
    // Ideally, we'd maintain an array of `taughtClasses` on the teacher doc.
    const timetables = await adminDb.collection("timetables").get();
    timetables.docs.forEach(doc => {
      const data = doc.data();
      const periods = data.periods || [];
      const hasTeacher = periods.some((p: any) => p.teacherId === teacherId);
      if (hasTeacher) {
        classIds.add(data.classId);
      }
    });

    return { success: true, data: Array.from(classIds) };
  } catch (error: any) {
    console.error("Error fetching teacher groups:", error);
    return { success: false, error: "Failed to fetch groups." };
  }
}

// 2. Fetch posts for a specific class group
export async function getGroupPostsServer(classId: string) {
  try {
    const snapshot = await adminDb.collection("class_posts")
      .where("classId", "==", classId)
      .get();
      
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GroupPost[];

    // Sort in memory to avoid requiring a composite index in Firestore
    posts.sort((a, b) => b.timestamp - a.timestamp);

    return { success: true, data: posts };
  } catch (error: any) {
    console.error("Error fetching group posts:", error);
    return { success: false, error: "Failed to fetch posts." };
  }
}

// 3. Create a post in a class group
export async function createGroupPostServer(teacherId: string, data: Omit<GroupPost, "id" | "timestamp">) {
  try {
    const userDoc = await adminDb.collection("users").doc(teacherId).get();
    if (!userDoc.exists || !["teacher", "class_teacher", "principal"].includes(userDoc.data()?.role)) {
      return { success: false, error: "Unauthorized. Only teachers can post." };
    }

    const postRef = adminDb.collection("class_posts").doc();
    const newPost = {
      id: postRef.id,
      ...data,
      timestamp: Date.now()
    };

    await postRef.set(newPost);

    revalidatePath("/teacher/groups");
    revalidatePath("/student/group");
    return { success: true, data: newPost };
  } catch (error: any) {
    console.error("Error creating group post:", error);
    return { success: false, error: "Failed to create post." };
  }
}

// 4. Delete a post
export async function deleteGroupPostServer(teacherId: string, postId: string) {
  try {
    const postRef = adminDb.collection("class_posts").doc(postId);
    const postDoc = await postRef.get();
    
    if (!postDoc.exists) {
      return { success: false, error: "Post not found." };
    }

    const postData = postDoc.data();
    
    // Check if the deleter is the author or a principal
    const userDoc = await adminDb.collection("users").doc(teacherId).get();
    const role = userDoc.data()?.role;
    
    if (postData?.authorId !== teacherId && role !== "principal") {
      return { success: false, error: "Unauthorized to delete this post." };
    }

    await postRef.delete();
    revalidatePath("/teacher/groups");
    revalidatePath("/student/group");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting group post:", error);
    return { success: false, error: "Failed to delete post." };
  }
}
