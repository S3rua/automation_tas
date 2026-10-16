const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const productController = require('../controllers/productController');

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', upload.single('photo'), productController.create);
router.put('/:id', upload.single('photo'), productController.update);
router.delete('/:id', productController.remove);

module.exports = router;