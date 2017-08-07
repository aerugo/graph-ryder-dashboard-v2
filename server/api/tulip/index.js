'use strict';

import * as auth from '../../auth/auth.service';
let express = require('express');
let controller = require('./tulip.controller');

let router = express.Router();

router.get('/getGraph/random', controller.getRandomGraph);
router.get('/', auth.isAuthenticated(), controller.getGraph);

module.exports = router;
