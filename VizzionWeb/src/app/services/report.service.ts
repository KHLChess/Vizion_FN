import { Injectable, Inject } from '@angular/core'; // Importar Inject
import { Observable } from 'rxjs';
import { ReportGateway, REPORT_GATEWAY } from '../application/ports/report.gateway'; // Importar REPORT_GATEWAY

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(@Inject(REPORT_GATEWAY) private reportGateway: ReportGateway) { }

  downloadPropertiesReport(format: 'pdf' | 'xls'): Observable<Blob> {
    return this.reportGateway.downloadPropertiesReport(format);
  }

  downloadCommissionsReport(format: 'pdf' | 'xls'): Observable<Blob> {
    return this.reportGateway.downloadCommissionsReport(format);
  }
}
