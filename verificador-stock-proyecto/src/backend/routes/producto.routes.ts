import { Router } from 'express';
import { ProductoController } from '../controllers/producto.controller.js';

const router = Router();
const controller = new ProductoController();

router.get('/productos', controller.obtenerProductos);
router.get('/productos/:id/stock', controller.verificarStock);

export default router;
