import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettingsGateway } from '../../application/ports/app-settings.gateway';
import { AppSetting } from '../../models/app-setting.model';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsHttpAdapter implements AppSettingsGateway {
  private apiUrl = 'http://localhost:8080/api/settings';

  constructor(private http: HttpClient) { }

  getSettings(): Observable<AppSetting[]> {
    return this.http.get<AppSetting[]>(this.apiUrl);
  }

  updateSettings(settings: AppSetting[]): Observable<AppSetting[]> {
    return this.http.put<AppSetting[]>(this.apiUrl, settings);
  }

  uploadSettingImage(settingKey: string, file: File): Observable<AppSetting> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<AppSetting>(`${this.apiUrl}/${settingKey}/upload-image`, formData);
  }
}
