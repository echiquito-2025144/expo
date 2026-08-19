import { ApiService } from './services/api.service.js';
import { ProductCard } from './components/ProductCard.js';

class App {
  private api = new ApiService();
  private gridContainer = document.getElementById('products-grid');

  public async init(): Promise<void> {
    if (!this.gridContainer) return;

    try {
      this.gridContainer.innerHTML = '<p class="loading">Cargando catálogo de productos...</p>';
      const productos = await this.api.fetchProductos();
      
      this.gridContainer.innerHTML = '';
      if (productos.length === 0) {
        this.gridContainer.innerHTML = '<p class="empty">No hay productos disponibles.</p>';
        return;
      }

      productos.forEach(prod => {
        const card = new ProductCard(prod);
        this.gridContainer?.appendChild(card.getElement());
      });
    } catch (error) {
      this.gridContainer.innerHTML = '<p class="error">Ocurrió un error al cargar la tienda.</p>';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
