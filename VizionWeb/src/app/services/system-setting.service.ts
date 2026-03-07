import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemSettingService {
  private apiUrl = 'http://localhost:8080/api/settings';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las configuraciones del sistema.
   * @returns Un observable con la lista de configuraciones.
   */
  getSettings(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Actualiza una lista de configuraciones.
   * @param settings La lista de objetos de configuración a actualizar.
   * @returns Un observable con la lista de configuraciones actualizadas.
   */
  updateSettings(settings: any[]): Observable<any> {
    return this.http.put<any>(this.apiUrl, settings);
  }

  /**
   * Sube una imagen para una configuración específica.
   * @param settingKey La clave de la configuración a la que se asociará la imagen.
   * @param file El archivo de imagen a subir.
   * @returns Un observable con la configuración actualizada.
   */
  uploadImageForSetting(settingKey: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/${settingKey}/upload-image`, formData);
  }
}
