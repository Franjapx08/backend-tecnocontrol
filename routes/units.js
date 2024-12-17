const { Router } = require('express');

const { getAll, create, importUnitEvents, getById, getReport } = require('../controllers/units');
const router = Router();

/* Obtener unidades considerando filtros */
router.get('', getAll);
/* Crear unidades */
router.post('', create);
/* Importar unidades de la API de tecnocontrol */
router.get('/import', importUnitEvents);
/* Obtener reporte de unidades */
router.get('/report', getReport);
/* Obtener unidad by id */
router.get('/:id', getById);

module.exports = router;