import { Component, OnInit } from '@angular/core'; // Importar OnInit
import { RouterLink } from '@angular/router';
import { AppSettingsService } from '../../services/app-settings.service'; // Importar AppSettingsService
import { CommonModule } from '@angular/common'; // Importar CommonModule

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, CommonModule], // Añadir CommonModule
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit { // Implementar OnInit

  // Propiedades para la sección de liderazgo
  leaderImage1: string = '';
  leaderName1: string = '';
  leaderRole1: string = '';

  leaderImage2: string = '';
  leaderName2: string = '';
  leaderRole2: string = '';

  constructor(private appSettingsService: AppSettingsService) { } // Inyectar AppSettingsService

  ngOnInit(): void {
    this.loadLeadershipSettings();
  }

  loadLeadershipSettings(): void {
    this.appSettingsService.getSetting('about.leadership.image1').subscribe(value => this.leaderImage1 = value || 'assets/images/leader1.jpg');
    this.appSettingsService.getSetting('about.leadership.name1').subscribe(value => this.leaderName1 = value || 'Nombre del Líder 1');
    this.appSettingsService.getSetting('about.leadership.role1').subscribe(value => this.leaderRole1 = value || 'Cargo del Líder 1');

    this.appSettingsService.getSetting('about.leadership.image2').subscribe(value => this.leaderImage2 = value || 'assets/images/leader2.jpg');
    this.appSettingsService.getSetting('about.leadership.name2').subscribe(value => this.leaderName2 = value || 'Nombre del Líder 2');
    this.appSettingsService.getSetting('about.leadership.role2').subscribe(value => this.leaderRole2 = value || 'Cargo del Líder 2');
  }
}
