import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) { }

  // --- Métodos para el propio usuario (Mi Perfil) ---
  getCurrentUserProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  updateCurrentUserProfile(userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/me`, userData);
  }

  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/me/profile-picture`, formData);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/me/password`, { currentPassword, newPassword });
  }

  validateCurrentPassword(password: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/me/validate-current-password`, password, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // --- Métodos para Gestión de Usuarios (ROOT) ---
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  deleteAllUsers(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-all`);
  }

  deleteUsersBatch(ids: number[]): Observable<void> {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: ids,
    };
    return this.http.delete<void>(`${this.apiUrl}/batch`, options);
  }

  hasReferrals(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${userId}/has-referrals`);
  }

  // --- Métodos para obtener listas específicas de usuarios ---
  getManagers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/managers`);
  }

  getSalesforceUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/salesforce`);
  }

  getClientUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clients`);
  }

  getPotentialReferrers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/potential-referrers`);
  }

  getDependents(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/dependents`);
  }

  getDependentsHierarchy(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/hierarchy`);
  }

  getClientsByManager(managerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/manager/${managerId}/clients`);
  }

  // Alias para mantener compatibilidad con componentes existentes
  getClients(): Observable<any[]> {
    return this.getClientUsers();
  }

  // --- Métodos para validación de unicidad ---
  checkUsernameAvailability(username: string, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-username`, { params: { username, userId: userId.toString() } });
  }

  checkEmailAvailability(email: string, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-email`, { params: { email, userId: userId.toString() } });
  }

  // --- Nuevo método para crear usuarios por no-ROOTs ---
  createUsuarioByCreator(creatorId: number, newUserData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-dependent/${creatorId}`, newUserData);
  }
}
