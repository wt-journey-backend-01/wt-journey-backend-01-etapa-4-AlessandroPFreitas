const express = require('express')
const router = express.Router();
const agentesController = require('../controllers/agentesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware ,  agentesController.getAllAgentes);
router.get('/:id', agentesController.getAgenteId);

router.post('/', agentesController.postAgente);

router.put('/:id', agentesController.putAgente);

router.patch('/:id', agentesController.patchAgente);

router.delete('/:id', agentesController.deleteAgente)

module.exports = router