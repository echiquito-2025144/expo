import { ApiService } from './services/api.service.js';
import { ProductCard } from './components/ProductCard.js';
import { ProductoDTO } from '../shared/types/producto.types.js';

class App {
  private api = new ApiService();
  private gridContainer = document.getElementById('products-grid');
  private viewCatalog = document.getElementById('view-catalog') as HTMLElement;
  private viewForm = document.getElementById('view-form') as HTMLElement;
  private form = document.getElementById('product-form') as HTMLFormElement;
  private btnNuevo = document.getElementById('btn-nuevo') as HTMLButtonElement;
  private editingId: number | null = null;

  public async init(): Promise<void> {
    this.setupEventListeners();
    await this.loadProducts();
  }

  private async loadProducts(): Promise<void> {
    if (!this.gridContainer) return;

    try {
      this.gridContainer.innerHTML = '<p class="loading">Cargando catálogo...</p>';
      const productos = await this.api.fetchProductos();
      
      this.gridContainer.innerHTML = '';
      if (productos.length === 0) {
        this.gridContainer.innerHTML = '<p class="empty">No hay productos disponibles.</p>';
        return;
      }

      productos.forEach(prod => {
        const productoDTO: ProductoDTO = {
          ...prod,
          id: String(prod.id),
          disponible: prod.stock > 0,
          imagenUrl: prod.imagenUrl || 'https://via.placeholder.com/150'
        };

        const card = new ProductCard(
          productoDTO,
          (p) => this.openEditModal(p),
          (id) => this.handleDelete(Number(id)),
          (p) => this.handleBuy(p) // Callback para procesar la compra
        );
  
        this.gridContainer?.appendChild(card.getElement());
      });
    } catch (error) {
      this.gridContainer.innerHTML = '<p class="error">Error al cargar la tienda.</p>';
    }
  }

  // Métodos auxiliares para alternar la vista activa
  private showFormView(title: string): void {
    if (this.viewCatalog && this.viewForm) {
      this.viewCatalog.style.display = 'none';
      this.viewForm.style.display = 'block';
    }
    const formTitle = document.getElementById('form-title');
    if (formTitle) formTitle.innerText = title;
  }

  private showCatalogView(): void {
    if (this.viewCatalog && this.viewForm) {
      this.viewForm.style.display = 'none';
      this.viewCatalog.style.display = 'block';
    }
    this.form.reset();
    this.editingId = null;
  }

  private setupEventListeners(): void {
    this.btnNuevo?.addEventListener('click', () => this.openCreateModal());
    
    // Controles para regresar desde el formulario
    document.getElementById('btn-back')?.addEventListener('click', () => this.showCatalogView());
    document.getElementById('btn-cancel')?.addEventListener('click', () => this.showCatalogView());

    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmit();
    });
  }

  private openCreateModal(): void {
    this.editingId = null;
    this.form.reset();
    this.showFormView('Nuevo Producto');
  }

  private openEditModal(product: ProductoDTO): void {
    this.editingId = Number(product.id);
    (document.getElementById('prod-nombre') as HTMLInputElement).value = product.nombre;
    (document.getElementById('prod-desc') as HTMLTextAreaElement).value = product.descripcion;
    (document.getElementById('prod-precio') as HTMLInputElement).value = product.precio.toString();
    (document.getElementById('prod-stock') as HTMLInputElement).value = product.stock.toString();
    
    const imgInput = document.getElementById('prod-imagen') as HTMLInputElement;
    if (imgInput) imgInput.value = product.imagenUrl || '';

    this.showFormView('Editar Producto');
  }

  private async handleFormSubmit(): Promise<void> {
    const nombre = (document.getElementById('prod-nombre') as HTMLInputElement).value;
    const descripcion = (document.getElementById('prod-desc') as HTMLTextAreaElement).value;
    const precio = parseFloat((document.getElementById('prod-precio') as HTMLInputElement).value);
    const stock = parseInt((document.getElementById('prod-stock') as HTMLInputElement).value, 10);
    const imagenUrlInput = (document.getElementById('prod-imagen') as HTMLInputElement)?.value || '';

    const payload = {
      nombre,
      descripcion,
      precio,
      stock,
      imagenUrl: imagenUrlInput.trim() !== '' ? imagenUrlInput : 'https://via.placeholder.com/150'
    };

    try {
      if (this.editingId === null) {
        await this.api.createProducto(payload);
      } else {
        await this.api.updateProducto(this.editingId, payload);
      }
      this.showCatalogView();
      await this.loadProducts();
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
  }

  private async handleBuy(product: ProductoDTO): Promise<void> {
    if (product.stock <= 0) {
      alert('Este producto no tiene unidades disponibles.');
      return;
    }

    const input = prompt(
      `¿Cuántas unidades de "${product.nombre}" deseas comprar?\nStock disponible: ${product.stock}`,
      '1'
    );

    if (input === null) return;

    const cantidad = parseInt(input, 10);

    if (isNaN(cantidad) || cantidad <= 0) {
      alert('Ingresa una cantidad válida mayor a 0.');
      return;
    }

    if (cantidad > product.stock) {
      alert(`No hay suficiente stock. Máximo disponible: ${product.stock}`);
      return;
    }

    try {
      const nuevoStock = product.stock - cantidad;
      await this.api.updateProducto(product.id, { stock: nuevoStock });
      alert(`¡Compra realizada con éxito! Se descontaron ${cantidad} unidad(es).`);
      await this.loadProducts();
    } catch (error) {
      console.error('Error al procesar la compra:', error);
      alert('Ocurrió un error al procesar la compra.');
    }
  }

  private async handleDelete(id: number): Promise<void> {
    if (confirm('¿Deseas eliminar este producto?')) {
      await this.api.deleteProducto(id);
      await this.loadProducts();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});