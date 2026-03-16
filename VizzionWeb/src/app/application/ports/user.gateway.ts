import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';
import { Usuario } from '../../models/usuario.model';

export interface UserGateway {
  // Métodos para el propio usuario (Mi Perfil)
  getProfile(): Observable<Usuario>;
  updateProfile(userData: Usuario): Observable<Usuario>;
  uploadProfilePicture(file: File): Observable<Usuario>;
  updatePassword(passwordChangeRequest: { currentPassword?: string, newPassword: string }): Observable<void>;
  deleteMyAccount(): Observable<void>; // Añadido de nuevo

  // Métodos para Gestión de Usuarios (ROOT/Administrativo)
  getUserById(id: number): Observable<Usuario>;
  getAllUsers(): Observable<Usuario[]>;
  createUser(userData: Usuario): Observable<Usuario>;
  updateUser(id: number, userData: Usuario): Observable<Usuario>;
  deleteUser(id: number): Observable<any>;
  deleteUsersBatch(ids: number[]): Observable<void>;

  // Métodos para validación de unicidad
  checkEmailAvailability(email: string, userId: number): Observable<boolean>;
  checkUsernameAvailability(username: string, userId: number): Observable<boolean>;

  // Métodos para obtener listas específicas de usuarios y jerarquía
  getDependents(userId: number): Observable<Usuario[]>;

  // Métodos para creación/gestión de subordinados/clientes
  registerSubordinate(subordinateData: Usuario): Observable<Usuario>;
}

export const USER_GATEWAY = new InjectionToken<UserGateway>('UserGateway');
