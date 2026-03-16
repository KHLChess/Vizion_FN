import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
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
  userFullName: string | null = null;
  welcomeMessage: string = '';
  motivationalQuote: { quote: string, author: string } = { quote: '', author: '' };

  // Métricas de descendencia
  dependentsCount: number = 0;
  clientsCount: number = 0;
  referralsCount: number = 0;
  isLoadingMetrics: boolean = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.userFullName = this.authService.getUserFullName();

    if (!this.userRole && this.authService.isLoggedIn()) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }

    this.setDashboardContent();
    this.loadTeamMetrics();
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
        this.welcomeMessage = 'Bienvenido al Dashboard de Vizzion.';
        break;
    }
  }

  loadTeamMetrics(): void {
    const userId = this.authService.getUserId(); // Asumiendo que este método existe en AuthService, si no, usar getUserRole y decodificar
    // Nota: AuthService.getUserId() fue verificado previamente y existe.

    if (userId) {
      this.isLoadingMetrics = true;
      this.userService.getDependents(userId).subscribe({
        next: (dependents) => {
          this.dependentsCount = dependents.length;
          // Filtrar por roles según la lógica de negocio
          this.clientsCount = dependents.filter(u => u.role === 'CLIENT').length;
          // Asumiendo que los referidos tienen rol 'REFERRAL' o similar. Ajustar si es necesario.
          this.referralsCount = dependents.filter(u => u.role === 'REFERRAL' || u.role === 'REFERIDO').length;
          this.isLoadingMetrics = false;
        },
        error: (err) => {
          console.error('Error loading dependents metrics', err);
          this.isLoadingMetrics = false;
        }
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
