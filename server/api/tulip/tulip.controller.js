/**
 * Using Rails-like standard naming convention for endpoints.
 * GET    /api/tulips/getGraph/random   ->    Get a random graph from tulip
 */

'use strict';

let request = require('request');
import config from '../..//config/environment';

export function getLayouts(req, res) {
  request(config.tulipApi + '/layoutAlgorithm', function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getRandomGraph(req, res) {
  request(config.tulipApi + '/getGraph/random', function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getGraph(req, res) {
  let queryString = {};
  Object.keys(req.query).forEach(function(param) {
    if(param != 'url') {
      queryString[param] = req.query[param];
    }
  });
  request({url: config.tulipApi + '/' + req.param('url'), qs: queryString}, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}
