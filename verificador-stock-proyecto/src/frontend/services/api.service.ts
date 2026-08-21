import { ProductoDTO } from '../../shared/types/producto.types.js';

export class ApiService {
  private baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://backend-tienda-2ugq.onrender.com/api';

  // 1. Obtener todos los productos desde la base de datos
  public async fetchProductos(): Promise<ProductoDTO[]> {
    const res = await fetch(`${this.baseUrl}/productos`);
    if (!res.ok) throw new Error('Error al obtener productos del servidor');
    return await res.json();
  }

  // 2. Crear un nuevo producto en la base de datos
  public async createProducto(datos: Omit<ProductoDTO, 'id' | 'disponible'>): Promise<ProductoDTO> {
    const res = await fetch(`${this.baseUrl}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('Error al crear el producto');
    return await res.json();
  }

  // 3. Actualizar un producto existente
  public async updateProducto(id: string | number, datos: Partial<ProductoDTO>): Promise<ProductoDTO> {
    const res = await fetch(`${this.baseUrl}/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('Error al actualizar el producto');
    return await res.json();
  }

  // 4. Eliminar un producto
  public async deleteProducto(id: string | number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/productos/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error al eliminar el producto');
  }

  // 5. Consultar stock individual
  public async fetchStock(id: string | number): Promise<{ stockActual: number; disponible: boolean }> {
    const res = await fetch(`${this.baseUrl}/productos/${id}`);
    if (!res.ok) throw new Error('Producto no encontrado');
    const producto: ProductoDTO = await res.json();
    return {
      stockActual: producto.stock,
      disponible: producto.stock > 0
    };
  }

  // 6. Realizar compra / Reducir stock
  public async comprarProducto(id: string | number, cantidad: number): Promise<ProductoDTO> {
    const producto = await this.fetchStock(id);
    if (producto.stockActual < cantidad) {
      throw new Error('Stock insuficiente.');
    }
    const nuevoStock = producto.stockActual - cantidad;
    return await this.updateProducto(id, { stock: nuevoStock });
  }
}