export interface Usuario {
  id?: number;
  username: string;
  email: string;
  password?: string; // Opcional, usado para enviar en creación/actualización, no esperado en respuesta del DTO
  fullName?: string;
  role: string; // Representa el enum Role del backend
  managedById?: number;
  managedByName?: string;
  referrerId?: number;
  referrerName?: string;
  referralAuthorized?: boolean;
  baseSalary?: number;
  profilePictureUrl?: string; // URL para mostrar la imagen de perfil
}
