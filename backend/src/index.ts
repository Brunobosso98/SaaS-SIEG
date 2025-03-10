import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import database connection
import { testConnection } from './config/database';

// Import model initialization function
import { initializeModels } from './models/init-models';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import cnpjRoutes from './routes/cnpj.routes';
import xmlRoutes from './routes/xml.routes';

// Import XML download scheduler
import { initializeXmlDownloadScheduler } from './scripts/scheduled-xml-download';

// Create Express app
const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set port
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// Initialize model associations
initializeModels();

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
app.listen(PORT, async () => {
  try {
    // Test database connection
    await testConnection();
    console.log(`Server is running on port ${PORT}`);
    
    // Initialize XML download scheduler
    initializeXmlDownloadScheduler();
    console.log('XML download scheduler initialized');
  } catch (error) {
    console.error('Failed to start server:', error);
  }
});