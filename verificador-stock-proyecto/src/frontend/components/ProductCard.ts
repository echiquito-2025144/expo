import { ProductoDTO } from '../../shared/types/producto.types.js';
import { ApiService } from '../services/api.service.js';

export class ProductCard {
  private api = new ApiService();
  private element: HTMLElement;

  constructor(
    private producto: ProductoDTO,
    private onEdit?: (producto: ProductoDTO) => void,
    private onDelete?: (id: string) => void,
    private onBuy?: (producto: ProductoDTO) => void
  ) {
    this.element = document.createElement('article');
    this.element.className = 'product-card';
    this.element.dataset.id = producto.id;
    this.render();
    this.setupListeners();
  }

  private render(): void {
    const { id, nombre, descripcion, precio, stock, disponible, imagenUrl } = this.producto;

    this.element.innerHTML = `
      <div class="product-image-wrapper">
        <img src="${imagenUrl || 'https://via.placeholder.com/150'}" alt="${nombre}" class="product-image" />
        <span class="badge ${disponible ? 'badge-success' : 'badge-danger'}" id="badge-${id}">
          ${disponible ? `En stock (${stock})` : 'Agotado'}
        </span>
      </div>
      <div class="product-body">
        <h3 class="product-title">${nombre}</h3>
        <p class="product-description">${descripcion}</p>
        <div class="product-footer">
          <span class="product-price">Q.${precio.toFixed(2)}</span>
          <button 
            id="btn-buy-${id}" 
            class="btn ${disponible ? 'btn-primary' : 'btn-disabled'}" 
            ${!disponible ? 'disabled' : ''}>
            ${disponible ? 'Comprar ahora' : 'Agotado'}
          </button>
        </div>
        <div class="product-actions" style="display: flex; gap: 8px; margin-top: 10px;">
          <button id="btn-edit-${id}" class="btn btn-secondary">Editar</button>
          <button id="btn-delete-${id}" class="btn btn-danger">Eliminar</button>
        </div>
      </div>
    `;
  }

  private setupListeners(): void {
    const { id } = this.producto;

    const buyBtn = this.element.querySelector(`#btn-buy-${id}`);
    buyBtn?.addEventListener('click', () => {
      if (this.onBuy) this.onBuy(this.producto);
    });

    const checkBtn = this.element.querySelector(`#btn-check-${id}`);
    checkBtn?.addEventListener('click', () => this.verificarDisponibilidadActualizada());

    const editBtn = this.element.querySelector(`#btn-edit-${id}`);
    editBtn?.addEventListener('click', () => {
      if (this.onEdit) this.onEdit(this.producto);
    });

    const deleteBtn = this.element.querySelector(`#btn-delete-${id}`);
    deleteBtn?.addEventListener('click', () => {
      if (this.onDelete) this.onDelete(id);
    });
  }

  public async verificarDisponibilidadActualizada(): Promise<void> {
    const badge = this.element.querySelector(`#badge-${this.producto.id}`);
    const buyBtn = this.element.querySelector(`#btn-buy-${this.producto.id}`) as HTMLButtonElement;

    if (badge) badge.textContent = 'Verificando...';

    try {
      const res = await this.api.fetchStock(this.producto.id);
      this.producto.stock = res.stockActual;
      this.producto.disponible = res.disponible;

      if (badge) {
        badge.className = `badge ${res.disponible ? 'badge-success' : 'badge-danger'}`;
        badge.textContent = res.disponible ? `En stock (${res.stockActual})` : 'Agotado';
      }

      if (buyBtn) {
        buyBtn.disabled = !res.disponible;
        buyBtn.className = `btn ${res.disponible ? 'btn-primary' : 'btn-disabled'}`;
        buyBtn.textContent = res.disponible ? 'Comprar ahora' : 'Agotado';
      }
    } catch (err) {
      if (badge) badge.textContent = 'Error al consultar';
    }
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}