import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core'; // Importar InjectionToken
import { Commission } from '../../models/commission.model';

export interface CommissionGateway {
  getAllCommissions(): Observable<Commission[]>;
  payCommission(id: number): Observable<Commission>;
  voidCommission(id: number): Observable<Commission>;
  updateCommissionNotes(id: number, notes: string): Observable<Commission>;
}

// Definir el InjectionToken para CommissionGateway
export const COMMISSION_GATEWAY = new InjectionToken<CommissionGateway>('CommissionGateway');
