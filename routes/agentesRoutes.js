const express = require('express')
const router = express.Router();
const agentesController = require('../controllers/agentesController');

router.get('/', agentesController.getAllAgentes);
router.get('/:id', agentesController.getAgenteId);

router.post('/', agentesController.postAgente);

router.put('/:id', agentesController.putAgente);

router.patch('/:id', agentesController.patchAgente);

router.delete('/:id', agentesController.deleteAgente)

module.exports = router