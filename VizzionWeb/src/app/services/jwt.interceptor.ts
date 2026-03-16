import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthGateway, AUTH_GATEWAY } from '../application/ports/auth.gateway'; // Importar AuthGateway y AUTH_GATEWAY

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authGateway = inject(AUTH_GATEWAY); // Inyectar AuthGateway directamente
  const token = authGateway.getToken(); // Usar el método del gateway

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
