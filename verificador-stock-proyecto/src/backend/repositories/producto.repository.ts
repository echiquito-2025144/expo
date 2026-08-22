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

  async crear(datos: { nombre: string; descripcion?: string; precio: number; stock: number; imagenUrl?: string }) {
    return await prisma.producto.create({
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion || '',
        precio: Number(datos.precio),
        stock: Number(datos.stock),
        disponible: Number(datos.stock) > 0,
        imagenUrl: datos.imagenUrl || 'https://via.placeholder.com/150'
      }
    });
  }

  async actualizar(id: string, datos: Partial<{ nombre: string; descripcion: string; precio: number; stock: number; imagenUrl: string; disponible: boolean }>) {
    return await prisma.producto.update({
      where: { id },
      data: {
        ...datos,
        ...(datos.precio !== undefined && { precio: Number(datos.precio) }),
        ...(datos.stock !== undefined && { 
          stock: Number(datos.stock),
          disponible: Number(datos.stock) > 0 
        })
      }
    });
  }

  async eliminar(id: string) {
    return await prisma.producto.delete({
      where: { id }
    });
  }
}