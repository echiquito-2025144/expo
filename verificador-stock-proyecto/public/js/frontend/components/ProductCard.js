import { ApiService } from '../services/api.service.js';
export class ProductCard {
    producto;
    api = new ApiService();
    element;
    constructor(producto) {
        this.producto = producto;
        this.element = document.createElement('article');
        this.element.className = 'product-card';
        this.element.dataset.id = producto.id;
        this.render();
        this.setupListeners();
    }
    render() {
        const { id, nombre, descripcion, precio, stock, disponible, imagenUrl } = this.producto;
        this.element.innerHTML = `
      <div class="product-image-wrapper">
        <img src="${imagenUrl}" alt="${nombre}" class="product-image" />
        <span class="badge ${disponible ? 'badge-success' : 'badge-danger'}" id="badge-${id}">
          ${disponible ? `En stock (${stock})` : 'Agotado'}
        </span>
      </div>
      <div class="product-body">
        <h3 class="product-title">${nombre}</h3>
        <p class="product-description">${descripcion}</p>
        <div class="product-footer">
          <span class="product-price">$${precio.toFixed(2)}</span>
          <button 
            id="btn-buy-${id}" 
            class="btn ${disponible ? 'btn-primary' : 'btn-disabled'}" 
            ${!disponible ? 'disabled' : ''}>
            ${disponible ? 'Comprar ahora' : 'Agotado'}
          </button>
        </div>
        <button id="btn-check-${id}" class="btn-verify">
          🔄 Verificar Stock en Vivo
        </button>
      </div>
    `;
    }
    setupListeners() {
        const checkBtn = this.element.querySelector(`#btn-check-${this.producto.id}`);
        checkBtn?.addEventListener('click', () => this.verificarDisponibilidadActualizada());
    }
    async verificarDisponibilidadActualizada() {
        const badge = this.element.querySelector(`#badge-${this.producto.id}`);
        const buyBtn = this.element.querySelector(`#btn-buy-${this.producto.id}`);
        if (badge)
            badge.textContent = 'Verificando...';
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
        }
        catch (err) {
            if (badge)
                badge.textContent = 'Error al consultar';
        }
    }
    getElement() {
        return this.element;
    }
}
