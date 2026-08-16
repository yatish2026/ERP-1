"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

export async function createClassServer(grade: string, section: string, principalUid: string) {
  try {
    // 1. Verify caller is Principal
    const userDoc = await adminDb.collection("users").doc(principalUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "principal") {
      return { success: false, error: "Unauthorized. Only Principals can create classes." };
    }

    // 2. Validate input
    if (!grade || !section) {
      return { success: false, error: "Grade and Section are required." };
    }

    const classId = `${grade.toLowerCase()}-${section.toLowerCase()}`;

    // 3. Check if class already exists
    const classDoc = await adminDb.collection("classes").doc(classId).get();
    if (classDoc.exists) {
      return { success: false, error: `Class ${grade}-${section} already exists.` };
    }

    // 4. Create class
    await adminDb.collection("classes").doc(classId).set({
      id: classId,
      grade,
      section,
      createdAt: Date.now(),
    });

    revalidatePath("/principal/classes");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating class:", error);
    return { success: false, error: error.message || "Failed to create class" };
  }
}

export async function getClassesServer() {
  try {
    const snapshot = await adminDb.collection("classes").orderBy("grade").get();
    return { 
      success: true, 
      data: snapshot.docs.map(doc => doc.data())
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch classes" };
  }
}

export async function getTeacherClassesServer(teacherUid: string) {
  try {
    const assignments = await adminDb.collection("teacher_class_assignments")
      .where("teacherId", "==", teacherUid)
      .where("isClassTeacher", "==", true)
      .get();
      
    const classIds = assignments.docs.map(doc => doc.data().classId);
    
    if (classIds.length === 0) return { success: true, data: [] };

    // Fetch class details
    const classDocs = await Promise.all(
      classIds.map(id => adminDb.collection("classes").doc(id).get())
    );

    return {
      success: true,
      data: classDocs.filter(d => d.exists).map(d => d.data())
    };
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return { success: false, error: "Failed to fetch assigned classes" };
  }
}
