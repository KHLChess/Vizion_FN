import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HealthCheckGateway } from '../../application/ports/health-check.gateway';

@Injectable({
  providedIn: 'root'
})
export class HealthCheckHttpAdapter implements HealthCheckGateway {
  private apiUrl = 'http://localhost:8080/api/health';

  constructor(private http: HttpClient) { }

  checkBackendHealth(): Observable<boolean> {
    console.log('HealthCheckHttpAdapter: Realizando llamada a la API de salud:', this.apiUrl);
    // Especificar responseType: 'text' para que HttpClient no intente parsear como JSON
    return this.http.get(this.apiUrl, { observe: 'response', responseType: 'text' }).pipe(
      map(response => {
        console.log('HealthCheckHttpAdapter: Respuesta de la API de salud:', response.status, response.body); // Añadido body para depuración
        return response.status === 200 && response.body === 'OK'; // Verificar también el cuerpo
      }),
      catchError((error) => {
        console.error('HealthCheckHttpAdapter: Error al verificar la salud del backend:', error);
        return of(false);
      })
    );
  }
}
