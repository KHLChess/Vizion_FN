import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; // Importar Inject y PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // Importar isPlatformBrowser
import { Observable, timer } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { ServerStatusService } from './server-status.service';
import { HealthCheckGateway, HEALTH_CHECK_GATEWAY } from '../application/ports/health-check.gateway';

@Injectable({
  providedIn: 'root'
})
export class HealthCheckService {
  private isBrowser: boolean;

  constructor(
    @Inject(HEALTH_CHECK_GATEWAY) private healthCheckGateway: HealthCheckGateway,
    private serverStatusService: ServerStatusService,
    @Inject(PLATFORM_ID) private platformId: Object // Inyectar PLATFORM_ID
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Determinar si estamos en el navegador
  }

  ping(): Observable<boolean> {
    return this.healthCheckGateway.checkBackendHealth();
  }

  startMonitoring(interval: number = 10000): void {
    if (this.isBrowser) { // Solo iniciar el monitoreo en el navegador
      timer(0, interval).pipe(
        switchMap(() => this.ping().pipe(
          tap(isHealthy => {
            if (isHealthy) {
              this.serverStatusService.setServerDown(false);
            } else {
              this.serverStatusService.setServerDown(true);
            }
          }),
          catchError(() => {
            this.serverStatusService.setServerDown(true);
            return [];
          })
        ))
      ).subscribe();
    }
  }
}
