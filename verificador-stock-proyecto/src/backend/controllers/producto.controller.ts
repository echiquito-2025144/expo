import { Request, Response } from 'express';
import { ProductoService } from '../services/producto.service.js';

export class ProductoController {
  private service = new ProductoService();

  obtenerProductos = async (_req: Request, res: Response): Promise<void> => {
    try {
      const productos = await this.service.listarProductos();
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los productos' });
    }
  };

  verificarStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const resultado = await this.service.verificarStock(id);

      if (!resultado) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }

      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: 'Error al verificar disponibilidad de stock' });
    }
  };
}
