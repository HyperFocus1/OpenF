import { LoginRequest, RegisterRequest, SessionUser } from '../models/session';

/** Transport contract. Session owns state; gateways only perform session operations. */
export interface SessionGateway {
  read(): Promise<SessionUser | null>;
  login(request: LoginRequest): Promise<SessionUser>;
  register(request: RegisterRequest): Promise<SessionUser>;
  logout(): Promise<void>;
}
