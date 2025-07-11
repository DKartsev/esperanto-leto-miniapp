declare module "./components/SupabaseAuthProvider.jsx" {
  import { ReactNode } from "react";
  export interface AuthContextValue {
    user: any;
    profile: any;
    loading: boolean;
    error: string | null;
    signIn: (...args: any[]) => Promise<void>;
    signUp: (...args: any[]) => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
  }
  export function SupabaseAuthProvider(props: { children: ReactNode }): JSX.Element;
  export function useAuth(): AuthContextValue;
  export default SupabaseAuthProvider;
}

declare module "./components/AuthModal.jsx" {
  import { ReactNode } from "react";
  export interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: "signin" | "signup";
  }
  export function AuthModal(props: AuthModalProps): JSX.Element;
  export default AuthModal;
}
