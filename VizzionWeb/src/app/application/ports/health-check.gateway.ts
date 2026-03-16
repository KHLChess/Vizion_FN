import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core'; // Importar InjectionToken

export interface HealthCheckGateway {
  checkBackendHealth(): Observable<boolean>;
}

// Definir el InjectionToken para HealthCheckGateway
export const HEALTH_CHECK_GATEWAY = new InjectionToken<HealthCheckGateway>('HealthCheckGateway');
