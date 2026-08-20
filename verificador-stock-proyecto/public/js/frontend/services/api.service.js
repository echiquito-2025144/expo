export class ApiService {
    STORAGE_KEY = 'techstore_products';
    initialData = [
        { id: '1', nombre: 'Teclado Mecánico RGB', descripcion: 'Switches blue y retroiluminación RGB.', precio: 89.99, stock: 12, disponible: true, imagenUrl: 'https://via.placeholder.com/150' },
        { id: '2', nombre: 'Mouse Gamer Ergonómico', descripcion: 'Sensor de 16,000 DPI y 6 botones.', precio: 45.50, stock: 0, disponible: false, imagenUrl: 'https://via.placeholder.com/150' },
        { id: '3', nombre: 'Monitor 27" 144Hz 1ms', descripcion: 'Panel IPS Full HD ideal para gaming.', precio: 249.00, stock: 3, disponible: true, imagenUrl: 'https://via.placeholder.com/150' }
    ];
    async fetchProductos() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.initialData));
            return this.initialData;
        }
        return JSON.parse(data);
    }
    async createProducto(datos) {
        const productos = await this.fetchProductos();
        const newProduct = {
            id: Date.now().toString(),
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            precio: datos.precio,
            stock: datos.stock,
            disponible: datos.stock > 0,
            imagenUrl: datos.imagenUrl || 'https://via.placeholder.com/150'
        };
        productos.push(newProduct);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productos));
        return newProduct;
    }
    async updateProducto(id, datos) {
        const productos = await this.fetchProductos();
        const index = productos.findIndex(p => String(p.id) === String(id));
        if (index === -1)
            throw new Error('Producto no encontrado');
        productos[index] = {
            ...productos[index],
            ...datos,
            disponible: datos.stock !== undefined ? datos.stock > 0 : productos[index].disponible
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productos));
        return productos[index];
    }
    async deleteProducto(id) {
        let productos = await this.fetchProductos();
        productos = productos.filter(p => String(p.id) !== String(id));
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productos));
    }
    async fetchStock(id) {
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
    async comprarProducto(id, cantidad) {
        const productos = await this.fetchProductos();
        const producto = productos.find(p => String(p.id) === String(id));
        if (!producto) {
            throw new Error('Producto no encontrado.');
        }
        if (producto.stock < cantidad) {
            throw new Error('Stock insuficiente.');
        }
        const nuevoStock = producto.stock - cantidad;
        return await this.updateProducto(id, { stock: nuevoStock });
    }
}
