import { Product } from '../../shared/types/producto.types';

export class ApiService {
  private STORAGE_KEY = 'techstore_products';

  private initialData: Product[] = [
    { id: 1, nombre: 'Teclado Mecánico RGB', descripcion: 'Switches blue y retroiluminación RGB.', precio: 89.99, stock: 12 },
    { id: 2, nombre: 'Mouse Gamer Ergonómico', descripcion: 'Sensor de 16,000 DPI y 6 botones.', precio: 45.50, stock: 0 },
    { id: 3, nombre: 'Monitor 27" 144Hz 1ms', descripcion: 'Panel IPS Full HD ideal para gaming.', precio: 249.00, stock: 3 }
  ];

  public async fetchProductos(): Promise<Product[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.initialData));
      return this.initialData;
    }
    return JSON.parse(data);
  }

  public async createProducto(producto: Omit<Product, 'id'>): Promise<Product> {
    const productos = await this.fetchProductos();
    const newId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    const newProduct: Product = { ...producto, id: newId };
    
    productos.push(newProduct);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productos));
    return newProduct;
  }

  public async updateProducto(id: number, datos: Partial<Product>): Promise<Product> {
    const productos = await this.fetchProductos();
    const index = productos.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Producto no encontrado');

    productos[index] = { ...productos[index], ...datos };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productos));
    return productos[index];
  }

  public async deleteProducto(id: number): Promise<void> {
    let productos = await this.fetchProductos();
    productos = productos.filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productos));
  }

  public async fetchStock(id: string | number): Promise<{ stockActual: number; disponible: boolean }> {
    const productos = await this.fetchProductos();
    const producto = productos.find(p => String(p.id) === String(id));

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    return {
      stockActual: producto.stock,
      disponible: producto.stock > 0
    };
  }
}