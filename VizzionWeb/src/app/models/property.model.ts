export interface Property {
  id?: number;
  title: string;
  location: string;
  price: number;
  beds?: number;
  baths?: number;
  area?: number;
  status: string; // Cambiado a string para coincidir directamente con el DTO del backend
  type: string;
  isFeatured?: boolean; // Añadido
  description?: string;
  features?: string[];
  imageIds?: number[]; // Añadido para coincidir con PropertyDTO del backend
  createdAt?: Date;
  updatedAt?: Date;
  soldByName?: string; // Añadido
  boughtByName?: string; // Añadido
  saleDate?: Date; // Añadido (LocalDateTime del backend se mapea a Date en TS)
  commissionPaid?: boolean; // Añadido
}
