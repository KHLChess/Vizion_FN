import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() isLoading = false;
  @Input() title = 'Confirmación';
  @Input() message = '¿Está seguro de realizar esta acción?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() type: 'info' | 'warning' | 'danger' | 'success' = 'info';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    if (!this.isLoading) {
      this.confirm.emit();
    }
  }

  onCancel(): void {
    if (!this.isLoading) {
      this.cancel.emit();
    }
  }

  get icon(): string {
    switch (this.type) {
      case 'warning': return 'warning';
      case 'danger': return 'error_outline';
      case 'success': return 'check_circle';
      default: return 'info';
    }
  }

  get colorClass(): string {
    return `modal-${this.type}`;
  }
}
