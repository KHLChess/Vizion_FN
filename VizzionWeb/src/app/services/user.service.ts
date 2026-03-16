import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserGateway, USER_GATEWAY } from '../application/ports/user.gateway';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(@Inject(USER_GATEWAY) private userGateway: UserGateway) { }

  // --- Métodos para el propio usuario (Mi Perfil) ---
  getCurrentUserProfile(): Observable<Usuario> {
    return this.userGateway.getProfile();
  }

  updateCurrentUserProfile(userData: Usuario): Observable<Usuario> {
    return this.userGateway.updateProfile(userData);
  }

  uploadProfilePicture(file: File): Observable<Usuario> {
    return this.userGateway.uploadProfilePicture(file);
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.userGateway.updatePassword({ currentPassword, newPassword });
  }

  deleteMyAccount(): Observable<void> { // Descomentado
    return this.userGateway.deleteMyAccount();
  }

  // --- Métodos para Gestión de Usuarios (ROOT) ---
  getUserById(id: number): Observable<Usuario> {
    return this.userGateway.getUserById(id);
  }

  getAllUsers(): Observable<Usuario[]> {
    return this.userGateway.getAllUsers();
  }

  createUser(userData: Usuario): Observable<Usuario> {
    return this.userGateway.createUser(userData);
  }

  updateUser(id: number, userData: Usuario): Observable<Usuario> {
    return this.userGateway.updateUser(id, userData);
  }

  deleteUser(id: number): Observable<any> {
    return this.userGateway.deleteUser(id);
  }

  deleteUsersBatch(ids: number[]): Observable<void> {
    return this.userGateway.deleteUsersBatch(ids);
  }

  // --- Métodos para validación de unicidad ---
  checkUsernameAvailability(username: string, userId: number): Observable<boolean> {
    return this.userGateway.checkUsernameAvailability(username, userId);
  }

  checkEmailAvailability(email: string, userId: number): Observable<boolean> {
    return this.userGateway.checkEmailAvailability(email, userId);
  }

  // --- Métodos para obtener listas específicas de usuarios ---
  getDependents(userId: number): Observable<Usuario[]> {
    return this.userGateway.getDependents(userId);
  }

  // --- Métodos para creación/gestión de subordinados/clientes ---
  registerSubordinate(subordinateData: Usuario): Observable<Usuario> {
    return this.userGateway.registerSubordinate(subordinateData);
  }
}
