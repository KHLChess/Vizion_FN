import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemSettingService } from '../../../services/system-setting.service';
import { AuthService } from '../../../services/auth.service';
import { AppSettingsService } from '../../../services/app-settings.service';
import { ConfirmationModalComponent } from '../../../components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-settings-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './settings-management.component.html',
  styleUrl: './settings-management.component.scss'
})
export class SettingsManagementComponent implements OnInit {

  settings: any[] = [];
  groupedSettings: { [key: string]: any[] } = {};
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  showSaveSuccessModal = false;

  constructor(
    private systemSettingService: SystemSettingService,
    private authService: AuthService,
    private appSettingsService: AppSettingsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.systemSettingService.getSettings().subscribe({
      next: (data) => {
        this.settings = data;
        this.groupSettingsByCategory();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar la configuración.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  groupSettingsByCategory(): void {
    this.groupedSettings = this.settings.reduce((acc, setting) => {
      const category = this.getCategoryFromKey(setting.key);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(setting);
      return acc;
    }, {});
  }

  getCategoryFromKey(key: string): string {
    if (key.startsWith('seller.commission') || key.startsWith('client.referral')) {
      return 'Comisiones';
    } else if (key.startsWith('homepage.hero')) {
      return 'Página de Inicio - Sección Principal';
    } else if (key.startsWith('homepage.services')) {
      return 'Página de Inicio - Sección Servicios';
    } else if (key.startsWith('contact')) {
      return 'Información de Contacto';
    }
    return 'General';
  }

  getCategoryKeys(): string[] {
    return Object.keys(this.groupedSettings);
  }

  onFileSelected(event: any, setting: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        setting.tempPreviewUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);

      this.isSaving = true;
      this.clearMessages();
      this.systemSettingService.uploadImageForSetting(setting.key, file).subscribe({
        next: (updatedSetting) => {
          setting.value = updatedSetting.value;
          setting.tempPreviewUrl = null;
          this.successMessage = `Imagen para '${setting.description}' subida exitosamente.`;
          this.isSaving = false;
          this.appSettingsService.reloadSettings();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = `Error al subir la imagen para '${setting.description}'.`;
          this.isSaving = false;
          setting.tempPreviewUrl = null;
          this.cdr.detectChanges();
          console.error(err);
        }
      });
    }
  }

  saveSettings(): void {
    this.isSaving = true;
    this.clearMessages();
    this.systemSettingService.updateSettings(this.settings).subscribe({
      next: () => {
        this.isSaving = false;
        this.showSaveSuccessModal = true;
        this.appSettingsService.reloadSettings();
      },
      error: (err) => {
        this.errorMessage = 'Error al guardar la configuración.';
        this.isSaving = false;
        console.error(err);
      }
    });
  }

  closeSaveSuccessModal(): void {
    this.showSaveSuccessModal = false;
  }

  isRootUser(): boolean {
    return this.authService.hasRole('ROOT');
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
