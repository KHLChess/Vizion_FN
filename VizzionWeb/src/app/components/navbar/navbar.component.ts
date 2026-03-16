import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service'; // Importar UserService
import { HttpErrorResponse } from '@angular/common/http'; // Importar HttpErrorResponse

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isScrolled = false;
  isMenuOpen = false;

  // Inyectar UserService
  constructor(private authService: AuthService, private userService: UserService, private router: Router) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

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
    this.closeMenu(); // Cerrar el menú antes de la confirmación
    if (confirm('¿Está seguro de que desea eliminar su cuenta de forma permanente? Esta acción no se puede deshacer.')) {
      // Usar userService.deleteMyAccount() en lugar de authService.deleteAccount()
      this.userService.deleteMyAccount().subscribe({
        next: () => {
          console.log('Cuenta eliminada exitosamente.');
          alert('Su cuenta ha sido eliminada exitosamente.');
          this.authService.logout(); // Cerrar sesión después de la eliminación
          this.router.navigate(['/login']); // Redirigir al login
        },
        error: (err: HttpErrorResponse) => { // Tipado explícito para 'err'
          console.error('Error al eliminar la cuenta:', err);
          if (err.status === 403) { // Si es un error de Forbidden (ej. ROOT)
            alert('No se pudo eliminar la cuenta: ' + (err.error.message || 'Acción no permitida.'));
          } else {
            alert('Ocurrió un error al intentar eliminar su cuenta. Por favor, intente de nuevo.');
          }
        }
      });
    }
  }
}
