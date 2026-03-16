import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserGateway } from '../../application/ports/user.gateway';
import { Usuario } from '../../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UserHttpAdapter implements UserGateway {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) { }

  // --- Métodos para el propio usuario (Mi Perfil) ---
  getProfile(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/me`);
  }

  updateProfile(userData: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/me`, userData);
  }

  uploadProfilePicture(file: File): Observable<Usuario> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<Usuario>(`${this.apiUrl}/me/profile-picture`, formData);
  }

  updatePassword(passwordChangeRequest: { currentPassword?: string, newPassword: string }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/me/password`, passwordChangeRequest);
  }

  deleteMyAccount(): Observable<void> { // Añadido de nuevo
    return this.http.delete<void>(`${this.apiUrl}/me`);
  }

  validateCurrentPassword(password: string): Observable<boolean> {
    console.warn('UserGateway.validateCurrentPassword: No hay un endpoint directo en el backend para esta operación.');
    return new Observable(observer => observer.error('Operación no soportada por el backend.'));
  }

  // --- Métodos para Gestión de Usuarios (ROOT/Administrativo) ---
  getUserById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  getAllUsers(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  createUser(userData: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, userData);
  }

  updateUser(id: number, userData: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  deleteAllUsers(): Observable<void> {
    console.warn('UserGateway.deleteAllUsers: No hay un endpoint directo en el backend para esta operación.');
    return new Observable(observer => observer.error('Operación no soportada por el backend.'));
  }

  deleteUsersBatch(ids: number[]): Observable<void> {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: ids,
    };
    return this.http.delete<void>(`${this.apiUrl}/batch`, options);
  }

  // --- Métodos para validación de unicidad ---
  checkEmailAvailability(email: string, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-email`, { params: { email, userId: userId.toString() } });
  }

  checkUsernameAvailability(username: string, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-username`, { params: { username, userId: userId.toString() } });
  }

  // --- Métodos para obtener listas específicas de usuarios y jerarquía ---
  hasReferrals(userId: number): Observable<boolean> {
    console.warn('UserGateway.hasReferrals: No hay un endpoint directo en el backend para esta operación.');
    return new Observable(observer => observer.error('Operación no soportada por el backend.'));
  }

  getManagers(): Observable<Usuario[]> {
    console.warn('UserGateway.getManagers: No hay un endpoint directo en el backend para esta operación.');
    return new Observable(observer => observer.error('Operación no soportada por el backend.'));
  }

  getSalesforceUsers(): Observable<Usuario[]> {
    console.warn('UserGateway.getSalesforceUsers: No hay un endpoint directo en el backend para esta operación.');
    return new Observable(observer => observer.error('Operación no soportada por el backend.'));
  }

  getClientUsers(): Observable<Usuario[]> {
    console.warn('UserGateway.getClientUsers: No hay un endpoint directo en el backend para esta operación.');
    return new Observable(observer => observer.error('Operación no soportada por el backend.'));
  }

  getPotentialReferrers(): Observable<Usuario[]> {
    console.warn('UserGateway.getPotentialReferrers: No hay un endpoint directo en el backend para esta operación.');
    return new Observable(observer => observer.error('Operación no soportada por el backend.'));
  }

  getDependents(userId: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/${userId}/dependents`);
  }

  getDependentsHierarchy(userId: number): Observable<Usuario[]> {
    console.warn('UserGateway.getDependentsHierarchy: No hay un endpoint directo en el backend para esta operación.');
    return new Observable(observer => observer.error('Operación no soportada por el backend.'));
  }

  getClientsByManager(managerId: number): Observable<Usuario[]> {
    console.warn('UserGateway.getClientsByManager: No hay un endpoint directo en el backend para esta operación.');
    return new Observable(observer => observer.error('Operación no soportada por el backend.'));
  }

  // --- Métodos para creación/gestión de subordinados/clientes ---
  registerSubordinate(subordinateData: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/register-subordinate`, subordinateData);
  }

  reassignClients(userId: number, newManagerId: number): Observable<Usuario> {
    console.warn('UserGateway.reassignClients: No hay un endpoint directo en el backend para esta operación.');
    return new Observable(observer => observer.error('Operación no soportada por el backend.'));
  }

  promoteClient(userId: number, newRole: string): Observable<Usuario> {
    console.warn('UserGateway.promoteClient: No hay un endpoint directo en el backend para esta operación.');
    return new Observable(observer => observer.error('Operación no soportada por el backend.'));
  }
}
