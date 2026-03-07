import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommissionService {
  private apiUrl = 'http://localhost:8080/api/commissions';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las comisiones.
   * @returns Un observable con la lista de DTOs de comisiones.
   */
  getAllCommissions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Marca una comisión como pagada.
   * @param commissionId El ID de la comisión a pagar.
   * @returns Un observable con el DTO de la comisión actualizada.
   */
  payCommission(commissionId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${commissionId}/pay`, {});
  }

  /**
   * Anula una comisión.
   * @param commissionId El ID de la comisión a anular.
   * @returns Un observable con el DTO de la comisión actualizada.
   */
  voidCommission(commissionId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${commissionId}/void`, {});
  }

  /**
   * Actualiza las notas de una comisión.
   * @param commissionId El ID de la comisión.
   * @param notes Las nuevas notas.
   * @returns Un observable con el DTO de la comisión actualizada.
   */
  updateCommissionNotes(commissionId: number, notes: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${commissionId}/notes`, { notes });
  }
}
