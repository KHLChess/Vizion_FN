import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackupGateway } from '../../application/ports/backup.gateway';

@Injectable({
  providedIn: 'root'
})
export class BackupHttpAdapter implements BackupGateway {
  private apiUrl = 'http://localhost:8080/api/admin/backup';

  constructor(private http: HttpClient) { }

  downloadBackup(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download`, { responseType: 'blob' });
  }
}
