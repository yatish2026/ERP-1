"use server";

import { adminDb } from "@/lib/firebase/admin";

export async function getTeachersServer() {
  try {
    const snapshot = await adminDb.collection("users")
      .where("role", "in", ["teacher", "class_teacher"])
      .get();
      
    return {
      success: true,
      data: snapshot.docs.map(doc => ({
        uid: doc.id,
        name: doc.data().name,
        email: doc.data().email,
        role: doc.data().role,
        assignedSubjects: doc.data().assignedSubjects || [],
      }))
    };
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return { success: false, error: "Failed to fetch teachers." };
  }
}

import { adminAuth } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

export async function getTeacherProfileServer(uid: string) {
  try {
    const doc = await adminDb.collection("users").doc(uid).get();
    if (!doc.exists) return { success: false, error: "Teacher not found" };
    return { success: true, data: doc.data() };
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    return { success: false, error: "Failed to fetch profile." };
  }
}

export async function createTeacherServer(
  principalUid: string, 
  data: { name: string, email: string, assignedSubjects?: string[] }
) {
  try {
    const userDoc = await adminDb.collection("users").doc(principalUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "principal") {
      return { success: false, error: "Unauthorized. Only Principals can create teachers." };
    }

    // Generate random 8-character password
    const randomPassword = Math.random().toString(36).slice(-8);

    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: randomPassword, 
      displayName: data.name,
    });

    const uid = userRecord.uid;

    await adminDb.collection("users").doc(uid).set({
      name: data.name,
      email: data.email,
      role: "teacher",
      createdAt: Date.now(),
      assignedSubjects: data.assignedSubjects || []
    });

    revalidatePath("/principal/teachers");
    return { success: true, password: randomPassword };
  } catch (error: any) {
    console.error("Error creating teacher:", error);
    if (error.code === "auth/email-already-exists") {
      return { success: false, error: "A user with this email already exists." };
    }
    return { success: false, error: error.message || "Failed to create teacher." };
  }
}

export async function deleteUserServer(principalUid: string, targetUid: string, role: "teacher" | "student") {
  try {
    const userDoc = await adminDb.collection("users").doc(principalUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "principal") {
      return { success: false, error: "Unauthorized. Only Principals can delete users." };
    }

    // Delete from Auth
    await adminAuth.deleteUser(targetUid);

    // Delete from main users collection
    await adminDb.collection("users").doc(targetUid).delete();

    // Delete from role-specific collection
    if (role === "student") {
      await adminDb.collection("students").doc(targetUid).delete();
    } else {
      // For teachers, we should ideally also delete/update their assignments and timetables, but for now we just delete the user.
      const assignments = await adminDb.collection("teacher_class_assignments").where("teacherId", "==", targetUid).get();
      const batch = adminDb.batch();
      assignments.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    revalidatePath("/principal/students");
    revalidatePath("/principal/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user." };
  }
}

export async function updateUserServer(
  principalUid: string, 
  targetUid: string, 
  role: "teacher" | "student", 
  data: { name?: string, email?: string, assignedSubjects?: string[] }
) {
  try {
    const userDoc = await adminDb.collection("users").doc(principalUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "principal") {
      return { success: false, error: "Unauthorized. Only Principals can update users." };
    }

    // Update Auth
    const updateAuthPayload: any = {};
    if (data.name) updateAuthPayload.displayName = data.name;
    if (data.email) updateAuthPayload.email = data.email;
    if (Object.keys(updateAuthPayload).length > 0) {
      await adminAuth.updateUser(targetUid, updateAuthPayload);
    }

    // Update Users Collection
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.assignedSubjects) updateData.assignedSubjects = data.assignedSubjects;
    
    if (Object.keys(updateData).length > 0) {
      await adminDb.collection("users").doc(targetUid).update(updateData);
    }

    // Update Role-Specific Collection
    if (role === "student") {
      const studentUpdateData: any = {};
      if (data.name) studentUpdateData.name = data.name;
      if (data.email) studentUpdateData.email = data.email;
      if (Object.keys(studentUpdateData).length > 0) {
        await adminDb.collection("students").doc(targetUid).update(studentUpdateData);
      }
    }

    revalidatePath("/principal/students");
    revalidatePath("/principal/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message || "Failed to update user." };
  }
}
