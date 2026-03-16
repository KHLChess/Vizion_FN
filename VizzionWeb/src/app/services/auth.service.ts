import { Injectable, Inject } from '@angular/core'; // Importar Inject
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthGateway, AUTH_GATEWAY } from '../application/ports/auth.gateway'; // Importar AUTH_GATEWAY

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public loginStatusChanged = new Subject<boolean>();

  // Inyectar el puerto AuthGateway usando @Inject y el InjectionToken
  constructor(@Inject(AUTH_GATEWAY) private authGateway: AuthGateway) { }

  login(credentials: { email: string, password: string }): Observable<{ jwt: string }> {
    return this.authGateway.login(credentials).pipe(
      tap(response => {
        if (response && response.jwt) {
          this.authGateway.setToken(response.jwt);
          this.loginStatusChanged.next(true);
        }
      })
    );
  }

  isLoggedIn(): boolean {
    const token = this.authGateway.getToken();
    return token ? this.authGateway.isTokenValid(token) : false;
  }

  getUserRole(): string | null {
    const token = this.authGateway.getToken();
    if (token) {
      const decodedToken: any = this.authGateway.decodeToken(token);
      if (decodedToken) {
        let role = decodedToken.role;

        if (!role && decodedToken.authorities && decodedToken.authorities.length > 0) {
            const auth = decodedToken.authorities[0];
            role = typeof auth === 'string' ? auth : auth.authority;
        }

        if (role && typeof role === 'string' && role.startsWith('ROLE_')) {
            role = role.substring(5);
        }
        return role || null;
      }
    }
    return null;
  }

  getUserFullName(): string | null {
    const token = this.authGateway.getToken();
    if (token) {
      const decodedToken: any = this.authGateway.decodeToken(token);
      return decodedToken ? decodedToken.fullName || null : null;
    }
    return null;
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  getUserId(): number | null {
    const token = this.authGateway.getToken();
    if (token) {
      const decodedToken: any = this.authGateway.decodeToken(token);
      return decodedToken ? decodedToken.userId || null : null;
    }
    return null;
  }

  logout(): void {
    this.authGateway.removeToken();
    this.loginStatusChanged.next(false);
  }
}
