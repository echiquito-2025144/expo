import { ApiService } from './services/api.service.js';
import { ProductCard } from './components/ProductCard.js';
import { ProductoDTO } from '../shared/types/producto.types.js';

class App {
  private api = new ApiService();
  private gridContainer = document.getElementById('products-grid');
  private modal = document.getElementById('product-modal') as HTMLDivElement;
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
          (id) => this.handleDelete(Number(id)) // Conversión explícita a number
        );
  
        this.gridContainer?.appendChild(card.getElement());
      });
    } catch (error) {
      this.gridContainer.innerHTML = '<p class="error">Error al cargar la tienda.</p>';
    }
  }

  private setupEventListeners(): void {
    this.btnNuevo?.addEventListener('click', () => this.openCreateModal());
    
    document.getElementById('btn-close')?.addEventListener('click', () => this.closeModal());

    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmit();
    });
  }

  private openCreateModal(): void {
    this.editingId = null;
    this.form.reset();
    
    const title = document.getElementById('modal-title');
    if (title) title.innerText = 'Nuevo Producto';
    
    this.modal.style.display = 'flex'; // Cambia el display directamente
  }

  private closeModal(): void {
    this.modal.style.display = 'none'; // Oculta el modal
  }


  private async handleFormSubmit(): Promise<void> {
    const nombre = (document.getElementById('prod-nombre') as HTMLInputElement).value;
    const descripcion = (document.getElementById('prod-desc') as HTMLTextAreaElement).value;
    const precio = parseFloat((document.getElementById('prod-precio') as HTMLInputElement).value);
    const stock = parseInt((document.getElementById('prod-stock') as HTMLInputElement).value, 10);
    const imagenUrl = (document.getElementById('prod-imagen') as HTMLInputElement).value;

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
      }
      this.closeModal();
      await this.loadProducts();
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
  }

  private openEditModal(product: ProductoDTO): void {
    this.editingId = Number(product.id);
    (document.getElementById('prod-nombre') as HTMLInputElement).value = product.nombre;
    (document.getElementById('prod-desc') as HTMLInputElement).value = product.descripcion;
    (document.getElementById('prod-precio') as HTMLInputElement).value = product.precio.toString();
    (document.getElementById('prod-stock') as HTMLInputElement).value = product.stock.toString();
    (document.getElementById('modal-title') as HTMLElement).innerText = 'Editar Producto';
    this.modal.classList.add('active');
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