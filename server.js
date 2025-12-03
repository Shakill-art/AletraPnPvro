const express = require('express');
const path = require('path');
const app = express();
const PORT = 3050;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas estáticas
app.use(express.static(__dirname));

// Rutas MVC
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Rutas de páginas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/ciudadano', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'ciudadano.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Para acceder desde tu teléfono, usa http://192.168.137.220:${PORT}`);
});