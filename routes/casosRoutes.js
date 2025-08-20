const express = require('express')
const router = express.Router();
const casosController = require('../controllers/casosController');

router.get('/', casosController.getAllCasos);
router.get('/:id', casosController.getCasoId);

router.post('/', casosController.postCaso);

router.put('/:id', casosController.putCaso);

router.patch('/:id', casosController.patchCaso);

router.delete('/:id', casosController.deleteCaso);

module.exports = router