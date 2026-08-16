"use server";

import { adminDb } from "@/lib/firebase/admin";

export async function getSchoolFeesStatsServer() {
  try {
    const snapshot = await adminDb.collection("fees").get();
    
    if (snapshot.empty) {
      // If there's no data, return 0 instead of a hardcoded millions number
      return { success: true, totalCollected: 0 };
    }
    
    let total = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      // Assume documents have an amount field
      if (data.amount && typeof data.amount === "number") {
        total += data.amount;
      }
    });

    return { success: true, totalCollected: total };
  } catch (error: any) {
    console.error("Error fetching school fees stats:", error);
    return { success: false, error: "Failed to fetch fee stats." };
  }
}
