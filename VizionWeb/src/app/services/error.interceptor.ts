import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          // Si el error 401 ocurre en la ruta de login, no redirigir, solo re-lanzar
          if (error.status === 401 && request.url.includes('/api/auth/login')) {
            console.warn('Error 401 en la ruta de login. Permitiendo que el componente lo maneje.');
            return throwError(() => error); // Re-lanzar el error para que el LoginComponent lo capture
          }

          // Para otros errores 401/403 en otras rutas, o 403 en login, redirigir
          console.warn(`Error ${error.status}: Acceso denegado o no autorizado. Redirigiendo...`);
          this.authService.logout(); // Limpiar el token
          this.router.navigate(['/unauthorized']); // Redirigir a la página de no autorizado
        }
        return throwError(() => error); // Re-lanzar el error para que otros manejadores puedan capturarlo
      })
    );
  }
}
