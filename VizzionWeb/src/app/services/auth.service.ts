import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  private authUrl = `${this.apiUrl}/auth`;
  private usersUrl = `${this.apiUrl}/usuarios`;

  public loginStatusChanged = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  login(credentials: { email: string, password: string }): Observable<{ jwt: string }> {
    return this.http.post<{ jwt: string }>(`${this.authUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.jwt && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('jwt_token', response.jwt);
          this.loginStatusChanged.next(true);
        }
      })
    );
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('jwt_token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.exp * 1000 > Date.now();
      } catch (Error) {
        return false;
      }
    }
    return false;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log('Rol del usuario decodificado:', decodedToken.role); // LOG
        return decodedToken.role || null;
      } catch (Error) {
        console.error('Error al decodificar el token JWT para obtener el rol:', Error);
        return null;
      }
    }
    return null;
  }

  getUserFullName(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.fullName || null;
      } catch (Error) {
        console.error('Error al decodificar el token JWT para obtener el nombre completo:', Error);
        return null;
      }
    }
    return null;
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.userId || null;
      } catch (Error) {
        console.error('Error al decodificar el token JWT para obtener el ID de usuario:', Error);
        return null;
      }
    }
    return null;
  }

  deleteAccount(): Observable<any> {
    const userId = this.getUserId();
    if (userId) {
      return this.http.delete(`${this.usersUrl}/${userId}`);
    } else {
      return new Observable(observer => {
        observer.error('No se pudo obtener el ID de usuario del token.');
      });
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
      this.loginStatusChanged.next(false);
    }
  }
}
