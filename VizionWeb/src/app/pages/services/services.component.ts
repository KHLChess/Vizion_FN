import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppSettingsService } from '../../services/app-settings.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {

  serviceImage1: string = '';
  serviceImage2: string = '';
  serviceImage3: string = ''; // Nueva propiedad para la tercera imagen

  constructor(
    private authService: AuthService,
    private router: Router,
    private appSettingsService: AppSettingsService
  ) { }

  ngOnInit(): void {
    this.loadServiceImages();
  }

  loadServiceImages(): void {
    this.appSettingsService.getSetting('homepage.services.image1').subscribe(value => this.serviceImage1 = value || 'assets/images/service1.jpg');
    this.appSettingsService.getSetting('homepage.services.image2').subscribe(value => this.serviceImage2 = value || 'assets/images/service2.jpg');
    this.appSettingsService.getSetting('homepage.services.image3').subscribe(value => this.serviceImage3 = value || 'https://picsum.photos/id/588/600/400'); // Cargar la tercera imagen
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  onLoginClick(): void {
    this.router.navigate(['/login']);
  }

  onLogoutClick(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
