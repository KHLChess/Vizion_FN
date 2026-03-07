import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) { }

  downloadPropertiesReport(format: 'pdf' | 'xls'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/properties?format=${format}`, {
      responseType: 'blob'
    });
  }

  downloadCommissionsReport(format: 'pdf' | 'xls'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/commissions?format=${format}`, {
      responseType: 'blob'
    });
  }
}
