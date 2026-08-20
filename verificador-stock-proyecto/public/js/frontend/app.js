import { ApiService } from './services/api.service.js';
import { ProductCard } from './components/ProductCard.js';
class App {
    api = new ApiService();
    gridContainer = document.getElementById('products-grid');
    modal = document.getElementById('product-modal');
    form = document.getElementById('product-form');
    btnNuevo = document.getElementById('btn-nuevo');
    editingId = null;
    async init() {
        this.setupEventListeners();
        await this.loadProducts();
    }
    async loadProducts() {
        if (!this.gridContainer)
            return;
        try {
            this.gridContainer.innerHTML = '<p class="loading">Cargando catálogo...</p>';
            const productos = await this.api.fetchProductos();
            this.gridContainer.innerHTML = '';
            if (productos.length === 0) {
                this.gridContainer.innerHTML = '<p class="empty">No hay productos disponibles.</p>';
                return;
            }
            productos.forEach(prod => {
                const productoDTO = {
                    ...prod,
                    id: String(prod.id),
                    disponible: prod.stock > 0,
                    imagenUrl: prod.imagenUrl || 'https://via.placeholder.com/150'
                };
                const card = new ProductCard(productoDTO, (p) => this.openEditModal(p), (id) => this.handleDelete(Number(id)) // Conversión explícita a number
                );
                this.gridContainer?.appendChild(card.getElement());
            });
        }
        catch (error) {
            this.gridContainer.innerHTML = '<p class="error">Error al cargar la tienda.</p>';
        }
    }
    setupEventListeners() {
        this.btnNuevo?.addEventListener('click', () => this.openCreateModal());
        document.getElementById('btn-close')?.addEventListener('click', () => this.closeModal());
        this.form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit();
        });
    }
    openCreateModal() {
        this.editingId = null;
        this.form.reset();
        document.getElementById('modal-title').innerText = 'Nuevo Producto';
        this.modal.classList.add('active');
    }
    openEditModal(product) {
        this.editingId = Number(product.id);
        document.getElementById('prod-nombre').value = product.nombre;
        document.getElementById('prod-desc').value = product.descripcion;
        document.getElementById('prod-precio').value = product.precio.toString();
        document.getElementById('prod-stock').value = product.stock.toString();
        document.getElementById('modal-title').innerText = 'Editar Producto';
        this.modal.classList.add('active');
    }
    closeModal() {
        this.modal.classList.remove('active');
    }
    async handleFormSubmit() {
        const nombre = document.getElementById('prod-nombre').value;
        const descripcion = document.getElementById('prod-desc').value;
        const precio = parseFloat(document.getElementById('prod-precio').value);
        const stock = parseInt(document.getElementById('prod-stock').value, 10);
        const payload = { nombre, descripcion, precio, stock };
        if (this.editingId !== null) {
            await this.api.updateProducto(this.editingId, payload);
        }
        else {
            await this.api.createProducto(payload);
        }
        this.closeModal();
        await this.loadProducts();
    }
    async handleDelete(id) {
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
