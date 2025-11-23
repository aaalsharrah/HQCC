import { createContext, useContext } from 'react';
import type { User } from 'firebase/auth';

export type AuthProfileFields = {
  displayName?: string;
  year?: string;
  major?: string;
};

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, profile?: AuthProfileFields) => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<User | null>;
  signOutUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return ctx;
};

