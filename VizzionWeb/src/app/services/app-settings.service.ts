import { Injectable } from '@angular/core';
import { SystemSettingService } from './system-setting.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  private settingsCache: { [key: string]: any } = {};
  private settingsLoaded = new BehaviorSubject<boolean>(false);

  constructor(private systemSettingService: SystemSettingService) {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.systemSettingService.getSettings().pipe(
      tap(settings => {
        settings.forEach(setting => {
          this.settingsCache[setting.key] = setting.value;
        });
        this.settingsLoaded.next(true);
      })
    ).subscribe();
  }

  getSetting(key: string): Observable<any> {
    return this.settingsLoaded.pipe(
      map(loaded => {
        if (loaded) {
          return this.settingsCache[key];
        }
        // Si no están cargadas, se podría forzar una recarga o devolver un valor por defecto
        // Por ahora, asumimos que siempre se cargarán al inicio
        return null;
      })
    );
  }

  // Método para forzar la recarga de las configuraciones (útil después de un guardado)
  reloadSettings(): void {
    this.settingsLoaded.next(false); // Indicar que las configuraciones no están cargadas
    this.settingsCache = {}; // Limpiar caché
    this.loadSettings(); // Recargar
  }
}
