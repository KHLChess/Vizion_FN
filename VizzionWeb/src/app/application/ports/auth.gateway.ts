import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core'; // Importar InjectionToken

export interface AuthGateway {
  login(credentials: { email: string, password: string }): Observable<{ jwt: string }>;
  setToken(token: string): void;
  getToken(): string | null;
  removeToken(): void;
  decodeToken(token: string): any | null; // Decodifica el token sin validar
  isTokenValid(token: string): boolean; // Valida si el token es válido (no expirado)
}

// Definir el InjectionToken para AuthGateway
export const AUTH_GATEWAY = new InjectionToken<AuthGateway>('AuthGateway');
