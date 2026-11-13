import { LoginRequest, RegisterRequest, SessionUser } from '@models/auth/auth.model';

/** Authentication contract. API and mock implementations do not own application state. */
export interface AuthService {
  restoreSession(): Promise<SessionUser | null>;
  login(request: LoginRequest): Promise<SessionUser>;
  register(request: RegisterRequest): Promise<SessionUser>;
  logout(): Promise<void>;
}
