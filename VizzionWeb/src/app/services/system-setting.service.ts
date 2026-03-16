import { Injectable, Inject } from '@angular/core'; // Importar Inject
import { Observable } from 'rxjs';
import { AppSettingsGateway, APP_SETTINGS_GATEWAY } from '../application/ports/app-settings.gateway'; // Importar APP_SETTINGS_GATEWAY
import { AppSetting } from '../models/app-setting.model';

@Injectable({
  providedIn: 'root'
})
export class SystemSettingService {
  constructor(@Inject(APP_SETTINGS_GATEWAY) private appSettingsGateway: AppSettingsGateway) { }

  /**
   * Obtiene todas las configuraciones del sistema.
   * @returns Un observable con la lista de configuraciones.
   */
  getSettings(): Observable<AppSetting[]> {
    return this.appSettingsGateway.getSettings();
  }

  /**
   * Actualiza una lista de configuraciones.
   * @param settings La lista de objetos de configuración a actualizar.
   * @returns Un observable con la lista de configuraciones actualizadas.
   */
  updateSettings(settings: AppSetting[]): Observable<AppSetting[]> {
    return this.appSettingsGateway.updateSettings(settings);
  }

  /**
   * Sube una imagen para una configuración específica.
   * @param settingKey La clave de la configuración a la que se asociará la imagen.
   * @param file El archivo de imagen a subir.
   * @returns Un observable con la configuración actualizada.
   */
  uploadImageForSetting(settingKey: string, file: File): Observable<AppSetting> {
    return this.appSettingsGateway.uploadSettingImage(settingKey, file);
  }
}
