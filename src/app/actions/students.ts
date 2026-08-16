"use server";

import { adminDb, adminAuth } from "@/lib/firebase/admin";
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
    // 1. SECURITY CHECK: Ensure this user is allowed to add a student to this class
    const isAuthorized = await canManageClass(actingUid, studentData.classId);
    
    if (!isAuthorized) {
      return { success: false, error: "SECURITY ALERT: You are not authorized to add students to this class." };
    }

    // Generate random 8-character password
    const randomPassword = Math.random().toString(36).slice(-8);

    // 2. Create the Firebase Auth account
    const userRecord = await adminAuth.createUser({
      email: studentData.email,
      password: randomPassword,
      displayName: studentData.name,
    });

    const uid = userRecord.uid;

    // 3. Create the `users` profile
    await adminDb.collection("users").doc(uid).set({
      name: studentData.name,
      email: studentData.email,
      role: "student",
      classId: studentData.classId,
      createdAt: Date.now(),
    });

    // 4. Create the detailed `students` profile
    await adminDb.collection("students").doc(uid).set({
      uid,
      name: studentData.name,
      email: studentData.email,
      classId: studentData.classId,
      admissionNumber: studentData.admissionNumber || "",
      rollNumber: studentData.rollNumber || "",
      dateOfBirth: studentData.dateOfBirth || "",
      gender: studentData.gender || "Not Specified",
      parentName: studentData.parentName || "",
      parentPhone: studentData.parentPhone || "",
      addedBy: actingUid,
      addedAt: Date.now(),
    });

    revalidatePath("/teacher/students");
    revalidatePath("/principal/students");
    
    return { success: true, uid, password: randomPassword };
  } catch (error: any) {
    console.error("Error creating student:", error);
    // Handle email already exists
    if (error.code === "auth/email-already-exists") {
      return { success: false, error: "A user with this email already exists." };
    }
    return { success: false, error: error.message || "Failed to create student." };
  }
}

export async function getStudentsServer(classId?: string) {
  try {
    let query: FirebaseFirestore.Query = adminDb.collection("students");
    if (classId) {
      query = query.where("classId", "==", classId);
    }
    
    const snapshot = await query.get();
    
    return {
      success: true,
      data: snapshot.docs.map(doc => doc.data())
    };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { success: false, error: "Failed to fetch students." };
  }
}
