export interface Commission {
  id?: number;
  amount: number;
  status: string; // Cambiado a string para coincidir directamente con el DTO del backend
  earningUserName?: string; // Cambiado de earningUser: Usuario
  generatingPropertyName?: string; // Cambiado de generatingProperty: Property
  generatingClientName?: string; // Cambiado de generatingClient?: Usuario
  createdAt: Date;
  paidAt?: Date;
  notes?: string;
}
