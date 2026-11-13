"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type Period = {
  id: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
};

export type DayTimetable = {
  classId: string;
  dayOfWeek: string;
  periods: Period[];
};

export async function getTimetableServer(classId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("timetables")
      .select("*")
      .eq("class_id", classId);

    if (error) throw error;
    const timetables: Record<string, DayTimetable> = {};
    
    (data || []).forEach((row: any) => {
      timetables[row.day_of_week] = {
        classId: row.class_id,
        dayOfWeek: row.day_of_week,
        periods: row.periods || []
      };
    });

    return { success: true, data: timetables };
  } catch (error: any) {
    console.error("Error fetching timetable:", error);
    return { success: false, error: "Failed to fetch timetable." };
  }
}

export async function saveDayTimetableServer(actingUid: string, classId: string, dayOfWeek: string, periods: Period[]) {
  try {
    const { data: assignmentDocs } = await supabaseAdmin
      .from("teacher_class_assignments")
      .select("id")
      .eq("teacher_id", actingUid)
      .eq("class_id", classId)
      .eq("is_class_teacher", true);
      
    if (!assignmentDocs || assignmentDocs.length === 0) {
      const { data: userDoc } = await supabaseAdmin.from("users").select("role").eq("id", actingUid).maybeSingle();
      if (!userDoc || userDoc.role !== "principal") {
        return { success: false, error: "Unauthorized. Only the Class Teacher or Principal can modify the timetable." };
      }
    }

    const docId = `${classId}_${dayOfWeek}`;
    
    const { error: upsertError } = await supabaseAdmin
      .from("timetables")
      .upsert({
        id: docId,
        class_id: classId,
        day_of_week: dayOfWeek,
        periods: periods,
        updated_at: Date.now(),
        updated_by: actingUid
      });

    if (upsertError) throw upsertError;

    revalidatePath("/teacher/timetable");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving timetable:", error);
    return { success: false, error: "Failed to save timetable." };
  }
}

export async function getTeacherScheduleServer(teacherId: string, dayOfWeek: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("timetables")
      .select("*")
      .eq("day_of_week", dayOfWeek);

    if (error) throw error;
      
    let schedule: { classId: string; period: Period }[] = [];
    
    (data || []).forEach((row: any) => {
      const periods = (row.periods || []) as Period[];
      periods.forEach(p => {
        if (p.teacherId === teacherId) {
          schedule.push({ classId: row.class_id, period: p });
        }
      });
    });

    schedule.sort((a, b) => a.period.startTime.localeCompare(b.period.startTime));

    return { success: true, data: schedule };
  } catch (error: any) {
    console.error("Error fetching teacher schedule:", error);
    return { success: false, error: "Failed to fetch schedule." };
  }
}
