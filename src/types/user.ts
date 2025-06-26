export interface User {
  id: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  provider: 'github' | 'anonymous';
  createdAt: string;
  publicOctosCount: number;
  totalOctosCount: number;
  isAnonymous: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}