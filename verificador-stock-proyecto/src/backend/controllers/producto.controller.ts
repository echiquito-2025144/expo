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

  crearProducto = async (req: Request, res: Response): Promise<void> => {
    try {
      const nuevoProducto = await this.service.crearProducto(req.body);
      res.status(201).json(nuevoProducto);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el producto' });
    }
  };

  actualizarProducto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const productoActualizado = await this.service.actualizarProducto(id, req.body);
      res.json(productoActualizado);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el producto' });
    }
  };

  eliminarProducto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.eliminarProducto(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el producto' });
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