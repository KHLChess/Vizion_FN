import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        if (error.status === 401 && req.url.includes('/api/auth/login')) {
          console.warn('Error 401 en la ruta de login. Permitiendo que el componente lo maneje.');
          return throwError(() => error);
        }

        console.warn(`Error ${error.status}: Acceso denegado o no autorizado. Redirigiendo...`);
        authService.logout();
        router.navigate(['/unauthorized']);
      }
      return throwError(() => error);
    })
  );
};
