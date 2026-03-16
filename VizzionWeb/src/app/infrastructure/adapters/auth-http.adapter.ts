import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { AuthGateway } from '../../application/ports/auth.gateway';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpAdapter implements AuthGateway {
  private apiUrl = 'http://localhost:8080/api';
  private authUrl = `${this.apiUrl}/auth`;
  private TOKEN_KEY = 'jwt_token';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(credentials: { email: string, password: string }): Observable<{ jwt: string }> {
    return this.http.post<{ jwt: string }>(`${this.authUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.jwt) {
          this.setToken(response.jwt);
        }
      })
    );
  }

  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  decodeToken(token: string): any | null {
    try {
      return jwtDecode(token);
    } catch (Error) {
      console.error('Error al decodificar el token JWT:', Error);
      return null;
    }
  }

  isTokenValid(token: string): boolean {
    const decodedToken = this.decodeToken(token);
    return decodedToken && decodedToken.exp * 1000 > Date.now();
  }
}
