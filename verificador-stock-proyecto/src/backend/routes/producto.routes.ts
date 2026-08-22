import { Router } from 'express';
import { ProductoController } from '../controllers/producto.controller.js';

const router = Router();
const controller = new ProductoController();

// Rutas base para los productos (se montarán sobre /api/productos en app.ts)
router.get('/', controller.obtenerProductos);
router.post('/', controller.crearProducto);               // 👈 Necesario para + Agregar Producto
router.put('/:id', controller.actualizarProducto);         // 👈 Necesario para Editar
router.delete('/:id', controller.eliminarProducto);       // 👈 Necesario para Eliminar
router.get('/:id/stock', controller.verificarStock);

export default router;