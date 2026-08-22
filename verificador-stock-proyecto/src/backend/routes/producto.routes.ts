import { Router } from 'express';
import { ProductoController } from '../controllers/producto.controller.js';

const router = Router();
const controller = new ProductoController();

// Rutas declaradas con '/productos'
router.get('/productos', controller.obtenerProductos);
router.post('/productos', controller.crearProducto);
router.put('/productos/:id', controller.actualizarProducto);
router.delete('/productos/:id', controller.eliminarProducto);
router.get('/productos/:id/stock', controller.verificarStock);

export default router;