import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

export function isFirebaseAdminConfigured(): boolean {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) return false;
  if (
    projectId.includes('your_firebase') ||
    clientEmail.includes('your_service_account') ||
    privateKey.includes('your_key_here')
  ) {
    return false;
  }
  return true;
}

function getAdminApp(): App | null {
  if (getApps().length > 0) return getApps()[0];
  if (!isFirebaseAdminConfigured()) return null;

  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n');
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey,
      }),
    });
  } catch (err) {
    console.warn('[FirebaseAdmin] Failed to initialize admin app:', err);
    return null;
  }
}

let authInstance: Auth | null = null;
const adminApp = getAdminApp();
if (adminApp) {
  try {
    authInstance = getAuth(adminApp);
  } catch (err) {
    console.warn('[FirebaseAdmin] getAuth failed:', err);
  }
}

export const adminAuth = authInstance;

