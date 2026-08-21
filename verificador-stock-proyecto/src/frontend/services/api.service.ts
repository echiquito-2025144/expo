import { ProductoDTO } from '../../shared/types/producto.types.js';

export class ApiService {
  private baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://backend-tienda-2ugq.onrender.com/api';

  private STORAGE_KEY = 'techstore_products';

  private initialData: ProductoDTO[] = [
    { id: '1', nombre: 'Teclado Mecánico RGB', descripcion: 'Switches blue y retroiluminación RGB.', precio: 89.99, stock: 12, disponible: true, imagenUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300' },
    { id: '2', nombre: 'Mouse Gamer Ergonómico', descripcion: 'Sensor de 16,000 DPI y 6 botones.', precio: 45.50, stock: 0, disponible: false, imagenUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300' },
    { id: '3', nombre: 'Monitor 27" 144Hz 1ms', descripcion: 'Panel IPS Full HD ideal para gaming.', precio: 249.00, stock: 3, disponible: true, imagenUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300' }
  ];

  public async fetchProductos(): Promise<ProductoDTO[]> {
    try {
      const res = await fetch(`${this.baseUrl}/productos`);
      if (res.ok) return await res.json();
    } catch {
      // Si falla la red o el backend en Render se suspende, carga desde LocalStorage
    }

    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.initialData));
      return this.initialData;
    }
    return JSON.parse(data);
  }

  public async createProducto(datos: Omit<ProductoDTO, 'id' | 'disponible'>): Promise<ProductoDTO> {
    try {
      const res = await fetch(`${this.baseUrl}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }

    const productos = await this.fetchProductos();
    const newProduct: ProductoDTO = {
      id: Date.now().toString(),
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      precio: datos.precio,
      stock: datos.stock,
      disponible: datos.stock > 0,
      imagenUrl: datos.imagenUrl || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300'
    };

    productos.push(newProduct);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productos));
    return newProduct;
  }

  public async updateProducto(id: string | number, datos: Partial<ProductoDTO>): Promise<ProductoDTO> {
    try {
      const res = await fetch(`${this.baseUrl}/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }

    const productos = await this.fetchProductos();
    const index = productos.findIndex(p => String(p.id) === String(id));
    if (index === -1) throw new Error('Producto no encontrado');

    productos[index] = { 
      ...productos[index], 
      ...datos,
      disponible: datos.stock !== undefined ? datos.stock > 0 : productos[index].disponible
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productos));
    return productos[index];
  }

  public async deleteProducto(id: string | number): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/productos/${id}`, { method: 'DELETE' });
      if (res.ok) return;
    } catch {
      // Fallback local
    }

    let productos = await this.fetchProductos();
    productos = productos.filter(p => String(p.id) !== String(id));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productos));
  }

  public async fetchStock(id: string | number): Promise<{ stockActual: number; disponible: boolean }> {
    const productos = await this.fetchProductos();
    const producto = productos.find(p => String(p.id) === String(id));
    if (!producto) throw new Error('Producto no encontrado');

    return {
      stockActual: producto.stock,
      disponible: producto.stock > 0
    };
  }

  public async comprarProducto(id: string | number, cantidad: number): Promise<ProductoDTO> {
    const producto = await this.fetchStock(id);
    if (producto.stockActual < cantidad) throw new Error('Stock insuficiente.');

    const nuevoStock = producto.stockActual - cantidad;
    return await this.updateProducto(id, { stock: nuevoStock });
  }
}