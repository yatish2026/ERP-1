const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const dotenv = require("dotenv");
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

const db = getFirestore();
db.settings({ preferRest: true });
const auth = getAuth();

const users = [
  { email: "principal@school.com", password: "password123", role: "principal", name: "Dr. Principal" },
  { email: "teacher@school.com", password: "password123", role: "teacher", name: "Mr. Teacher" },
  { email: "class_teacher@school.com", password: "password123", role: "class_teacher", name: "Mrs. Class Teacher" },
  { email: "student@school.com", password: "password123", role: "student", name: "Student Rahul" },
  { email: "parent@school.com", password: "password123", role: "parent", name: "Parent Sharma" },
];

async function seed() {
  console.log("Seeding users...");
  for (const u of users) {
    try {
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(u.email);
        console.log(`User ${u.email} already exists in Auth.`);
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          userRecord = await auth.createUser({
            email: u.email,
            password: u.password,
            displayName: u.name,
          });
          console.log(`Created Auth user: ${u.email}`);
        } else {
          throw err;
        }
      }

      await db.collection("users").doc(userRecord.uid).set({
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      
      console.log(`Created/Updated Firestore profile for: ${u.email}`);
    } catch (e) {
      console.error(`Failed to seed ${u.email}:`, e.message);
    }
  }
  console.log("Seeding complete!");
  process.exit(0);
}

seed();
