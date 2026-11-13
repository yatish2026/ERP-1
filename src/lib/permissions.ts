import { supabaseAdmin } from "./supabase/admin";

/**
 * Checks if the user is authorized to manage students within a specific class.
 * Allowed: Principal, or the Class Teacher assigned to that specific class.
 */
export async function canManageClass(uid: string, classId: string): Promise<boolean> {
  try {
    const { data: userDoc, error } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", uid)
      .maybeSingle();
    
    if (error || !userDoc) return false;
    
    const userRole = userDoc.role;

    // Principal has full override access
    if (userRole === "principal") {
      return true;
    }

    // Class Teachers can manage their assigned class
    if (userRole === "class_teacher") {
      const { data: assignments } = await supabaseAdmin
        .from("teacher_class_assignments")
        .select("id")
        .eq("teacher_id", uid)
        .eq("class_id", classId)
        .eq("is_class_teacher", true);
        
      if (assignments && assignments.length > 0) {
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
    const { data: assignments, error } = await supabaseAdmin
      .from("teacher_class_assignments")
      .select("class_id")
      .eq("teacher_id", uid)
      .eq("is_class_teacher", true);
      
    if (error || !assignments) return [];
    return assignments.map((a: any) => a.class_id);
  } catch (error) {
    console.error("Error fetching assigned classes:", error);
    return [];
  }
}
