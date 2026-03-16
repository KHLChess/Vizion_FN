import { inject, PLATFORM_ID } from '@angular/core'; // Importar PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // Importar isPlatformBrowser
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServerStatusService } from '../services/server-status.service';

export const serverStatusInterceptor: HttpInterceptorFn = (req, next) => {
  const serverStatusService = inject(ServerStatusService);
  const platformId = inject(PLATFORM_ID); // Inyectar PLATFORM_ID
  const isBrowser = isPlatformBrowser(platformId); // Determinar si estamos en el navegador

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isBrowser && (error.status === 0 || error.status === 503)) { // Solo actualizar en el navegador
        serverStatusService.setServerDown(true);
      }
      return throwError(() => error);
    })
  );
};
