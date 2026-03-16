import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export interface BackupGateway {
  downloadBackup(): Observable<Blob>;
}

export const BACKUP_GATEWAY = new InjectionToken<BackupGateway>('BackupGateway');
