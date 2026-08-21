import express from 'express';
import cors from 'cors';
import path from 'path';
import productoRoutes from './routes/producto.routes.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Archivos estáticos de la app web frontend
app.use(express.static(path.join(process.cwd(), 'public')));

// API Routes
app.use('/api', productoRoutes);

export default app;
