import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {

  // Valor fijo para el desarrollo, simula la tasa de respaldo del backend.
  private readonly FALLBACK_RATE = 20.0;

  constructor() { }

  /**
   * Obtiene la tasa de cambio para un par de divisas.
   * En el futuro, esto podría hacer una llamada HTTP a un endpoint del backend
   * que a su vez consulta la API externa, para proteger la clave de API.
   * @param fromCurrency La moneda de origen (ej: "USD")
   * @param toCurrency La moneda de destino (ej: "MXN")
   * @returns La tasa de cambio.
   */
  getRate(fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === 'USD' && toCurrency === 'MXN') {
      return this.FALLBACK_RATE;
    }
    return 1.0; // Tasa de 1.0 para cualquier otra conversión
  }
}
