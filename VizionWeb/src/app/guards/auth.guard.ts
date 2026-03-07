import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const requiredRoles = route.data['roles'] as Array<string>;

    if (this.authService.isLoggedIn()) {
      const userRole = this.authService.getUserRole();

      if (userRole && requiredRoles && requiredRoles.includes(userRole)) {
        return true; // Usuario logueado y con rol autorizado
      } else if (userRole && requiredRoles && !requiredRoles.includes(userRole)) {
        // Usuario logueado pero sin el rol requerido
        this.router.navigate(['/unauthorized']); // Redirigir a una página de no autorizado
        return false;
      }
      // Si no se especifican roles requeridos, pero está logueado, permitir
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }
    }

    // No logueado, redirigir a la página de login
    this.router.navigate(['/login']);
    return false;
  }
}
