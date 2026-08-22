import express from 'express';
import cors from 'cors';
import path from 'path';
import productoRoutes from './routes/producto.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Archivos estáticos de la app web frontend
app.use(express.static(path.join(process.cwd(), 'public')));

// API Routes
app.use('/api/productos', productoRoutes);

export default app;
