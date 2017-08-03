/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/data              ->  index
 * POST    /api/data              ->  create
 * GET     /api/data/:id          ->  show
 * PUT     /api/data/:id          ->  upsert
 * PATCH   /api/data/:id          ->  patch
 * DELETE  /api/data/:id          ->  destroy
 */

'use strict';

let request = require('request');

export function show(req, res) {
  request({url: 'http://localhost:5000/get/' + req.param('id'), qs: {keys: "*"}}, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}


