export interface ProductoDTO {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  disponible: boolean;
  imagenUrl: string;
}

export interface StockCheckResponse {
  productoId: string;
  disponible: boolean;
  stockActual: number;
}

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl?: string;
}