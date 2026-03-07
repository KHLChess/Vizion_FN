import { Component, signal, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { PublicNavbarComponent } from './components/public-navbar/public-navbar.component';
import { AuthenticatedNavbarComponent } from './components/navbar/authenticated-navbar.component';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { ServerStatusService } from './services/server-status.service';
import { HealthCheckService } from './services/health-check.service';
import { ServerDownComponent } from './components/server-down/server-down.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FooterComponent,
    PublicNavbarComponent,
    AuthenticatedNavbarComponent,
    ServerDownComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('Cosma');
  isLoginPage: boolean = false;
  isServerDown: boolean = false;
  private serverStatusSubscription!: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private serverStatusService: ServerStatusService,
    private healthCheckService: HealthCheckService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isLoginPage = event.urlAfterRedirects === '/login';
    });

    this.serverStatusSubscription = this.serverStatusService.isServerDown$.subscribe(isDown => {
      this.isServerDown = isDown;
      this.cdr.detectChanges();
    });

    this.healthCheckService.startMonitoring();
  }

  onRetryConnection(): void {
    this.healthCheckService.ping().subscribe({
      next: () => {
        window.location.reload();
      },
      error: () => {
        console.error("Reintento de conexión fallido. El servidor sigue sin responder.");
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  ngOnDestroy(): void {
    if (this.serverStatusSubscription) {
      this.serverStatusSubscription.unsubscribe();
    }
  }
}
