import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private apiUrl = 'http://localhost:8080/api/admin/backup';

  constructor(private http: HttpClient) { }

  /**
   * Descarga un respaldo de la base de datos.
   * @returns Un observable con el respaldo como un Blob.
   */
  downloadBackup(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download`, {
      responseType: 'blob'
    });
  }
}
