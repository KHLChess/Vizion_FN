import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommissionGateway } from '../../application/ports/commission.gateway';
import { Commission } from '../../models/commission.model';

@Injectable({
  providedIn: 'root'
})
export class CommissionHttpAdapter implements CommissionGateway {
  private apiUrl = 'http://localhost:8080/api/commissions';

  constructor(private http: HttpClient) { }

  getAllCommissions(): Observable<Commission[]> {
    return this.http.get<Commission[]>(this.apiUrl);
  }

  payCommission(id: number): Observable<Commission> {
    return this.http.put<Commission>(`${this.apiUrl}/${id}/pay`, {});
  }

  voidCommission(id: number): Observable<Commission> {
    return this.http.put<Commission>(`${this.apiUrl}/${id}/void`, {});
  }

  // getCommissionNotes() no tiene un endpoint directo en CommissionController.java
  // getCommissionNotes(id: number): Observable<string> {
  //   console.warn('CommissionGateway.getCommissionNotes: No hay un endpoint directo en el backend para esta operación.');
  //   return new Observable(observer => observer.error('Operación no soportada por el backend.'));
  // }

  updateCommissionNotes(id: number, notes: string): Observable<Commission> {
    return this.http.put<Commission>(`${this.apiUrl}/${id}/notes`, { notes });
  }
}
