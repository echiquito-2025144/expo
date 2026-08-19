import { ProductoDTO, StockCheckResponse } from '../../shared/types/producto.types.js';

export class ApiService {
  private baseUrl = '/api';

  async fetchProductos(): Promise<ProductoDTO[]> {
    const res = await fetch(`${this.baseUrl}/productos`);
    if (!res.ok) throw new Error('Error al cargar la lista de productos');
    return await res.json();
  }

  async fetchStock(productoId: string): Promise<StockCheckResponse> {
    const res = await fetch(`${this.baseUrl}/productos/${productoId}/stock`);
    if (!res.ok) throw new Error('Error al consultar stock del producto');
    return await res.json();
  }
}
