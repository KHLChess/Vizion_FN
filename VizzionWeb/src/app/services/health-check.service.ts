import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { ServerStatusService } from './server-status.service';

@Injectable({
  providedIn: 'root'
})
export class HealthCheckService {
  private healthUrl = 'http://localhost:8080/api/health';

  constructor(
    private http: HttpClient,
    private serverStatusService: ServerStatusService
  ) { }

  ping(): Observable<any> {
    return this.http.get(this.healthUrl, { responseType: 'text' });
  }

  startMonitoring(interval: number = 10000): void {
    timer(0, interval).pipe(
      switchMap(() => this.ping().pipe(
        tap(() => this.serverStatusService.setServerDown(false)),
        catchError(() => {
          this.serverStatusService.setServerDown(true);
          return [];
        })
      ))
    ).subscribe();
  }
}
