import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackupService } from '../../../services/backup.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationModalComponent } from '../../../components/confirmation-modal/confirmation-modal.component';
import { saveAs } from 'file-saver';
import { HttpErrorResponse } from '@angular/common/http'; // Importar HttpErrorResponse

@Component({
  selector: 'app-advanced-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './advanced-settings.component.html',
  styleUrl: './advanced-settings.component.scss'
})
export class AdvancedSettingsComponent implements OnInit {

  isDownloadingBackup = false;
  successMessage = '';
  errorMessage = '';
  showBackupSuccessModal = false;

  constructor(
    private backupService: BackupService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  downloadBackup(): void {
    this.isDownloadingBackup = true;
    this.clearMessages();
    this.backupService.downloadBackup().subscribe({
      next: (blob: Blob) => { // Tipado explícito
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
        const filename = `vizzion_db_backup_${timestamp}.sql`;
        saveAs(blob, filename);
        this.isDownloadingBackup = false;
        this.showBackupSuccessModal = true;
      },
      error: (err: HttpErrorResponse) => { // Tipado explícito
        this.errorMessage = 'Error al generar el respaldo de la base de datos.';
        this.isDownloadingBackup = false;
        console.error(err);
      }
    });
  }

  closeBackupSuccessModal(): void {
    this.showBackupSuccessModal = false;
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
