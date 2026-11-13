import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type AuthUser = {
  uid: string;
  id: string;
  email?: string | null;
  displayName?: string | null;
};

/**
 * Client-side auth wrapper providing convenient helper functions
 * and compatibility with the application auth lifecycle.
 */
export const auth = {
  get currentUser(): AuthUser | null {
    try {
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
            const data = JSON.parse(localStorage.getItem(key) || "{}");
            const u = data?.user;
            if (u) {
              return {
                uid: u.id,
                id: u.id,
                email: u.email,
                displayName: u.user_metadata?.name || u.user_metadata?.displayName || u.email?.split("@")[0] || ""
              };
            }
          }
        }
      }
    } catch {}
    return null;
  },

  async getUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      uid: user.id,
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.name || user.user_metadata?.displayName || user.email?.split("@")[0] || ""
    };
  },

  onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    let hasReportedUser = false;

    // Check existing active session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user;
      if (u) {
        hasReportedUser = true;
        callback({
          uid: u.id,
          id: u.id,
          email: u.email,
          displayName: u.user_metadata?.name || u.user_metadata?.displayName || u.email?.split("@")[0] || ""
        });
      }
    }).catch(() => {});

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user;
      if (u) {
        hasReportedUser = true;
        callback({
          uid: u.id,
          id: u.id,
          email: u.email,
          displayName: u.user_metadata?.name || u.user_metadata?.displayName || u.email?.split("@")[0] || ""
        });
      } else {
        // Only trigger null if user is signed out
        if (event === "SIGNED_OUT" || event === "INITIAL_SESSION") {
          callback(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  async signOut() {
    return await supabase.auth.signOut();
  }
};
