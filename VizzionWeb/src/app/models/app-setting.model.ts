export interface AppSetting {
  key: string; // Cambiado de 'settingKey' a 'key'
  value: string; // Cambiado de 'settingValue' a 'value'
  description?: string;
  type: string; // Cambiado de tipo de unión a 'string' para coincidir con SystemSetting.java del backend
}
