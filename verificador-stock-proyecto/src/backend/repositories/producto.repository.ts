import { prisma } from '../config/database.js';

export class ProductoRepository {
  async obtenerTodos() {
    return await prisma.producto.findMany({
      orderBy: { creadoEn: 'desc' }
    });
  }

  async obtenerPorId(id: string) {
    return await prisma.producto.findUnique({
      where: { id }
    });
  }
}
