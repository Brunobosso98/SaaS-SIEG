import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import cnpjRoutes from './routes/cnpj.routes';
import xmlRoutes from './routes/xml.routes';

// Create Express app
const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set port
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cnpjs', cnpjRoutes);
app.use('/api/xml', xmlRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to XMLFiscal API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});