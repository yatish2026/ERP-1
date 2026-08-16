import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

async function setAllClaims() {
  try {
    const auth = getAuth();
    
    // Set Principal
    let user = await auth.getUserByEmail("principal@school.com");
    await auth.setCustomUserClaims(user.uid, { role: "principal" });
    
    // Set Teacher
    user = await auth.getUserByEmail("teacher@school.com");
    await auth.setCustomUserClaims(user.uid, { role: "teacher" });
    
    // Set Class Teacher
    user = await auth.getUserByEmail("class_teacher@school.com");
    await auth.setCustomUserClaims(user.uid, { role: "teacher" });
    
    // Set Student
    user = await auth.getUserByEmail("student@school.com");
    await auth.setCustomUserClaims(user.uid, { role: "student" });
    
    // Set Parent
    user = await auth.getUserByEmail("parent@school.com");
    await auth.setCustomUserClaims(user.uid, { role: "parent" });

    console.log("Successfully set all custom claims!");
    process.exit(0);
  } catch (err) {
    console.error("Error setting claims:", err);
    process.exit(1);
  }
}

setAllClaims();
