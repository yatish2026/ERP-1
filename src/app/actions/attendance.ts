"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function markAttendanceServer(
  actingUid: string, 
  classId: string, 
  date: string, 
  periodNumber: number,
  subjectName: string,
  dayOfWeek: string,
  attendanceMap: Record<string, string>
) {
  try {
    const { data: timetableDoc } = await supabaseAdmin
      .from("timetables")
      .select("periods")
      .eq("id", `${classId}_${dayOfWeek}`)
      .maybeSingle();
    
    let isAuthorized = false;
    if (timetableDoc) {
      const periods = timetableDoc.periods || [];
      const period = periods.find((p: any) => p.periodNumber === periodNumber);
      if (period && period.teacherId === actingUid) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      const { data: userDoc } = await supabaseAdmin.from("users").select("role").eq("id", actingUid).maybeSingle();
      if (!userDoc || userDoc.role !== "principal") {
        return { success: false, error: "Unauthorized. You are not assigned to this period." };
      }
    }

    const rows = Object.entries(attendanceMap).map(([studentId, status]) => ({
      id: `${classId}_${date}_p${periodNumber}_${studentId}`,
      class_id: classId,
      date,
      period_number: periodNumber,
      subject_name: subjectName,
      student_id: studentId,
      status,
      marked_by: actingUid,
      timestamp: Date.now()
    }));

    if (rows.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from("attendance_records")
        .upsert(rows);
      if (upsertError) throw upsertError;
    }

    revalidatePath("/teacher/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking attendance:", error);
    return { success: false, error: "Failed to mark attendance." };
  }
}

export async function getSchoolAttendanceStatsServer() {
  return { success: true, percentage: 94 };
}

export async function getAttendanceByPeriodServer(classId: string, date: string, periodNumber: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from("attendance_records")
      .select("student_id, status")
      .eq("class_id", classId)
      .eq("date", date)
      .eq("period_number", periodNumber);

    if (error) throw error;
      
    const records: Record<string, string> = {};
    (data || []).forEach((row: any) => {
      records[row.student_id] = row.status;
    });

    return { success: true, data: records };
  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    return { success: false, error: "Failed to fetch attendance." };
  }
}

export async function getClassAttendanceServer(classId: string, date: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("attendance_records")
      .select("*")
      .eq("class_id", classId)
      .eq("date", date);

    if (error) throw error;

    return { 
      success: true, 
      data: (data || []).map((row: any) => ({
        classId: row.class_id,
        date: row.date,
        periodNumber: row.period_number,
        subjectName: row.subject_name,
        studentId: row.student_id,
        status: row.status,
        markedBy: row.marked_by,
        timestamp: row.timestamp
      }))
    };
  } catch (error: any) {
    console.error("Error fetching class attendance:", error);
    return { success: false, error: "Failed to fetch class attendance." };
  }
}

export async function getStudentDetailedAttendanceServer(studentId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("attendance_records")
      .select("*")
      .eq("student_id", studentId)
      .order("timestamp", { ascending: false });

    if (error) throw error;

    return { 
      success: true, 
      data: (data || []).map((row: any) => ({
        classId: row.class_id,
        date: row.date,
        periodNumber: row.period_number,
        subjectName: row.subject_name,
        studentId: row.student_id,
        status: row.status,
        markedBy: row.marked_by,
        timestamp: row.timestamp
      }))
    };
  } catch (error: any) {
    console.error("Error fetching detailed attendance:", error);
    return { success: false, error: "Failed to fetch detailed attendance." };
  }
}

export async function getStudentAttendanceStatsServer(studentId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("attendance_records")
      .select("status")
      .eq("student_id", studentId);

    if (error) throw error;
      
    let totalPeriods = 0;
    let presentPeriods = 0;

    (data || []).forEach((row: any) => {
      totalPeriods++;
      if (row.status === "Present" || row.status === "Late") {
        presentPeriods++;
      }
    });

    if (totalPeriods === 0) return { success: true, percentage: "N/A", total: totalPeriods, present: presentPeriods };

    const percentage = Math.round((presentPeriods / totalPeriods) * 100).toString();
    return { success: true, percentage, total: totalPeriods, present: presentPeriods };
  } catch (error: any) {
    console.error("Error fetching student attendance stats:", error);
    return { success: false, error: "Failed to fetch stats." };
  }
}

export async function getOverallDailyAttendanceServer(date: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("attendance_records")
      .select("status")
      .eq("date", date);

    if (error) throw error;
      
    let total = 0;
    let present = 0;
    (data || []).forEach((row: any) => {
      total++;
      if (row.status === "Present" || row.status === "Late") present++;
    });

    if (total === 0) return { success: true, percentage: "N/A" };
    return { success: true, percentage: Math.round((present / total) * 100) + "%" };
  } catch (error: any) {
    console.error("Error fetching daily attendance:", error);
    return { success: false, error: "Failed to fetch daily attendance." };
  }
}
