const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const cnpjRoutes = require('./routes/cnpj.routes');
const xmlRoutes = require('./routes/xml.routes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set port
const PORT = process.env.PORT || 5000;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cnpjs', cnpjRoutes);
app.use('/api/xml', xmlRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Bem vindo ao XMLFiscal API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});