import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-authenticated-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './authenticated-navbar.component.html',
  styleUrl: './authenticated-navbar.component.scss'
})
export class AuthenticatedNavbarComponent {
  // isScrolled = false; // Propiedad eliminada
  isMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) { }

  // @HostListener('window:scroll', []) // HostListener eliminado
  // onWindowScroll() {
  //   this.isScrolled = window.scrollY > 50;
  // }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getUserRole(): string | null {
    return this.authService.getUserRole();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeMenu();
  }

  onDeleteAccount(): void {
    this.closeMenu();
    if (confirm('¿Está seguro de que desea eliminar su cuenta de forma permanente? Esta acción no se puede deshacer.')) {
      this.authService.deleteAccount().subscribe({
        next: () => {
          console.log('Cuenta eliminada exitosamente.');
          alert('Su cuenta ha sido eliminada exitosamente.');
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error al eliminar la cuenta:', err);
          if (err.status === 403) {
            alert('No se pudo eliminar la cuenta: ' + (err.error.message || 'Acción no permitida.'));
          } else {
            alert('Ocurrió un error al intentar eliminar su cuenta. Por favor, intente de nuevo.');
          }
        }
      });
    }
  }
}
