import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { AppSettingsService } from '../../services/app-settings.service'; // Importar AppSettingsService
import { Property } from '../../models/property.model';
import { ServiceItem } from '../../models/service-item.model';
import { PropertyImagePipe } from '../../pipes/property-image.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, PropertyImagePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private appSettingsService = inject(AppSettingsService); // Inyectar AppSettingsService

  featuredProperties: Property[] = [];

  // Propiedades para la sección principal (hero)
  heroTitle: string = '';
  heroSubtitle: string = '';
  heroBackgroundImage: string = '';
  heroCtaButtonText: string = '';
  heroCtaButtonLink: string = '';

  // Propiedades para la sección de servicios (homepage)
  servicesTitle: string = '';
  servicesDescription: string = '';

  // Los serviceItems ahora se poblarán con datos dinámicos si es necesario, o se mantendrán estáticos
  // por ahora, solo actualizaremos el título y descripción de la sección
  services: ServiceItem[] = [
    {
      title: 'Arquitectura Viva',
      description: 'Diseño bioclimático y estructural que fusiona estética con funcionalidad sostenible.',
      icon: 'architecture'
    },
    {
      title: 'Ecosistema Digital',
      description: 'Plataforma tecnológica propia para la gestión transparente de su inversión inmobiliaria.',
      icon: 'hub'
    },
    {
      title: 'Desarrollo Integral',
      description: 'Desde la cimentación hasta la llave en mano, garantizando plusvalía y calidad.',
      icon: 'apartment'
    }
  ];

  ngOnInit(): void {
    this.propertyService.getFeaturedProperties().subscribe((properties: Property[]) => {
      this.featuredProperties = properties;
    });

    this.loadHeroSettings();
    this.loadServicesSettings();
  }

  loadHeroSettings(): void {
    this.appSettingsService.getSetting('homepage.hero.title').subscribe(value => this.heroTitle = value || 'Encuentra tu Hogar Ideal');
    this.appSettingsService.getSetting('homepage.hero.subtitle').subscribe(value => this.heroSubtitle = value || 'Explora propiedades exclusivas y vive la vida que siempre soñaste.');
    this.appSettingsService.getSetting('homepage.hero.background_image').subscribe(value => this.heroBackgroundImage = value || 'assets/images/hero-bg.jpg');
    this.appSettingsService.getSetting('homepage.hero.cta_button_text').subscribe(value => this.heroCtaButtonText = value || 'Ver Propiedades');
    this.appSettingsService.getSetting('homepage.hero.cta_button_link').subscribe(value => this.heroCtaButtonLink = value || '/propiedades');
  }

  loadServicesSettings(): void {
    this.appSettingsService.getSetting('homepage.services.title').subscribe(value => this.servicesTitle = value || 'Nuestros Servicios');
    this.appSettingsService.getSetting('homepage.services.description').subscribe(value => this.servicesDescription = value || 'Ofrecemos una gama completa de servicios inmobiliarios para satisfacer todas tus necesidades.');
  }
}
