'use strict';

let express = require('express');
let router = express.Router();
let controller = require('./data.controller');
import * as auth from '../../auth/auth.service';

router.get('/getProperties/:id', auth.isAuthenticated(), controller.getProperties);
router.get('/getAttributes/:id', auth.isAuthenticated(), controller.getAttributes);
router.get('/getLabels/', auth.isAuthenticated(), controller.getLabels);
router.get('/countLabel/:label', auth.isAuthenticated(), controller.countLabel);
router.get('/countLabels/', auth.isAuthenticated(), controller.countLabels);
router.get('/getLabelsHierarchy/', auth.isAuthenticated(), controller.getLabelsHierarchy);
router.get('/getLabels/:id', auth.isAuthenticated(), controller.getLabelsById);
router.get('/getPropertiesByLabel/:label', auth.isAuthenticated(), controller.getPropertiesByLabel);
router.get('/getPropertyValue/:label/:key', auth.isAuthenticated(), controller.getPropertyValue);
router.get('/getPropertyValueAndId/:label/:key', auth.isAuthenticated(), controller.getPropertyValueAndId);
router.post('/createNode', auth.isAuthenticated(), controller.createNode);
router.post('/createEdge', auth.isAuthenticated(), controller.createEdge);
router.put('/set/:id', auth.isAuthenticated(), controller.set);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
