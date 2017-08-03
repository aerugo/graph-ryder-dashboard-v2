'use strict';

let express = require('express');
let router = express.Router();
let controller = require('./data.controller');

router.get('/get/:id', controller.show);
// router.post('/', controller.create);
// router.put('/:id', controller.upsert);
// router.patch('/:id', controller.patch);
// router.delete('/:id', controller.destroy);

module.exports = router;
