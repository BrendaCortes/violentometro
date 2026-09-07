'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';

interface AuthContextType {
  session: import('next-auth').Session | null;
  user: { id: string; email: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        return { error: 'Correo o contraseña incorrectos' };
      }
      return { error: null };
    } catch {
      return { error: 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/' });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user as { id: string; email: string } | null,
        loading: status === 'loading' || loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
