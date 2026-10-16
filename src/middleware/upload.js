// Mengatur cara foto produk disimpan di folder uploads/
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Nama file dibuat unik supaya tidak bentrok
    const ext = path.extname(file.originalname).toLowerCase();
    const unik = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    cb(null, unik + ext);
  },
});

// Hanya terima foto JPG, PNG, atau WEBP
const fileFilter = (req, file, cb) => {
  const diizinkan = ['image/jpeg', 'image/png', 'image/webp'];
  if (diizinkan.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format foto harus JPG, PNG, atau WEBP'));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // maksimal 5 MB
});