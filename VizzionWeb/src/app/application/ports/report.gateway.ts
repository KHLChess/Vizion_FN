import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core'; // Importar InjectionToken

export interface ReportGateway {
  downloadPropertiesReport(format: 'pdf' | 'xls'): Observable<Blob>;
  downloadCommissionsReport(format: 'pdf' | 'xls'): Observable<Blob>;
}

// Definir el InjectionToken para ReportGateway
export const REPORT_GATEWAY = new InjectionToken<ReportGateway>('ReportGateway');
