import { Injectable, Inject } from '@angular/core'; // Importar Inject
import { Observable } from 'rxjs';
import { CommissionGateway, COMMISSION_GATEWAY } from '../application/ports/commission.gateway'; // Importar COMMISSION_GATEWAY
import { Commission } from '../models/commission.model';

@Injectable({
  providedIn: 'root'
})
export class CommissionService {
  constructor(@Inject(COMMISSION_GATEWAY) private commissionGateway: CommissionGateway) { }

  /**
   * Obtiene todas las comisiones.
   * @returns Un observable con la lista de comisiones.
   */
  getAllCommissions(): Observable<Commission[]> {
    return this.commissionGateway.getAllCommissions();
  }

  /**
   * Marca una comisión como pagada.
   * @param commissionId El ID de la comisión a pagar.
   * @returns Un observable con la comisión actualizada.
   */
  payCommission(commissionId: number): Observable<Commission> {
    return this.commissionGateway.payCommission(commissionId);
  }

  /**
   * Anula una comisión.
   * @param commissionId El ID de la comisión a anular.
   * @returns Un observable con la comisión actualizada.
   */
  voidCommission(commissionId: number): Observable<Commission> {
    return this.commissionGateway.voidCommission(commissionId);
  }

  /**
   * Actualiza las notas de una comisión.
   * @param commissionId El ID de la comisión.
   * @param notes Las nuevas notas.
   * @returns Un observable con la comisión actualizada.
   */
  updateCommissionNotes(commissionId: number, notes: string): Observable<Commission> {
    return this.commissionGateway.updateCommissionNotes(commissionId, notes);
  }
}
