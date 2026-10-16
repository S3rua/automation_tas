const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const STATUS_VALID = ['tersedia', 'habis'];

// Menghapus file foto dari folder uploads (diam-diam kalau file tidak ada)
function hapusFoto(namaFile) {
  if (!namaFile) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(namaFile)), () => {});
}

// Memeriksa data dari pengguna. Mengembalikan { error } atau { data }
function periksaData(body) {
  const name = (body.name || '').trim();
  const category = (body.category || '').trim();
  const price = Number(body.price);
  const stock = body.stock === undefined || body.stock === '' ? 0 : Number(body.stock);
  const availability = body.availability || 'tersedia';

  if (!name) return { error: 'Nama produk wajib diisi' };
  if (!category) return { error: 'Kategori wajib diisi' };
  if (!Number.isInteger(price) || price < 0) {
    return { error: 'Harga harus berupa angka bulat 0 atau lebih' };
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return { error: 'Stok harus berupa angka bulat 0 atau lebih' };
  }
  if (!STATUS_VALID.includes(availability)) {
    return { error: "Status harus 'tersedia' atau 'habis'" };
  }

  return {
    data: {
      name,
      category,
      price,
      stock,
      description: (body.description || '').trim() || null,
      color: (body.color || '').trim() || null,
      availability,
    },
  };
}

// R - Lihat semua produk (boleh difilter ?availability=tersedia&category=Ransel)
exports.getAll = async (req, res, next) => {
  try {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (req.query.availability) {
      sql += ' AND availability = ?';
      params.push(req.query.availability);
    }
    if (req.query.category) {
      sql += ' AND category = ?';
      params.push(req.query.category);
    }
    sql += ' ORDER BY id DESC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// R - Lihat satu produk
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// C - Tambah produk
exports.create = async (req, res, next) => {
  console.log('--- DEBUG create ---');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);

  try {
    // ... kode lama tetap di bawah, jangan diubah
  
    const hasil = periksaData(req.body);
    if (hasil.error) {
      hapusFoto(req.file && req.file.filename);
      return res.status(400).json({ message: hasil.error });
    }

    const d = hasil.data;
    const foto = req.file ? req.file.filename : null;

    const [result] = await db.query(
      `INSERT INTO products
        (name, category, price, stock, description, color, photo, availability)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.name, d.category, d.price, d.stock, d.description, d.color, foto, d.availability]
    );

    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    hapusFoto(req.file && req.file.filename);
    next(err);
  }
};

// U - Edit produk (kirim semua field; foto opsional)
exports.update = async (req, res, next) => {
  try {
    const [lama] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (lama.length === 0) {
      hapusFoto(req.file && req.file.filename);
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    const hasil = periksaData(req.body);
    if (hasil.error) {
      hapusFoto(req.file && req.file.filename);
      return res.status(400).json({ message: hasil.error });
    }

    const d = hasil.data;
    // Kalau tidak ada foto baru, pakai foto lama
    const fotoBaru = req.file ? req.file.filename : lama[0].photo;

    await db.query(
      `UPDATE products
       SET name = ?, category = ?, price = ?, stock = ?,
           description = ?, color = ?, photo = ?, availability = ?
       WHERE id = ?`,
      [d.name, d.category, d.price, d.stock, d.description, d.color, fotoBaru, d.availability, req.params.id]
    );

    // Kalau foto diganti, hapus foto lama dari folder
    if (req.file) hapusFoto(lama[0].photo);

    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    hapusFoto(req.file && req.file.filename);
    next(err);
  }
};

// D - Hapus produk
exports.remove = async (req, res, next) => {
  try {
    const [lama] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (lama.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    hapusFoto(lama[0].photo);

    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    // Error 1451 = produk masih dipakai di catatan promosi
    if (err.errno === 1451) {
      return res.status(409).json({
        message: 'Produk tidak bisa dihapus karena sudah punya catatan promosi. Ubah statusnya menjadi "habis" saja.',
      });
    }
    next(err);
  }
};