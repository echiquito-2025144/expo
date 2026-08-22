import { ProductoDTO } from '../../shared/types/producto.types.js';

export class ApiService {
  // URL real de tu servidor en Render
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

  public async updateProducto(id: string | number, datos: Partial<ProductoDTO>): Promise<ProductoDTO> {
    const res = await fetch(`${this.baseUrl}/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('Error al actualizar el producto');
    return await res.json();
  }

  public async deleteProducto(id: string | number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/productos/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error al eliminar el producto');
  }

  public async fetchStock(id: string | number): Promise<{ stockActual: number; disponible: boolean }> {
    const res = await fetch(`${this.baseUrl}/productos/${id}`);
    if (!res.ok) throw new Error('Producto no encontrado');
    const producto: ProductoDTO = await res.json();
    return {
      stockActual: producto.stock,
      disponible: producto.stock > 0
    };
  }

  public async comprarProducto(id: string | number, cantidad: number): Promise<ProductoDTO> {
    // Si tienes un endpoint dedicado a ventas o compras en Express:
    const res = await fetch(`${this.baseUrl}/productos/${id}/comprar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad })
    });
    
    if (!res.ok) {
      // Si no tienes ese endpoint específico, reduce el stock con updateProducto
      const stockInfo = await this.fetchStock(id);
      if (stockInfo.stockActual < cantidad) throw new Error('Stock insuficiente.');
      return await this.updateProducto(id, { stock: stockInfo.stockActual - cantidad });
    }
    
    return await res.json();
  }
}