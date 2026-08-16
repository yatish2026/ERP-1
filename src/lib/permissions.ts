import { adminDb } from "./firebase/admin";

/**
 * Checks if the user is authorized to manage students within a specific class.
 * Allowed: Principal, or the Class Teacher assigned to that specific class.
 */
export async function canManageClass(uid: string, classId: string): Promise<boolean> {
  try {
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists) return false;
    
    const userRole = userDoc.data()?.role;

    // Principal has full override access
    if (userRole === "principal") {
      return true;
    }

    // Class Teachers can manage their assigned class
    if (userRole === "class_teacher") {
      // Query the assignment
      const assignments = await adminDb.collection("teacher_class_assignments")
        .where("teacherId", "==", uid)
        .where("classId", "==", classId)
        .where("isClassTeacher", "==", true)
        .get();
        
      if (!assignments.empty) {
        return true;
      }
    }

    // All others (subject teachers, students, parents) are blocked
    return false;
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
}

/**
 * Gets all class IDs where this user is the Class Teacher.
 */
export async function getAssignedClassesForTeacher(uid: string): Promise<string[]> {
  try {
    const assignments = await adminDb.collection("teacher_class_assignments")
      .where("teacherId", "==", uid)
      .where("isClassTeacher", "==", true)
      .get();
      
    return assignments.docs.map(doc => doc.data().classId);
  } catch (error) {
    console.error("Error fetching assigned classes:", error);
    return [];
  }
}
