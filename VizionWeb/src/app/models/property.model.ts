export interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
  beds: number;
  baths: number;
  area: number;
  status: 'En Venta' | 'Renta' | 'Vendido';
  type: string; // 'Casa', 'Departamento', 'Terreno', etc.
  description?: string;
  features?: string[];
  images?: string[]; // For future gallery
  createdAt: Date;
  updatedAt: Date;
}
