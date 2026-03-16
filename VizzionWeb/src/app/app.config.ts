import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './services/jwt.interceptor';
import { errorInterceptor } from './services/error.interceptor';
import { serverStatusInterceptor } from './interceptors/server-status.interceptor';

// Importar los InjectionTokens y los adaptadores
import { AUTH_GATEWAY } from './application/ports/auth.gateway';
import { AuthHttpAdapter } from './infrastructure/adapters/auth-http.adapter';
import { PROPERTY_GATEWAY } from './application/ports/property.gateway';
import { PropertyHttpAdapter } from './infrastructure/adapters/property-http.adapter';
import { USER_GATEWAY } from './application/ports/user.gateway';
import { UserHttpAdapter } from './infrastructure/adapters/user-http.adapter';
import { BACKUP_GATEWAY } from './application/ports/backup.gateway'; // Re-añadido
import { BackupHttpAdapter } from './infrastructure/adapters/backup-http.adapter'; // Re-añadido
import { REPORT_GATEWAY } from './application/ports/report.gateway';
import { ReportHttpAdapter } from './infrastructure/adapters/report-http.adapter';
import { COMMISSION_GATEWAY } from './application/ports/commission.gateway';
import { CommissionHttpAdapter } from './infrastructure/adapters/commission-http.adapter';
import { APP_SETTINGS_GATEWAY } from './application/ports/app-settings.gateway';
import { AppSettingsHttpAdapter } from './infrastructure/adapters/app-settings-http.adapter';
import { HEALTH_CHECK_GATEWAY } from './application/ports/health-check.gateway';
import { HealthCheckHttpAdapter } from './infrastructure/adapters/health-check-http.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        jwtInterceptor,
        errorInterceptor,
        serverStatusInterceptor
      ])
    ),
    // Proveedores para los Gateways
    { provide: AUTH_GATEWAY, useClass: AuthHttpAdapter },
    { provide: PROPERTY_GATEWAY, useClass: PropertyHttpAdapter },
    { provide: USER_GATEWAY, useClass: UserHttpAdapter },
    { provide: BACKUP_GATEWAY, useClass: BackupHttpAdapter },
    { provide: REPORT_GATEWAY, useClass: ReportHttpAdapter },
    { provide: COMMISSION_GATEWAY, useClass: CommissionHttpAdapter },
    { provide: APP_SETTINGS_GATEWAY, useClass: AppSettingsHttpAdapter },
    { provide: HEALTH_CHECK_GATEWAY, useClass: HealthCheckHttpAdapter }
  ]
};
