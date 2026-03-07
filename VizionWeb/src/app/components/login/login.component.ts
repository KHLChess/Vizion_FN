import { Component, OnInit, OnDestroy, HostBinding, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core'; // Importar Inject, PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // Importar isPlatformBrowser
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  email = '';
  password = '';
  errorMessage: string | null = null;

  @HostBinding('class') componentClass = 'login-component-host';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object // Inyectar PLATFORM_ID
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) { // Proteger acceso a document
      document.body.classList.add('login-page');
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) { // Proteger acceso a document
      document.body.classList.remove('login-page');
    }
  }

  onLogin(): void {
    this.errorMessage = null;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error de login:', err);
        if (err.status === 401 && err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado. Por favor, intente de nuevo.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
