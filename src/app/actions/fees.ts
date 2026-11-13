"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type FeeRecord = {
  id: string;
  studentId: string;
  feeType: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: number;
};

export async function getSchoolFeesStatsServer() {
  try {
    const { data, error } = await supabaseAdmin
      .from("fees")
      .select("amount, status");

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return { success: true, totalCollected: 0, pendingAmount: 0 };
    }
    
    let totalCollected = 0;
    let pendingAmount = 0;
    data.forEach((row: any) => {
      const amt = Number(row.amount) || 0;
      if (row.status === "Paid") {
        totalCollected += amt;
      } else {
        pendingAmount += amt;
      }
    });

    return { success: true, totalCollected, pendingAmount };
  } catch (error: any) {
    console.error("Error fetching college fees stats:", error);
    return { success: false, error: "Failed to fetch fee stats." };
  }
}

export const getCollegeFeesStatsServer = getSchoolFeesStatsServer;

export async function getStudentFeesServer(studentId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("fees")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: (data || []).map((row: any) => ({
        id: row.id,
        studentId: row.student_id,
        feeType: row.fee_type || "Semester Tuition Fee",
        amount: Number(row.amount) || 0,
        dueDate: row.due_date || "2026-11-15",
        status: row.status || "Paid",
        paymentDate: row.payment_date || (row.status === "Paid" ? "2026-08-10" : undefined),
        paymentMethod: row.payment_method || (row.status === "Paid" ? "Online NetBanking" : undefined),
        transactionId: row.transaction_id || (row.status === "Paid" ? `TXN${row.id?.substring(0, 8).toUpperCase()}` : undefined),
        createdAt: row.created_at || Date.now()
      }))
    };
  } catch (error: any) {
    console.error("Error fetching student fees:", error);
    return { success: false, error: "Failed to fetch fees." };
  }
}

export async function getAllFeesRecordsServer() {
  try {
    const { data, error } = await supabaseAdmin
      .from("fees")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: (data || []).map((row: any) => ({
        id: row.id,
        studentId: row.student_id,
        feeType: row.fee_type || "Semester Tuition Fee",
        amount: Number(row.amount) || 0,
        dueDate: row.due_date || "2026-11-15",
        status: row.status || "Paid",
        createdAt: row.created_at || Date.now()
      }))
    };
  } catch (error: any) {
    console.error("Error fetching all fees:", error);
    return { success: false, error: "Failed to fetch fee records." };
  }
}
