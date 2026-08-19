import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.producto.deleteMany();

  await prisma.producto.createMany({
    data: [
      {
        id: 'prod-1',
        nombre: 'Teclado Mecánico RGB',
        descripcion: 'Teclado mecánico con switches blue y retroiluminación RGB.',
        precio: 89.99,
        stock: 12,
        imagenUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop'
      },
      {
        id: 'prod-2',
        nombre: 'Mouse Gamer Ergonómico',
        descripcion: 'Mouse óptico con sensor de 16,000 DPI y 6 botones programables.',
        precio: 45.50,
        stock: 0, // AGOTADO
        imagenUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop'
      },
      {
        id: 'prod-3',
        nombre: 'Monitor 27" 144Hz 1ms',
        descripcion: 'Monitor IPS Full HD ideal para gaming y desarrollo de software.',
        precio: 249.00,
        stock: 3,
        imagenUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop'
      }
    ]
  });

  console.log('✅ Base de datos poblada exitosamente con productos de prueba.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
