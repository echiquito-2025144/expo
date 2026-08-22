import { ProductoRepository } from '../repositories/producto.repository.js';
import { ProductoDTO, StockCheckResponse } from '../../shared/types/producto.types.js';

export class ProductoService {
  private repository = new ProductoRepository();

  async listarProductos(): Promise<ProductoDTO[]> {
    const productos = await this.repository.obtenerTodos();
    return productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      stock: p.stock,
      disponible: p.stock > 0,
      imagenUrl: p.imagenUrl
    }));
  }

  async crearProducto(datos: Omit<ProductoDTO, 'id' | 'disponible'>): Promise<ProductoDTO> {
    const p = await this.repository.crear(datos);
    return {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      stock: p.stock,
      disponible: p.stock > 0,
      imagenUrl: p.imagenUrl
    };
  }

  async actualizarProducto(id: string, datos: Partial<ProductoDTO>): Promise<ProductoDTO> {
    const p = await this.repository.actualizar(id, datos);
    return {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      stock: p.stock,
      disponible: p.stock > 0,
      imagenUrl: p.imagenUrl
    };
  }

  async eliminarProducto(id: string): Promise<void> {
    await this.repository.eliminar(id);
  }

  async verificarStock(id: string): Promise<StockCheckResponse | null> {
    const producto = await this.repository.obtenerPorId(id);
    if (!producto) return null;

    return {
      productoId: producto.id,
      disponible: producto.stock > 0,
      stockActual: producto.stock
    };
  }
}