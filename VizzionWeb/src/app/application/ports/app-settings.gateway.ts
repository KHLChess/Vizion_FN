import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core'; // Importar InjectionToken
import { AppSetting } from '../../models/app-setting.model';

export interface AppSettingsGateway {
  getSettings(): Observable<AppSetting[]>;
  updateSettings(settings: AppSetting[]): Observable<AppSetting[]>;
  uploadSettingImage(settingKey: string, file: File): Observable<AppSetting>;
}

// Definir el InjectionToken para AppSettingsGateway
export const APP_SETTINGS_GATEWAY = new InjectionToken<AppSettingsGateway>('AppSettingsGateway');
