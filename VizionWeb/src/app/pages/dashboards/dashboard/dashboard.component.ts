import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userRole: string | null = null;
  userFullName: string | null = null; // Nueva propiedad para el nombre completo
  welcomeMessage: string = '';
  motivationalQuote: { quote: string, author: string } = { quote: '', author: '' };

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.userFullName = this.authService.getUserFullName(); // Obtener el nombre completo
    if (!this.userRole && this.authService.isLoggedIn()) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
    this.setDashboardContent();
  }

  setDashboardContent(): void {
    const quotes = [
      { quote: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" },
      { quote: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier" },
      { quote: "La mejor manera de predecir el futuro es crearlo.", author: "Peter Drucker" },
      { quote: "No esperes. El momento nunca será el adecuado.", author: "Napoleon Hill" }
    ];
    this.motivationalQuote = quotes[Math.floor(Math.random() * quotes.length)];

    let welcomeBase = `Bienvenido, ${this.userFullName || 'Usuario'}.`;

    switch (this.userRole) {
      case 'ROOT':
        this.welcomeMessage = `${welcomeBase} Tienes control total sobre el sistema.`;
        break;
      case 'OWNER':
        this.welcomeMessage = `${welcomeBase} Supervisa y gestiona tu negocio.`;
        break;
      case 'MANAGER':
        this.welcomeMessage = `${welcomeBase} Lidera a tu equipo hacia el éxito.`;
        break;
      case 'SELLER':
        this.welcomeMessage = `${welcomeBase} ¡A cerrar esas ventas!`;
        break;
      case 'CLIENT':
        this.welcomeMessage = `${welcomeBase} Explora tus propiedades y oportunidades.`;
        break;
      default:
        this.welcomeMessage = 'Bienvenido al Dashboard de Cosma.';
        break;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
