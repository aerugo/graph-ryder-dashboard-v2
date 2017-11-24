'use strict';

import * as auth from '../../auth/auth.service';
let express = require('express');
let controller = require('./tulip.controller');

let router = express.Router();

router.get('/getLayouts', controller.getLayouts);
router.get('/getGraph/random', controller.getRandomGraph);
router.get('/getGraph/', auth.isAuthenticated(), controller.getGraph);
router.get('/getQueryGraph/', auth.isAuthenticated(), controller.getQueryGraph);
router.get('/getGraphNeighboursById/', auth.isAuthenticated(), controller.getNeighboursGraph);

router.post('/drawGraph/:layout', auth.isAuthenticated(), controller.drawGraph);

module.exports = router;
