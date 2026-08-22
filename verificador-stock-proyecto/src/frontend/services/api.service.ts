import { ProductoDTO } from '../../shared/types/producto.types.js';

export class ApiService {
  private baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://backend-tienda-2ugq.onrender.com/api';

  public async fetchProductos(): Promise<ProductoDTO[]> {
    const res = await fetch(`${this.baseUrl}/productos`);
    if (!res.ok) throw new Error('Error al obtener productos');
    return await res.json();
  }

  public async createProducto(datos: Omit<ProductoDTO, 'id' | 'disponible'>): Promise<ProductoDTO> {
    const res = await fetch(`${this.baseUrl}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('Error al crear el producto');
    return await res.json();
  }

  public async updateProducto(id: string, datos: Partial<ProductoDTO>): Promise<ProductoDTO> {
    const res = await fetch(`${this.baseUrl}/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('Error al actualizar el producto');
    return await res.json();
  }

  public async deleteProducto(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/productos/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error al eliminar el producto');
  }

  public async fetchStock(id: string): Promise<{ stockActual: number; disponible: boolean }> {
    const res = await fetch(`${this.baseUrl}/productos/${id}/stock`);
    if (!res.ok) throw new Error('Producto no encontrado');
    return await res.json();
  }

  public async comprarProducto(id: string, cantidad: number): Promise<ProductoDTO> {
    const stockInfo = await this.fetchStock(id);
    if (stockInfo.stockActual < cantidad) {
      throw new Error('Stock insuficiente.');
    }
    const nuevoStock = stockInfo.stockActual - cantidad;
    return await this.updateProducto(id, { stock: nuevoStock });
  }
}