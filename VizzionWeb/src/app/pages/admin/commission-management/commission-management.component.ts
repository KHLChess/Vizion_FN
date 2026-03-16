import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommissionService } from '../../../services/commission.service';
import { ReportService } from '../../../services/report.service';
// import { ExchangeRateService } from '../../../services/exchange-rate.service'; // Eliminado
import { AuthService } from '../../../services/auth.service';
import { ConfirmationModalComponent } from '../../../components/confirmation-modal/confirmation-modal.component';
import { saveAs } from 'file-saver';
import { HttpErrorResponse } from '@angular/common/http'; // Importar HttpErrorResponse

@Component({
  selector: 'app-commission-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './commission-management.component.html',
  styleUrl: './commission-management.component.scss'
})
export class CommissionManagementComponent implements OnInit {

  commissions: any[] = [];
  filteredCommissions: any[] = [];

  isLoading = false;
  isProcessing = false;
  isGeneratingReport = false;

  showPayModal = false;
  commissionToPay: any = null;

  showVoidModal = false;
  commissionToVoid: any = null;

  showNotesModal = false;
  commissionToEditNotes: any = null;
  currentNotes: string = '';

  showDetailsModal = false;
  commissionToView: any = null;

  // usdToMxnRate = 20.0; // Eliminado

  constructor(
    private commissionService: CommissionService,
    private reportService: ReportService,
    // private exchangeRateService: ExchangeRateService, // Eliminado
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCommissions();
    // this.loadExchangeRate(); // Eliminado
  }

  loadCommissions(): void {
    this.isLoading = true;
    this.commissionService.getAllCommissions().subscribe({
      next: (data) => {
        this.commissions = data;
        this.filterCommissions();
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => { // Tipado explícito
        console.error('Error al cargar comisiones:', err);
        this.isLoading = false;
      }
    });
  }

  // loadExchangeRate(): void { // Eliminado
  //   this.usdToMxnRate = this.exchangeRateService.getRate('USD', 'MXN');
  // }

  generateReport(format: 'pdf' | 'xls'): void {
    this.isGeneratingReport = true;
    this.reportService.downloadCommissionsReport(format).subscribe({
      next: (blob) => {
        const filename = `Reporte_Comisiones_${new Date().toISOString().slice(0,10)}.${format}`;
        saveAs(blob, filename);
        this.isGeneratingReport = false;
      },
      error: (err: HttpErrorResponse) => { // Tipado explícito
        console.error('Error al generar el reporte de comisiones:', err);
        this.isGeneratingReport = false;
      }
    });
  }

  // --- Lógica para Marcar como Pagada ---
  markAsPaid(commission: any): void {
    this.commissionToPay = commission;
    this.showPayModal = true;
  }

  // Se ejecuta al confirmar el pago en el modal
  onConfirmPay(): void {
    if (!this.commissionToPay) return;

    this.isProcessing = true;
    this.commissionService.payCommission(this.commissionToPay.id).subscribe({
      next: (updatedCommission) => {
        this.updateCommissionInList(updatedCommission);
        this.closePayModal();
      },
      error: (err: HttpErrorResponse) => { // Tipado explícito
        console.error('Error al marcar la comisión como pagada:', err);
        this.closePayModal();
      }
    });
  }

  // Cierra el modal de pago
  closePayModal(): void {
    this.showPayModal = false;
    this.isProcessing = false;
    this.commissionToPay = null;
  }

  // --- Lógica para Anular Comisión ---
  voidCommission(commission: any): void {
    this.commissionToVoid = commission;
    this.showVoidModal = true;
  }

  onConfirmVoid(): void {
    if (!this.commissionToVoid) return;

    this.isProcessing = true;
    this.commissionService.voidCommission(this.commissionToVoid.id).subscribe({
      next: (updatedCommission) => {
        this.updateCommissionInList(updatedCommission);
        this.closeVoidModal();
      },
      error: (err: HttpErrorResponse) => { // Tipado explícito
        console.error('Error al anular la comisión:', err);
        this.closeVoidModal();
      }
    });
  }

  closeVoidModal(): void {
    this.showVoidModal = false;
    this.isProcessing = false;
    this.commissionToVoid = null;
  }

  // --- Lógica para Editar Notas ---
  editNotes(commission: any): void {
    this.commissionToEditNotes = commission;
    this.currentNotes = commission.notes || '';
    this.showNotesModal = true;
  }

  onSaveNotes(): void {
    if (!this.commissionToEditNotes) return;

    this.isProcessing = true;
    this.commissionService.updateCommissionNotes(this.commissionToEditNotes.id, this.currentNotes).subscribe({
      next: (updatedCommission) => {
        this.updateCommissionInList(updatedCommission);
        this.closeNotesModal();
      },
      error: (err: HttpErrorResponse) => { // Tipado explícito
        console.error('Error al guardar notas:', err);
        this.closeNotesModal();
      }
    });
  }

  closeNotesModal(): void {
    this.showNotesModal = false;
    this.isProcessing = false;
    this.commissionToEditNotes = null;
    this.currentNotes = '';
  }

  // --- Lógica para Ver Detalles ---
  viewDetails(commission: any): void {
    this.commissionToView = commission;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.commissionToView = null;
  }

  // --- Métodos Auxiliares ---
  private updateCommissionInList(updatedCommission: any): void {
    const index = this.commissions.findIndex(c => c.id === updatedCommission.id);
    if (index !== -1) {
      this.commissions[index] = updatedCommission;
      this.filterCommissions(); // Re-aplicar filtros si los hubiera
    }
  }

  filterCommissions(): void {
    this.filteredCommissions = [...this.commissions];
  }
}
