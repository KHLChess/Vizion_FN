import { Component, OnInit } from '@angular/core'; // Importar OnInit
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { AppSettingsService } from '../../services/app-settings.service'; // Importar AppSettingsService

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule], // Añadir CommonModule
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit { // Implementar OnInit

  phone: string = '';
  email: string = '';
  address: string = '';

  constructor(private appSettingsService: AppSettingsService) { } // Inyectar AppSettingsService

  ngOnInit(): void {
    this.loadContactInfo();
  }

  loadContactInfo(): void {
    this.appSettingsService.getSetting('contact.phone').subscribe(value => this.phone = value || 'N/A');
    this.appSettingsService.getSetting('contact.email').subscribe(value => this.email = value || 'N/A');
    this.appSettingsService.getSetting('contact.address').subscribe(value => this.address = value || 'N/A');
  }
}
