import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BackupGateway, BACKUP_GATEWAY } from '../application/ports/backup.gateway';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  constructor(@Inject(BACKUP_GATEWAY) private backupGateway: BackupGateway) { }

  /**
   * Descarga un respaldo de la base de datos.
   * @returns Un observable con el respaldo como un Blob.
   */
  downloadBackup(): Observable<Blob> {
    return this.backupGateway.downloadBackup();
  }
}
