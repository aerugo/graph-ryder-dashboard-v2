'use strict';

let express = require('express');
let router = express.Router();
let controller = require('./data.controller');
import * as auth from '../../auth/auth.service';

router.get('/get/:id', auth.isAuthenticated(), controller.get);
router.get('/getLabels/', auth.isAuthenticated(), controller.getLabels);
router.get('/countLabel/:label', auth.isAuthenticated(), controller.countLabel);
router.get('/countLabels/', auth.isAuthenticated(), controller.countLabels);
router.get('/getLabelsHierarchy/', auth.isAuthenticated(), controller.getLabelsHierarchy);
router.get('/getLabels/:id', auth.isAuthenticated(), controller.getLabelsById);
router.get('/getProperties/:label', auth.isAuthenticated(), controller.getProperties);
router.get('/getPropertyValue/:label/:key', auth.isAuthenticated(), controller.getPropertyValue);
router.post('/create', controller.create);
router.put('/set/:id', auth.isAuthenticated(), controller.set);
// router.patch('/:id', controller.patch);
// router.delete('/:id', controller.destroy);

module.exports = router;
