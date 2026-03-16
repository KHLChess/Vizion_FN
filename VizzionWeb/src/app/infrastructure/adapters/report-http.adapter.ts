import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportGateway } from '../../application/ports/report.gateway';

@Injectable({
  providedIn: 'root'
})
export class ReportHttpAdapter implements ReportGateway {
  private apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) { }

  downloadPropertiesReport(format: 'pdf' | 'xls'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/properties`, {
      params: { format },
      responseType: 'blob'
    });
  }

  downloadCommissionsReport(format: 'pdf' | 'xls'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/commissions`, {
      params: { format },
      responseType: 'blob'
    });
  }
}
