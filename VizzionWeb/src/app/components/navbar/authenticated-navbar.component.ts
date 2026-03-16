import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service'; // Importar UserService
import { HttpErrorResponse } from '@angular/common/http'; // Importar HttpErrorResponse

@Component({
  selector: 'app-authenticated-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './authenticated-navbar.component.html',
  styleUrl: './authenticated-navbar.component.scss'
})
export class AuthenticatedNavbarComponent {
  isMenuOpen = false;

  // Inyectar UserService
  constructor(private authService: AuthService, private userService: UserService, private router: Router) { }

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
      // Usar userService.deleteMyAccount() en lugar de authService.deleteAccount()
      this.userService.deleteMyAccount().subscribe({
        next: () => {
          console.log('Cuenta eliminada exitosamente.');
          alert('Su cuenta ha sido eliminada exitosamente.');
          this.authService.logout(); // Cerrar sesión después de eliminar la cuenta
          this.router.navigate(['/login']);
        },
        error: (err: HttpErrorResponse) => { // Tipado explícito para 'err'
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
