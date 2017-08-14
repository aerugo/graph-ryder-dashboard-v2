'use strict';

let express = require('express');
let router = express.Router();
let controller = require('./data.controller');

router.get('/get/:id', controller.get);
router.get('/getLabels/', controller.getLabels);
router.get('/getLabelsHierarchy/', controller.getLabelsHierarchy);
router.get('/getLabels/:id', controller.getLabelsById);
router.get('/getProperties/:label', controller.getProperties);
router.get('/getPropertyValue/:label/:key', controller.getPropertyValue);
// router.post('/', controller.create);
// router.put('/:id', controller.upsert);
// router.patch('/:id', controller.patch);
// router.delete('/:id', controller.destroy);

module.exports = router;
