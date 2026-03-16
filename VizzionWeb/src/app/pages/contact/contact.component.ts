import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppSettingsService } from '../../services/app-settings.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Importar DomSanitizer y SafeResourceUrl

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {

  phone: string = '';
  email: string = '';
  address: string = '';
  mapEmbedUrl: SafeResourceUrl = ''; // Cambiado a SafeResourceUrl

  constructor(
    private appSettingsService: AppSettingsService,
    private sanitizer: DomSanitizer // Inyectar DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadContactInfo();
  }

  loadContactInfo(): void {
    this.appSettingsService.getSetting('contact.phone').subscribe(value => this.phone = value || 'N/A');
    this.appSettingsService.getSetting('contact.email').subscribe(value => this.email = value || 'N/A');
    this.appSettingsService.getSetting('contact.address').subscribe(value => this.address = value || 'N/A');
    this.appSettingsService.getSetting('contact.map_embed_url').subscribe(value => {
      if (value) {
        this.mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(value);
      } else {
        this.mapEmbedUrl = '';
      }
    });
  }
}
