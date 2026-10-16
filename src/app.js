require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Foto produk dan halaman web bisa diakses dari browser
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Cek apakah server dan database hidup
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'terhubung' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'gagal terhubung', detail: err.message });
  }
});

app.use('/api/products', productRoutes);

// Kalau URL tidak ditemukan
app.use((req, res) => {
  res.status(404).json({ message: 'Alamat tidak ditemukan' });
});

// Penangkap error (termasuk error unggah foto)
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.name === 'MulterError' || err.message.startsWith('Format foto') ? 400 : 500;
  res.status(status).json({ message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});