export class ApiService {
    baseUrl = '/api';
    async fetchProductos() {
        const res = await fetch(`${this.baseUrl}/productos`);
        if (!res.ok)
            throw new Error('Error al cargar la lista de productos');
        return await res.json();
    }
    async fetchStock(productoId) {
        const res = await fetch(`${this.baseUrl}/productos/${productoId}/stock`);
        if (!res.ok)
            throw new Error('Error al consultar stock del producto');
        return await res.json();
    }
}
