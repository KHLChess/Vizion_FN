import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-server-down',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './server-down.component.html',
  styleUrls: ['./server-down.component.scss']
})
export class ServerDownComponent {
  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
