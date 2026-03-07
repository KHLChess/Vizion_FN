import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServerStatusService } from '../services/server-status.service';

@Injectable()
export class ServerStatusInterceptor implements HttpInterceptor {

  constructor(private serverStatusService: ServerStatusService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0 || error.status === 503) {
          this.serverStatusService.setServerDown(true);
        }
        return throwError(() => error);
      })
    );
  }
}
