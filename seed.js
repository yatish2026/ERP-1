import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

async function seedPrincipal() {
  const email = "principal@school.com";
  const password = "password123";
  let uid = "";

  try {
    const userRecord = await auth.getUserByEmail(email);
    console.log("User already exists:", userRecord.uid);
    uid = userRecord.uid;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      const newUser = await auth.createUser({
        email: email,
        password: password,
        displayName: "Admin Principal",
      });
      console.log("Created new user:", newUser.uid);
      uid = newUser.uid;
    } else {
      console.error("Error checking user:", error);
      return;
    }
  }

  // Set custom claims if needed
  await auth.setCustomUserClaims(uid, { role: 'principal' });

  // Add to Firestore users collection
  await db.collection('users').doc(uid).set({
    email: email,
    name: "Admin Principal",
    role: "principal",
    createdAt: new Date().toISOString()
  });

  console.log(`Successfully seeded principal user!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  process.exit(0);
}

seedPrincipal();
