/**
 * Using Rails-like standard naming convention for endpoints.
 * GET    /api/tulips/getGraph/random   ->    Get a random graph from tulip
 */

'use strict';

let request = require('request');

export function getRandomGraph(req, res) {
  request('http://localhost:5000/getGraph/random', function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getGraph(req, res) {
  request('http://localhost:5000/getGraph/' + req.param('url'), function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}
