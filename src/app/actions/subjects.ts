"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

export type Subject = {
  id: string;
  name: string;
  classId: string;
  createdAt: number;
};

export async function createSubjectServer(name: string, classId: string) {
  try {
    const docRef = adminDb.collection("subjects").doc();
    const subject: Subject = {
      id: docRef.id,
      name,
      classId,
      createdAt: Date.now()
    };
    
    await docRef.set(subject);
    revalidatePath("/principal/subjects");
    return { success: true, data: subject };
  } catch (error: any) {
    console.error("Error creating subject:", error);
    return { success: false, error: "Failed to create subject" };
  }
}

export async function getSubjectsServer() {
  try {
    const snapshot = await adminDb.collection("subjects").orderBy("createdAt", "desc").get();
    const subjects = snapshot.docs.map(doc => doc.data() as Subject);
    return { success: true, data: subjects };
  } catch (error: any) {
    console.error("Error fetching subjects:", error);
    return { success: false, error: "Failed to fetch subjects" };
  }
}

export async function deleteSubjectServer(id: string) {
  try {
    await adminDb.collection("subjects").doc(id).delete();
    
    // Also remove this subject from any teacher's assigned subjects array
    // We will handle this cleanup when saving teachers, or let it just be invalid references.
    // For now, simple delete is fine.
    
    revalidatePath("/principal/subjects");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting subject:", error);
    return { success: false, error: "Failed to delete subject" };
  }
}
