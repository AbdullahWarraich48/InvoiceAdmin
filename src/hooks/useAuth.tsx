import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

type AppRole = "super_admin" | "generator" | "viewer_printer";

interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  roles: AppRole[];
}

interface AuthContextType {
  session: { user: User } | null;
  user: User | null;
  profile: { id: string; name: string; email: string; is_active: boolean } | null;
  roles: AppRole[];
  loading: boolean;
  isSuperAdmin: boolean;
  isGenerator: boolean;
  isViewerPrinter: boolean;
  isActive: boolean;
  signOut: () => Promise<void>;
  refreshAuth?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshAuth = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { user: userData } = await api.getMe();
        setUser(userData);
        setProfile({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          is_active: userData.is_active
        });
        setRoles(userData.roles || []);
        setSession({ user: userData });
      } catch (error) {
        console.error('Auth check failed:', error);
        api.setToken(null);
        setUser(null);
        setProfile(null);
        setRoles([]);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [refreshTrigger]);

  const signOut = async () => {
    api.setToken(null);
    setUser(null);
    setProfile(null);
    setRoles([]);
    setSession(null);
  };

  // Expose refresh function via context
  const contextValue = {
    session,
    user,
    profile,
    roles,
    loading,
    isSuperAdmin: roles.includes("super_admin"),
    isGenerator: roles.includes("generator"),
    isViewerPrinter: roles.includes("viewer_printer"),
    isActive: profile?.is_active ?? false,
    signOut,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
