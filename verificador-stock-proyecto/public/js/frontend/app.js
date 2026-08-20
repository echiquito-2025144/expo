import { ApiService } from './services/api.service.js';
import { ProductCard } from './components/ProductCard.js';
class App {
    api = new ApiService();
    gridContainer = document.getElementById('products-grid');
    viewCatalog = document.getElementById('view-catalog');
    viewForm = document.getElementById('view-form');
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
                const card = new ProductCard(productoDTO, (p) => this.openEditModal(p), (id) => this.handleDelete(Number(id)), (p) => this.handleBuy(p) // Callback para procesar la compra
                );
                this.gridContainer?.appendChild(card.getElement());
            });
        }
        catch (error) {
            this.gridContainer.innerHTML = '<p class="error">Error al cargar la tienda.</p>';
        }
    }
    // Métodos auxiliares para alternar la vista activa
    showFormView(title) {
        if (this.viewCatalog && this.viewForm) {
            this.viewCatalog.style.display = 'none';
            this.viewForm.style.display = 'block';
        }
        const formTitle = document.getElementById('form-title');
        if (formTitle)
            formTitle.innerText = title;
    }
    showCatalogView() {
        if (this.viewCatalog && this.viewForm) {
            this.viewForm.style.display = 'none';
            this.viewCatalog.style.display = 'block';
        }
        this.form.reset();
        this.editingId = null;
    }
    setupEventListeners() {
        this.btnNuevo?.addEventListener('click', () => this.openCreateModal());
        // Controles para regresar desde el formulario
        document.getElementById('btn-back')?.addEventListener('click', () => this.showCatalogView());
        document.getElementById('btn-cancel')?.addEventListener('click', () => this.showCatalogView());
        this.form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit();
        });
    }
    openCreateModal() {
        this.editingId = null;
        this.form.reset();
        this.showFormView('Nuevo Producto');
    }
    openEditModal(product) {
        this.editingId = Number(product.id);
        document.getElementById('prod-nombre').value = product.nombre;
        document.getElementById('prod-desc').value = product.descripcion;
        document.getElementById('prod-precio').value = product.precio.toString();
        document.getElementById('prod-stock').value = product.stock.toString();
        const imgInput = document.getElementById('prod-imagen');
        if (imgInput)
            imgInput.value = product.imagenUrl || '';
        this.showFormView('Editar Producto');
    }
    async handleFormSubmit() {
        const nombre = document.getElementById('prod-nombre').value;
        const descripcion = document.getElementById('prod-desc').value;
        const precio = parseFloat(document.getElementById('prod-precio').value);
        const stock = parseInt(document.getElementById('prod-stock').value, 10);
        const imagenUrlInput = document.getElementById('prod-imagen')?.value || '';
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
            else {
                await this.api.updateProducto(this.editingId, payload);
            }
            this.showCatalogView();
            await this.loadProducts();
        }
        catch (error) {
            console.error('Error al guardar producto:', error);
        }
    }
    async handleBuy(product) {
        if (product.stock <= 0) {
            alert('Este producto no tiene unidades disponibles.');
            return;
        }
        const input = prompt(`¿Cuántas unidades de "${product.nombre}" deseas comprar?\nStock disponible: ${product.stock}`, '1');
        if (input === null)
            return;
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
        }
        catch (error) {
            console.error('Error al procesar la compra:', error);
            alert('Ocurrió un error al procesar la compra.');
        }
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
