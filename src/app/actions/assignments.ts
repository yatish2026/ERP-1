"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

export async function assignClassTeacherServer(principalUid: string, teacherId: string, classId: string) {
  try {
    // 1. Verify caller is Principal
    const principalDoc = await adminDb.collection("users").doc(principalUid).get();
    if (!principalDoc.exists || principalDoc.data()?.role !== "principal") {
      return { success: false, error: "Unauthorized. Only Principals can assign Class Teachers." };
    }

    // 2. Validate Target Teacher
    const teacherDoc = await adminDb.collection("users").doc(teacherId).get();
    if (!teacherDoc.exists) {
      return { success: false, error: "Teacher not found." };
    }
    const teacherData = teacherDoc.data();
    if (teacherData?.role !== "teacher" && teacherData?.role !== "class_teacher") {
      return { success: false, error: "User is not a teacher." };
    }

    // 3. Validate Class
    const classDoc = await adminDb.collection("classes").doc(classId).get();
    if (!classDoc.exists) {
      return { success: false, error: "Class not found." };
    }

    // 4. Create the assignment in `teacher_class_assignments`
    const assignmentRef = adminDb.collection("teacher_class_assignments").doc();
    const assignmentId = assignmentRef.id;
    await assignmentRef.set({
      id: assignmentId,
      teacherId,
      classId,
      isClassTeacher: true,
      assignedAt: Date.now(),
      assignedBy: principalUid
    });

    // 5. Upgrade the teacher's role to "class_teacher" if they were just a regular "teacher"
    if (teacherData?.role === "teacher") {
      await adminDb.collection("users").doc(teacherId).update({
        role: "class_teacher"
      });
    }

    revalidatePath("/principal/classes");
    revalidatePath("/principal/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("Error assigning class teacher:", error);
    return { success: false, error: error.message || "Failed to assign Class Teacher" };
  }
}
